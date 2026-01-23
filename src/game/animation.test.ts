// Unit tests for animation system

import { describe, test, expect, beforeEach } from 'vitest';
import { AnimationState, PLAYER_ANIMATIONS, ENEMY_ANIMATIONS } from './animation';
import type { Animation } from './animation';

describe('AnimationState', () => {
  describe('constructor', () => {
    test('creates animation state with default animation', () => {
      const animState = new AnimationState();
      
      expect(animState.currentAnimation).toBe('idle');
      expect(animState.currentFrame).toBe(0);
      expect(animState.frameTimer).toBe(0);
    });
    
    test('creates animation state with specified animation', () => {
      const animState = new AnimationState('run');
      
      expect(animState.currentAnimation).toBe('run');
      expect(animState.currentFrame).toBe(0);
      expect(animState.frameTimer).toBe(0);
    });
  });
  
  describe('update', () => {
    let animState: AnimationState;
    let testAnimations: Record<string, Animation>;
    
    beforeEach(() => {
      animState = new AnimationState('test');
      testAnimations = {
        test: {
          frames: [0, 1, 2, 3],
          frameRate: 10, // 10 FPS = 0.1 seconds per frame
          loop: true
        }
      };
    });
    
    test('advances frame when enough time has passed', () => {
      animState.update(0.1, testAnimations); // Exactly one frame duration
      
      expect(animState.currentFrame).toBe(1);
      expect(animState.frameTimer).toBe(0);
    });
    
    test('accumulates time across multiple updates', () => {
      animState.update(0.05, testAnimations); // Half a frame
      expect(animState.currentFrame).toBe(0);
      
      animState.update(0.05, testAnimations); // Another half frame
      expect(animState.currentFrame).toBe(1);
    });
    
    test('loops animation when reaching end', () => {
      animState.currentFrame = 3; // Last frame
      animState.update(0.1, testAnimations);
      
      expect(animState.currentFrame).toBe(0); // Should loop back
    });
    
    test('stops at last frame for non-looping animation', () => {
      testAnimations.test.loop = false;
      animState.currentFrame = 3; // Last frame
      
      animState.update(0.1, testAnimations);
      
      expect(animState.currentFrame).toBe(3); // Should stay at last frame
    });
    
    test('does nothing if animation not found', () => {
      animState.currentAnimation = 'nonexistent';
      const initialFrame = animState.currentFrame;
      const initialTimer = animState.frameTimer;
      
      animState.update(0.1, testAnimations);
      
      expect(animState.currentFrame).toBe(initialFrame);
      expect(animState.frameTimer).toBe(initialTimer);
    });
    
    test('handles very small delta times', () => {
      animState.update(0.001, testAnimations); // 1ms
      
      expect(animState.currentFrame).toBe(0);
      expect(animState.frameTimer).toBeCloseTo(0.001);
    });
    
    test('resets timer when advancing frame', () => {
      // The update method resets the timer to 0 when advancing a frame
      // This is by design - it doesn't carry over excess time
      animState.update(0.25, testAnimations); // 2.5 frames worth of time
      
      // Should advance 1 frame and reset timer to 0
      expect(animState.currentFrame).toBe(1);
      expect(animState.frameTimer).toBe(0);
    });
  });
  
  describe('setAnimation', () => {
    let animState: AnimationState;
    
    beforeEach(() => {
      animState = new AnimationState('idle');
      animState.currentFrame = 5;
      animState.frameTimer = 0.05;
    });
    
    test('changes animation and resets state', () => {
      animState.setAnimation('run');
      
      expect(animState.currentAnimation).toBe('run');
      expect(animState.currentFrame).toBe(0);
      expect(animState.frameTimer).toBe(0);
    });
    
    test('does nothing if already playing specified animation', () => {
      animState.setAnimation('idle');
      
      expect(animState.currentAnimation).toBe('idle');
      expect(animState.currentFrame).toBe(5); // Should not reset
      expect(animState.frameTimer).toBe(0.05); // Should not reset
    });
  });
  
  describe('clone', () => {
    test('creates independent copy of animation state', () => {
      const original = new AnimationState('run');
      original.currentFrame = 3;
      original.frameTimer = 0.05;
      
      const cloned = original.clone();
      
      expect(cloned).not.toBe(original);
      expect(cloned.currentAnimation).toBe(original.currentAnimation);
      expect(cloned.currentFrame).toBe(original.currentFrame);
      expect(cloned.frameTimer).toBe(original.frameTimer);
    });
    
    test('cloned instance is independent', () => {
      const original = new AnimationState('idle');
      const cloned = original.clone();
      
      cloned.setAnimation('run');
      
      expect(original.currentAnimation).toBe('idle');
      expect(cloned.currentAnimation).toBe('run');
    });
  });
});

describe('PLAYER_ANIMATIONS', () => {
  test('has all required animations', () => {
    expect(PLAYER_ANIMATIONS.idle).toBeDefined();
    expect(PLAYER_ANIMATIONS.run).toBeDefined();
    expect(PLAYER_ANIMATIONS.climb).toBeDefined();
    expect(PLAYER_ANIMATIONS.fall).toBeDefined();
    expect(PLAYER_ANIMATIONS.dig).toBeDefined();
  });
  
  test('idle animation is looping', () => {
    expect(PLAYER_ANIMATIONS.idle.loop).toBe(true);
  });
  
  test('dig animation is non-looping', () => {
    expect(PLAYER_ANIMATIONS.dig.loop).toBe(false);
  });
  
  test('all animations have valid frame arrays', () => {
    Object.values(PLAYER_ANIMATIONS).forEach(anim => {
      expect(Array.isArray(anim.frames)).toBe(true);
      expect(anim.frames.length).toBeGreaterThan(0);
    });
  });
  
  test('all animations have positive frame rates', () => {
    Object.values(PLAYER_ANIMATIONS).forEach(anim => {
      expect(anim.frameRate).toBeGreaterThan(0);
    });
  });
});

describe('ENEMY_ANIMATIONS', () => {
  test('has all required animations', () => {
    expect(ENEMY_ANIMATIONS.run).toBeDefined();
    expect(ENEMY_ANIMATIONS.climb).toBeDefined();
    expect(ENEMY_ANIMATIONS.fall).toBeDefined();
    expect(ENEMY_ANIMATIONS.trapped).toBeDefined();
  });
  
  test('all animations are looping', () => {
    Object.values(ENEMY_ANIMATIONS).forEach(anim => {
      expect(anim.loop).toBe(true);
    });
  });
  
  test('all animations have valid frame arrays', () => {
    Object.values(ENEMY_ANIMATIONS).forEach(anim => {
      expect(Array.isArray(anim.frames)).toBe(true);
      expect(anim.frames.length).toBeGreaterThan(0);
    });
  });
  
  test('all animations have positive frame rates', () => {
    Object.values(ENEMY_ANIMATIONS).forEach(anim => {
      expect(anim.frameRate).toBeGreaterThan(0);
    });
  });
});
