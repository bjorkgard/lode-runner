import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree.
 * Displays a fallback UI instead of crashing the entire application.
 * 
 * Features:
 * - Catches errors during rendering, in lifecycle methods, and in constructors
 * - Displays user-friendly error message with reload option
 * - Logs error details to console for debugging
 * - Provides graceful degradation for better UX
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 * 
 * Note: Error boundaries do NOT catch errors in:
 * - Event handlers (use try-catch instead)
 * - Asynchronous code (setTimeout, requestAnimationFrame)
 * - Server-side rendering
 * - Errors thrown in the error boundary itself
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }
  
  /**
   * Static method called when an error is thrown in a descendant component.
   * Updates state to trigger fallback UI rendering.
   * 
   * @param error - The error that was thrown
   * @returns New state with error information
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }
  
  /**
   * Lifecycle method called after an error has been thrown.
   * Used for logging error information.
   * 
   * @param error - The error that was thrown
   * @param errorInfo - Object with componentStack key containing information about component stack
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details to console for debugging
    console.error('Game Error Boundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Store error info in state for display
    this.setState({
      errorInfo: errorInfo.componentStack || null
    });
    
    // In production, you might want to send this to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }
  
  /**
   * Resets the error boundary state and reloads the page.
   * Provides a fresh start for the user.
   */
  private handleReload = (): void => {
    window.location.reload();
  };
  
  /**
   * Resets the error boundary state without reloading.
   * Attempts to recover by re-rendering the children.
   */
  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };
  
  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 text-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
            {/* Error Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-4xl">⚠️</span>
              </div>
            </div>
            
            {/* Error Title */}
            <h1 className="text-3xl font-bold mb-4 text-center text-red-500">
              Oops! Something Went Wrong
            </h1>
            
            {/* Error Message */}
            <p className="text-lg mb-6 text-center text-gray-300">
              The game encountered an unexpected error and needs to restart.
            </p>
            
            {/* Error Details (collapsible) */}
            {this.state.error && (
              <details className="mb-6 bg-gray-900 p-4 rounded border border-gray-700">
                <summary className="cursor-pointer text-sm font-semibold text-gray-400 hover:text-gray-300">
                  Technical Details (for developers)
                </summary>
                <div className="mt-4 space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-1">Error:</p>
                    <pre className="text-xs text-gray-300 overflow-x-auto bg-gray-950 p-2 rounded">
                      {this.state.error.toString()}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1">Stack Trace:</p>
                      <pre className="text-xs text-gray-300 overflow-x-auto bg-gray-950 p-2 rounded max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div>
                      <p className="text-xs font-semibold text-red-400 mb-1">Component Stack:</p>
                      <pre className="text-xs text-gray-300 overflow-x-auto bg-gray-950 p-2 rounded max-h-40">
                        {this.state.errorInfo}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 active:bg-blue-700 transition-colors font-semibold text-lg"
              >
                🔄 Reload Game
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 active:bg-gray-800 transition-colors font-semibold text-lg"
              >
                🔧 Try Again
              </button>
            </div>
            
            {/* Help Text */}
            <p className="text-sm text-gray-500 text-center mt-6">
              If this problem persists, try clearing your browser cache or using a different browser.
            </p>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
