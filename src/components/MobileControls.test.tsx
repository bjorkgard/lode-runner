import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { MobileControls } from './MobileControls';

describe('MobileControls Component', () => {
  let originalMatchMedia: typeof window.matchMedia;
  let originalMaxTouchPoints: number;
  let originalOntouchstart: unknown;

  beforeEach(() => {
    // Save original values
    originalMatchMedia = window.matchMedia;
    originalMaxTouchPoints = navigator.maxTouchPoints;
    originalOntouchstart = (window as any).ontouchstart;
  });

  afterEach(() => {
    // Restore original values
    window.matchMedia = originalMatchMedia;
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: originalMaxTouchPoints,
      writable: true,
      configurable: true
    });
    if (originalOntouchstart === undefined) {
      delete (window as any).ontouchstart;
    } else {
      (window as any).ontouchstart = originalOntouchstart;
    }
  });

  /**
   * Helper function to mock touch device detection.
   * Sets up the environment to simulate a touch device.
   */
  const mockTouchDevice = () => {
    // Mock ontouchstart
    (window as any).ontouchstart = {};
    
    // Mock maxTouchPoints
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 5,
      writable: true,
      configurable: true
    });
    
    // Mock matchMedia for pointer: coarse
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
  };

  /**
   * Helper function to mock non-touch device detection.
   * Sets up the environment to simulate a non-touch device.
   */
  const mockNonTouchDevice = () => {
    // Remove ontouchstart
    delete (window as any).ontouchstart;
    
    // Mock maxTouchPoints to 0
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
      writable: true,
      configurable: true
    });
    
    // Mock matchMedia for pointer: fine
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query !== '(pointer: coarse)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
  };

  test('does not render controls on non-touch devices', () => {
    mockNonTouchDevice();
    const onInput = vi.fn();
    const { container } = render(<MobileControls onInput={onInput} />);
    
    // Component should return null, so container should be empty
    expect(container.firstChild).toBeNull();
  });

  test('renders controls on touch devices', () => {
    mockTouchDevice();
    const onInput = vi.fn();
    render(<MobileControls onInput={onInput} />);
    
    // Check for directional buttons
    expect(screen.getByLabelText('Move up')).toBeInTheDocument();
    expect(screen.getByLabelText('Move down')).toBeInTheDocument();
    expect(screen.getByLabelText('Move left')).toBeInTheDocument();
    expect(screen.getByLabelText('Move right')).toBeInTheDocument();
    
    // Check for action buttons
    expect(screen.getByLabelText('Dig left')).toBeInTheDocument();
    expect(screen.getByLabelText('Dig right')).toBeInTheDocument();
  });

  test('calls onInput with correct parameters on touch start', () => {
    mockTouchDevice();
    const onInput = vi.fn();
    render(<MobileControls onInput={onInput} />);
    
    const upButton = screen.getByLabelText('Move up');
    
    // Simulate touch start
    fireEvent.touchStart(upButton);
    
    expect(onInput).toHaveBeenCalledWith('up', true);
  });

  test('calls onInput with correct parameters on touch end', () => {
    mockTouchDevice();
    const onInput = vi.fn();
    render(<MobileControls onInput={onInput} />);
    
    const upButton = screen.getByLabelText('Move up');
    
    // Simulate touch start and end
    fireEvent.touchStart(upButton);
    fireEvent.touchEnd(upButton);
    
    // Should be called twice: once for press (true), once for release (false)
    expect(onInput).toHaveBeenCalledWith('up', true);
    expect(onInput).toHaveBeenCalledWith('up', false);
  });

  /**
   * Property 36: Touch Input Mapping
   * Validates: Requirements 13.5
   * 
   * Tests that touch events on control buttons correctly update input state
   * by calling the onInput callback with the appropriate direction and pressed state.
   * 
   * This property verifies that:
   * 1. Each directional button (up, down, left, right) maps to the correct input direction
   * 2. Each action button (digLeft, digRight) maps to the correct input action
   * 3. Touch start events call onInput with pressed=true
   * 4. Touch end events call onInput with pressed=false
   * 5. The mapping is consistent across all buttons
   */
  test('Property 36: Touch Input Mapping', () => {
    mockTouchDevice();
    
    fc.assert(
      fc.property(
        fc.constantFrom('up', 'down', 'left', 'right', 'digLeft', 'digRight'),
        fc.boolean(),
        (direction, pressed) => {
          const onInput = vi.fn();
          const { unmount } = render(<MobileControls onInput={onInput} />);
          
          // Map direction to button label
          const labelMap: Record<string, string> = {
            'up': 'Move up',
            'down': 'Move down',
            'left': 'Move left',
            'right': 'Move right',
            'digLeft': 'Dig left',
            'digRight': 'Dig right'
          };
          
          const button = screen.getByLabelText(labelMap[direction]);
          
          // Create a touch event
          const touchEvent = new TouchEvent(pressed ? 'touchstart' : 'touchend', {
            bubbles: true,
            cancelable: true,
            touches: pressed ? [{ clientX: 0, clientY: 0 } as Touch] : []
          });
          
          // Dispatch the event
          button.dispatchEvent(touchEvent);
          
          // Verify onInput was called with correct parameters
          expect(onInput).toHaveBeenCalledWith(direction, pressed);
          
          unmount();
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  test('all directional buttons are present', () => {
    mockTouchDevice();
    const onInput = vi.fn();
    render(<MobileControls onInput={onInput} />);
    
    const directions = ['Move up', 'Move down', 'Move left', 'Move right'];
    
    directions.forEach(direction => {
      expect(screen.getByLabelText(direction)).toBeInTheDocument();
    });
  });

  test('all action buttons are present', () => {
    mockTouchDevice();
    const onInput = vi.fn();
    render(<MobileControls onInput={onInput} />);
    
    const actions = ['Dig left', 'Dig right'];
    
    actions.forEach(action => {
      expect(screen.getByLabelText(action)).toBeInTheDocument();
    });
  });

  test('buttons have visual feedback classes', () => {
    mockTouchDevice();
    const onInput = vi.fn();
    render(<MobileControls onInput={onInput} />);
    
    const upButton = screen.getByLabelText('Move up');
    
    // Check for active state classes
    expect(upButton.className).toContain('active:bg-gray-500');
    expect(upButton.className).toContain('active:scale-95');
  });

  test('controls are positioned at bottom of screen', () => {
    mockTouchDevice();
    const onInput = vi.fn();
    const { container } = render(<MobileControls onInput={onInput} />);
    
    const controlsContainer = container.firstChild as HTMLElement;
    expect(controlsContainer.className).toContain('fixed');
    expect(controlsContainer.className).toContain('bottom-0');
  });

  test('multiple buttons can be pressed simultaneously', () => {
    mockTouchDevice();
    const onInput = vi.fn();
    render(<MobileControls onInput={onInput} />);
    
    const upButton = screen.getByLabelText('Move up');
    const rightButton = screen.getByLabelText('Move right');
    
    // Simulate pressing both buttons
    fireEvent.touchStart(upButton);
    fireEvent.touchStart(rightButton);
    
    expect(onInput).toHaveBeenCalledWith('up', true);
    expect(onInput).toHaveBeenCalledWith('right', true);
  });
});
