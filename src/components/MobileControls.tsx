import { useEffect, useState } from 'react';

interface MobileControlsProps {
  onInput: (direction: string, pressed: boolean) => void;
}

/**
 * MobileControls component that provides on-screen touch controls for mobile devices.
 * Automatically detects touch devices and only renders controls when appropriate.
 * 
 * Features:
 * - D-pad for directional movement (up, down, left, right)
 * - Action buttons for digging (dig left, dig right)
 * - Touch event handling with visual feedback
 * - Responsive layout using Tailwind CSS
 * 
 * Requirements:
 * - 13.1: Display controls only on touch devices
 * - 13.2: Hide controls on non-touch devices
 * - 13.3: Provide directional buttons
 * - 13.4: Provide dig-left and dig-right buttons
 * - 13.5: Process touch input via callback
 * 
 * @param onInput - Callback function to handle input events (direction, pressed)
 */
export function MobileControls({ onInput }: MobileControlsProps) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  /**
   * Detects if the device supports touch input.
   * Uses multiple detection methods for better compatibility:
   * - 'ontouchstart' in window: Checks for touch event support
   * - navigator.maxTouchPoints: Checks for touch point support
   * - matchMedia: Checks for pointer type
   */
  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window ||
                      navigator.maxTouchPoints > 0 ||
                      window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(hasTouch);
    };
    
    checkTouchDevice();
    
    // Re-check on resize (device orientation change)
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);
  
  // Don't render controls on non-touch devices
  if (!isTouchDevice) {
    return null;
  }
  
  /**
   * Handles touch start events for control buttons.
   * Prevents default behavior and calls onInput callback with pressed=true.
   * 
   * @param direction - The input direction ('left', 'right', 'up', 'down', 'digLeft', 'digRight')
   */
  const handleTouchStart = (direction: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    onInput(direction, true);
  };
  
  /**
   * Handles touch end events for control buttons.
   * Prevents default behavior and calls onInput callback with pressed=false.
   * 
   * @param direction - The input direction ('left', 'right', 'up', 'down', 'digLeft', 'digRight')
   */
  const handleTouchEnd = (direction: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    onInput(direction, false);
  };
  
  /**
   * Common button classes for consistent styling.
   * Provides visual feedback on touch with active state.
   */
  const buttonClass = "bg-gray-700 text-white rounded-lg shadow-lg active:bg-gray-500 active:scale-95 transition-all select-none flex items-center justify-center font-bold text-lg";
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none z-50">
      <div className="max-w-screen-lg mx-auto flex justify-between items-end pointer-events-auto">
        {/* D-pad for directional movement */}
        <div className="relative w-40 h-40">
          {/* Up button */}
          <button
            onTouchStart={handleTouchStart('up')}
            onTouchEnd={handleTouchEnd('up')}
            className={`${buttonClass} absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12`}
            aria-label="Move up"
          >
            ▲
          </button>
          
          {/* Down button */}
          <button
            onTouchStart={handleTouchStart('down')}
            onTouchEnd={handleTouchEnd('down')}
            className={`${buttonClass} absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-12`}
            aria-label="Move down"
          >
            ▼
          </button>
          
          {/* Left button */}
          <button
            onTouchStart={handleTouchStart('left')}
            onTouchEnd={handleTouchEnd('left')}
            className={`${buttonClass} absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12`}
            aria-label="Move left"
          >
            ◀
          </button>
          
          {/* Right button */}
          <button
            onTouchStart={handleTouchStart('right')}
            onTouchEnd={handleTouchEnd('right')}
            className={`${buttonClass} absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12`}
            aria-label="Move right"
          >
            ▶
          </button>
          
          {/* Center indicator (non-interactive) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gray-800 rounded-full" />
        </div>
        
        {/* Action buttons for digging */}
        <div className="flex gap-4">
          {/* Dig left button */}
          <button
            onTouchStart={handleTouchStart('digLeft')}
            onTouchEnd={handleTouchEnd('digLeft')}
            className={`${buttonClass} w-16 h-16`}
            aria-label="Dig left"
          >
            ⛏️<br/>L
          </button>
          
          {/* Dig right button */}
          <button
            onTouchStart={handleTouchStart('digRight')}
            onTouchEnd={handleTouchEnd('digRight')}
            className={`${buttonClass} w-16 h-16`}
            aria-label="Dig right"
          >
            ⛏️<br/>R
          </button>
        </div>
      </div>
    </div>
  );
}
