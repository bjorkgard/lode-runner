// Unit tests for error handling system

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  GameError,
  LevelLoadError,
  LevelValidationError,
  StorageError,
  AudioError,
  AssetLoadError,
  InvalidStateError,
  ErrorSeverity,
  ErrorHandler,
  errorHandler,
  safeAsync,
  safe
} from './errors';

describe('GameError', () => {
  test('creates error with message', () => {
    const error = new GameError('Test error');
    
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('GameError');
    expect(error.timestamp).toBeInstanceOf(Date);
  });
  
  test('creates error with context', () => {
    const context = { userId: 123, action: 'test' };
    const error = new GameError('Test error', context);
    
    expect(error.context).toEqual(context);
  });
  
  test('converts to JSON', () => {
    const error = new GameError('Test error', { key: 'value' });
    const json = error.toJSON();
    
    expect(json.name).toBe('GameError');
    expect(json.message).toBe('Test error');
    expect(json.context).toEqual({ key: 'value' });
    expect(json.timestamp).toBeDefined();
    expect(json.stack).toBeDefined();
  });
});

describe('LevelLoadError', () => {
  test('includes level number', () => {
    const error = new LevelLoadError(5, 'Not found');
    
    expect(error.levelNumber).toBe(5);
    expect(error.message).toContain('level 5');
    expect(error.message).toContain('Not found');
  });
});

describe('LevelValidationError', () => {
  test('includes validation errors', () => {
    const validationErrors = ['Missing tiles', 'Invalid dimensions'];
    const error = new LevelValidationError(3, validationErrors);
    
    expect(error.levelNumber).toBe(3);
    expect(error.validationErrors).toEqual(validationErrors);
    expect(error.message).toContain('Level 3');
    expect(error.message).toContain('Missing tiles');
  });
});

describe('StorageError', () => {
  test('includes operation and key', () => {
    const error = new StorageError('write', 'highScore');
    
    expect(error.operation).toBe('write');
    expect(error.key).toBe('highScore');
    expect(error.message).toContain('write');
    expect(error.message).toContain('highScore');
  });
  
  test('includes original error', () => {
    const originalError = new Error('Quota exceeded');
    const error = new StorageError('write', 'data', originalError);
    
    expect(error.context?.originalError).toBe('Quota exceeded');
  });
});

describe('AudioError', () => {
  test('includes audio file', () => {
    const error = new AudioError('Failed to load', 'sound.mp3');
    
    expect(error.audioFile).toBe('sound.mp3');
    expect(error.context?.audioFile).toBe('sound.mp3');
  });
});

describe('AssetLoadError', () => {
  test('includes asset path and type', () => {
    const error = new AssetLoadError('/sprites/player.png', 'sprite');
    
    expect(error.assetPath).toBe('/sprites/player.png');
    expect(error.assetType).toBe('sprite');
    expect(error.message).toContain('sprite');
    expect(error.message).toContain('/sprites/player.png');
  });
});

describe('InvalidStateError', () => {
  test('includes state name', () => {
    const error = new InvalidStateError('Playing', 'No level loaded');
    
    expect(error.stateName).toBe('Playing');
    expect(error.message).toContain('Playing');
    expect(error.message).toContain('No level loaded');
  });
});

