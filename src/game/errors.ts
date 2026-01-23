// Error handling system for Lode Runner

/**
 * Base class for all game-specific errors.
 * Extends Error with additional context for debugging and logging.
 */
export class GameError extends Error {
  /** Timestamp when the error occurred */
  readonly timestamp: Date;
  /** Additional context data for debugging */
  readonly context?: Record<string, unknown>;
  
  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.context = context;
    
    // Maintains proper stack trace for where error was thrown (V8 only)
    type CaptureStackTrace = (target: object, constructor: new (...args: unknown[]) => unknown) => void;
    const ErrorWithCapture = Error as unknown as { captureStackTrace?: CaptureStackTrace };
    
    if (typeof ErrorWithCapture.captureStackTrace === 'function') {
      ErrorWithCapture.captureStackTrace(this, this.constructor as new (...args: unknown[]) => unknown);
    }
  }
  
  /**
   * Converts error to a loggable object.
   * Useful for structured logging and debugging.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      stack: this.stack
    };
  }
}

/**
 * Error thrown when attempting to load an invalid level.
 */
export class LevelLoadError extends GameError {
  readonly levelNumber: number;
  
  constructor(levelNumber: number, reason: string, context?: Record<string, unknown>) {
    super(`Failed to load level ${levelNumber}: ${reason}`, {
      ...context,
      levelNumber
    });
    this.levelNumber = levelNumber;
  }
}

/**
 * Error thrown when level data validation fails.
 */
export class LevelValidationError extends GameError {
  readonly levelNumber: number;
  readonly validationErrors: string[];
  
  constructor(levelNumber: number, validationErrors: string[]) {
    super(
      `Level ${levelNumber} validation failed: ${validationErrors.join(', ')}`,
      { levelNumber, validationErrors }
    );
    this.levelNumber = levelNumber;
    this.validationErrors = validationErrors;
  }
}

/**
 * Error thrown when localStorage operations fail.
 */
export class StorageError extends GameError {
  readonly operation: 'read' | 'write' | 'delete';
  readonly key: string;
  
  constructor(operation: 'read' | 'write' | 'delete', key: string, originalError?: Error) {
    super(
      `Storage ${operation} failed for key "${key}"`,
      { operation, key, originalError: originalError?.message }
    );
    this.operation = operation;
    this.key = key;
  }
}

/**
 * Error thrown when audio operations fail.
 */
export class AudioError extends GameError {
  readonly audioFile?: string;
  
  constructor(message: string, audioFile?: string, originalError?: Error) {
    super(message, { audioFile, originalError: originalError?.message });
    this.audioFile = audioFile;
  }
}

/**
 * Error thrown when sprite/asset loading fails.
 */
export class AssetLoadError extends GameError {
  readonly assetPath: string;
  readonly assetType: 'sprite' | 'audio' | 'other';
  
  constructor(assetPath: string, assetType: 'sprite' | 'audio' | 'other', originalError?: Error) {
    super(
      `Failed to load ${assetType} asset: ${assetPath}`,
      { assetPath, assetType, originalError: originalError?.message }
    );
    this.assetPath = assetPath;
    this.assetType = assetType;
  }
}

/**
 * Error thrown when game state becomes invalid.
 */
export class InvalidStateError extends GameError {
  readonly stateName: string;
  
  constructor(stateName: string, reason: string) {
    super(`Invalid game state "${stateName}": ${reason}`, { stateName });
    this.stateName = stateName;
  }
}

/**
 * Error severity levels for logging and handling.
 */
export const ErrorSeverity = {
  /** Informational - no action needed */
  Info: 'info',
  /** Warning - degraded functionality but game continues */
  Warning: 'warning',
  /** Error - feature broken but game can continue */
  Error: 'error',
  /** Critical - game cannot continue */
  Critical: 'critical'
} as const;

export type ErrorSeverity = typeof ErrorSeverity[keyof typeof ErrorSeverity];

/**
 * Error handler configuration.
 */
export interface ErrorHandlerConfig {
  /** Whether to log errors to console */
  logToConsole: boolean;
  /** Whether to show user-friendly error messages */
  showUserMessages: boolean;
  /** Custom error logger function */
  logger?: (error: GameError, severity: ErrorSeverity) => void;
  /** Custom user message handler */
  userMessageHandler?: (message: string, severity: ErrorSeverity) => void;
}

/**
 * Default error handler configuration.
 */
const DEFAULT_CONFIG: ErrorHandlerConfig = {
  logToConsole: true,
  showUserMessages: false,
  logger: undefined,
  userMessageHandler: undefined
};

