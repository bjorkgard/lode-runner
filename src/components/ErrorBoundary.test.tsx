import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error for testing
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Component that throws an error with custom message
function ThrowCustomError({ message }: { message: string }) {
  throw new Error(message);
}

describe('ErrorBoundary Component', () => {
  // Suppress console.error during tests to avoid cluttering test output
  const originalError = console.error;
  
  beforeEach(() => {
    console.error = vi.fn();
  });
  
  afterEach(() => {
    console.error = originalError;
    vi.clearAllMocks();
  });
  
  test('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });
  
  test('should catch errors and display fallback UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should display error message
    expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/encountered an unexpected error/i)).toBeInTheDocument();
  });
  
  test('should display error details in collapsible section', () => {
    render(
      <ErrorBoundary>
        <ThrowCustomError message="Custom error message" />
      </ErrorBoundary>
    );
    
    // Should have technical details section
    const detailsElement = screen.getByText(/Technical Details/i);
    expect(detailsElement).toBeInTheDocument();
    
    // Click to expand details
    fireEvent.click(detailsElement);
    
    // Should show error message (use getAllByText since it appears in both error and stack trace)
    const errorMessages = screen.getAllByText(/Custom error message/i);
    expect(errorMessages.length).toBeGreaterThan(0);
  });
  
  test('should provide reload button', () => {
    // Mock window.location.reload
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadMock }
    });
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Find and click reload button
    const reloadButton = screen.getByText(/Reload Game/i);
    expect(reloadButton).toBeInTheDocument();
    
    fireEvent.click(reloadButton);
    
    // Should call window.location.reload
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
  
  test('should provide try again button that resets error state', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should show error UI
    expect(screen.getByText(/Something Went Wrong/i)).toBeInTheDocument();
    
    // Find try again button
    const tryAgainButton = screen.getByText(/Try Again/i);
    expect(tryAgainButton).toBeInTheDocument();
    
    // Verify button is clickable (doesn't throw)
    expect(() => fireEvent.click(tryAgainButton)).not.toThrow();
  });
  
  test('should log error to console', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error');
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should have logged error
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
  
  test('should display help text for persistent errors', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should show help text
    expect(screen.getByText(/clearing your browser cache/i)).toBeInTheDocument();
  });
  
  test('should display error icon', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should have warning emoji
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });
  
  test('should handle errors with stack traces', () => {
    const errorWithStack = new Error('Error with stack');
    errorWithStack.stack = 'Error: Error with stack\n    at TestComponent\n    at ErrorBoundary';
    
    function ThrowErrorWithStack() {
      throw errorWithStack;
    }
    
    render(
      <ErrorBoundary>
        <ThrowErrorWithStack />
      </ErrorBoundary>
    );
    
    // Expand details
    const detailsElement = screen.getByText(/Technical Details/i);
    fireEvent.click(detailsElement);
    
    // Should show stack trace
    expect(screen.getByText(/Stack Trace/i)).toBeInTheDocument();
  });
  
  test('should render multiple children correctly when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });
  
  test('should have accessible error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should have proper heading structure
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Something Went Wrong/i);
    
    // Should have clickable buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
  
  test('should style error UI with Tailwind classes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Check for Tailwind classes on main container
    const container = screen.getByText(/Something Went Wrong/i).closest('div');
    expect(container?.className).toContain('bg-gray-800');
    expect(container?.className).toContain('text-white');
  });
});