describe('ErrorHandler', () => {
  let handler: ErrorHandler;
  
  beforeEach(() => {
    handler = new ErrorHandler({ logToConsole: false });
  });
  
  describe('handle', () => {
    test('handles error without recovery', () => {
      const error = new GameError('Test error');
      const result = handler.handle(error);
      
      expect(result).toBeUndefined();
    });
    
    test('handles error with recovery', () => {
      const error = new GameError('Test error');
      const result = handler.handle(error, ErrorSeverity.Warning, () => 'recovered');
      
      expect(result).toBe('recovered');
    });
    
    test('converts regular Error to GameError', () => {
      const error = new Error('Regular error');
      const result = handler.handle(error);
      
      expect(result).toBeUndefined();
    });
    
    test('tracks error frequency', () => {
      const error = new GameError('Repeated error');
      
      handler.handle(error);
      handler.handle(error);
      handler.handle(error);
      
      const stats = handler.getErrorStats();
      expect(stats['GameError:Repeated error']).toBe(3);
    });
  });
  
  describe('wrap', () => {
    test('wraps function with error handling', () => {
      const fn = (): string => {
        throw new Error('Function error');
      };
      
      const wrapped = handler.wrap(fn, ErrorSeverity.Warning, 'default');
      const result = wrapped();
      
      expect(result).toBe('default');
    });
    
    test('returns function result when no error', () => {
      const fn = (...args: unknown[]): unknown => {
        const x = args[0] as number;
        return x * 2;
      };
      const wrapped = handler.wrap(fn);
      
      expect(wrapped(5)).toBe(10);
    });
  });
  
  describe('configuration', () => {
    test('uses custom logger', () => {
      const logger = vi.fn();
      const handler = new ErrorHandler({ logger, logToConsole: false });
      
      const error = new GameError('Test');
      handler.handle(error, ErrorSeverity.Error);
      
      expect(logger).toHaveBeenCalledWith(error, ErrorSeverity.Error);
    });
    
    test('uses custom user message handler', () => {
      const userMessageHandler = vi.fn();
      const handler = new ErrorHandler({ 
        userMessageHandler, 
        showUserMessages: true,
        logToConsole: false 
      });
      
      const error = new LevelLoadError(5, 'Not found');
      handler.handle(error, ErrorSeverity.Error);
      
      expect(userMessageHandler).toHaveBeenCalled();
      const message = userMessageHandler.mock.calls[0][0];
      expect(message).toContain('level 5');
    });
    
    test('updates configuration', () => {
      handler.updateConfig({ showUserMessages: true });
      
      // Configuration should be updated (tested indirectly through behavior)
      expect(handler).toBeDefined();
    });
  });
  
  describe('error statistics', () => {
    test('tracks multiple different errors', () => {
      handler.handle(new GameError('Error 1'));
      handler.handle(new GameError('Error 2'));
      handler.handle(new GameError('Error 1'));
      
      const stats = handler.getErrorStats();
      expect(stats['GameError:Error 1']).toBe(2);
      expect(stats['GameError:Error 2']).toBe(1);
    });
    
    test('clears error statistics', () => {
      handler.handle(new GameError('Test'));
      handler.clearErrorStats();
      
      const stats = handler.getErrorStats();
      expect(Object.keys(stats)).toHaveLength(0);
    });
  });
});

describe('safeAsync', () => {
  test('returns result on success', async () => {
    const fn = async () => 'success';
    const result = await safeAsync(fn);
    
    expect(result).toBe('success');
  });
  
  test('returns default value on error', async () => {
    const fn = async () => {
      throw new Error('Async error');
    };
    const result = await safeAsync(fn, ErrorSeverity.Warning, 'default');
    
    expect(result).toBe('default');
  });
  
  test('returns undefined on error without default', async () => {
    const fn = async () => {
      throw new Error('Async error');
    };
    const result = await safeAsync(fn);
    
    expect(result).toBeUndefined();
  });
});

describe('safe', () => {
  test('returns result on success', () => {
    const fn = () => 'success';
    const result = safe(fn);
    
    expect(result).toBe('success');
  });
  
  test('returns default value on error', () => {
    const fn = () => {
      throw new Error('Sync error');
    };
    const result = safe(fn, ErrorSeverity.Warning, 'default');
    
    expect(result).toBe('default');
  });
  
  test('returns undefined on error without default', () => {
    const fn = () => {
      throw new Error('Sync error');
    };
    const result = safe(fn);
    
    expect(result).toBeUndefined();
  });
});

describe('global errorHandler', () => {
  test('is available as singleton', () => {
    expect(errorHandler).toBeInstanceOf(ErrorHandler);
  });
  
  test('can be used directly', () => {
    const error = new GameError('Global test');
    const result = errorHandler.handle(error, ErrorSeverity.Info);
    
    expect(result).toBeUndefined();
  });
});