/**
 * Global error handler for the game.
 * Provides centralized error logging, recovery, and user notification.
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private errorCount: Map<string, number> = new Map();
  
  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Handles an error with appropriate logging and recovery.
   * 
   * @param error - The error to handle
   * @param severity - Severity level of the error
   * @param recoveryAction - Optional recovery function to attempt
   * @returns Result of recovery action, or undefined if no recovery
   */
  handle<T>(
    error: Error,
    severity: ErrorSeverity = ErrorSeverity.Error,
    recoveryAction?: () => T
  ): T | undefined {
    // Convert to GameError if needed
    const gameError = error instanceof GameError 
      ? error 
      : new GameError(error.message, { originalError: error.name });
    
    // Track error frequency
    this.trackError(gameError);
    
    // Log error
    this.logError(gameError, severity);
    
    // Show user message if configured
    if (this.config.showUserMessages) {
      this.showUserMessage(gameError, severity);
    }
    
    // Attempt recovery if provided
    if (recoveryAction) {
      try {
        return recoveryAction();
      } catch (recoveryError) {
        this.logError(
          new GameError('Recovery action failed', { 
            originalError: gameError.message,
            recoveryError: recoveryError instanceof Error ? recoveryError.message : String(recoveryError)
          }),
          ErrorSeverity.Critical
        );
      }
    }
    
    return undefined;
  }
  
  /**
   * Wraps a function with error handling.
   * Useful for wrapping event handlers and callbacks.
   * 
   * @param fn - Function to wrap
   * @param severity - Error severity if function throws
   * @param recoveryValue - Value to return if function throws
   * @returns Wrapped function that handles errors
   */
  wrap<T extends (...args: unknown[]) => unknown>(
    fn: T,
    severity: ErrorSeverity = ErrorSeverity.Error,
    recoveryValue?: ReturnType<T>
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        return fn(...args);
      } catch (error) {
        return this.handle(
          error instanceof Error ? error : new Error(String(error)),
          severity,
          () => recoveryValue
        );
      }
    }) as T;
  }
  
  /**
   * Tracks error frequency for detecting recurring issues.
   */
  private trackError(error: GameError): void {
    const key = `${error.name}:${error.message}`;
    const count = (this.errorCount.get(key) || 0) + 1;
    this.errorCount.set(key, count);
    
    // Warn about recurring errors
    if (count === 5) {
      console.warn(`Error occurred 5 times: ${error.name} - ${error.message}`);
    } else if (count === 10) {
      console.error(`Error occurred 10 times: ${error.name} - ${error.message}`);
    }
  }
  
  /**
   * Logs error to console or custom logger.
   */
  private logError(error: GameError, severity: ErrorSeverity): void {
    if (this.config.logger) {
      this.config.logger(error, severity);
      return;
    }
    
    if (!this.config.logToConsole) {
      return;
    }
    
    const logData = error.toJSON();
    
    switch (severity) {
      case ErrorSeverity.Info:
        console.info('[Game Info]', logData);
        break;
      case ErrorSeverity.Warning:
        console.warn('[Game Warning]', logData);
        break;
      case ErrorSeverity.Error:
        console.error('[Game Error]', logData);
        break;
      case ErrorSeverity.Critical:
        console.error('[Game Critical]', logData);
        break;
    }
  }
  
  /**
   * Shows user-friendly error message.
   */
  private showUserMessage(error: GameError, severity: ErrorSeverity): void {
    const message = this.getUserFriendlyMessage(error);
    
    if (this.config.userMessageHandler) {
      this.config.userMessageHandler(message, severity);
    } else {
      // Fallback to alert for critical errors
      if (severity === ErrorSeverity.Critical) {
        alert(message);
      }
    }
  }
  
  /**
   * Converts technical error to user-friendly message.
   */
  private getUserFriendlyMessage(error: GameError): string {
    if (error instanceof LevelLoadError) {
      return `Unable to load level ${error.levelNumber}. The game will try to continue.`;
    }
    
    if (error instanceof StorageError) {
      return 'Unable to save your progress. Your high score may not be saved.';
    }
    
    if (error instanceof AudioError) {
      return 'Audio playback is unavailable. The game will continue without sound.';
    }
    
    if (error instanceof AssetLoadError) {
      return 'Some game assets failed to load. Graphics may appear incorrect.';
    }
    
    if (error instanceof InvalidStateError) {
      return 'The game encountered an unexpected error. Please restart the game.';
    }
    
    return 'An unexpected error occurred. The game will try to continue.';
  }
  
  /**
   * Gets error statistics for debugging.
   */
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCount);
  }
  
  /**
   * Clears error statistics.
   */
  clearErrorStats(): void {
    this.errorCount.clear();
  }
  
  /**
   * Updates error handler configuration.
   */
  updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Global error handler instance.
 * Can be configured at application startup.
 */
export const errorHandler = new ErrorHandler();

/**
 * Utility function for safe async operations.
 * Wraps async functions with error handling.
 * 
 * @param fn - Async function to execute
 * @param severity - Error severity if function throws
 * @param defaultValue - Default value to return on error
 * @returns Promise resolving to function result or default value
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  severity: ErrorSeverity = ErrorSeverity.Error,
  defaultValue?: T
): Promise<T | undefined> {
  try {
    return await fn();
  } catch (error) {
    return errorHandler.handle(
      error instanceof Error ? error : new Error(String(error)),
      severity,
      () => defaultValue
    );
  }
}

/**
 * Utility function for safe synchronous operations.
 * Wraps functions with error handling.
 * 
 * @param fn - Function to execute
 * @param severity - Error severity if function throws
 * @param defaultValue - Default value to return on error
 * @returns Function result or default value
 */
export function safe<T>(
  fn: () => T,
  severity: ErrorSeverity = ErrorSeverity.Error,
  defaultValue?: T
): T | undefined {
  try {
    return fn();
  } catch (error) {
    return errorHandler.handle(
      error instanceof Error ? error : new Error(String(error)),
      severity,
      () => defaultValue
    );
  }
}
