// Animation system for Lode Runner

/**
 * Defines an animation sequence with frame indices and timing.
 * Used to configure sprite animations for entities.
 */
export interface Animation {
  /** Array of frame indices to display in sequence */
  frames: number[];
  /** Speed of animation in frames per second */
  frameRate: number;
  /** Whether animation should loop or stop at last frame */
  loop: boolean;
}

/**
 * Manages the animation state for an entity.
 * Tracks current animation, frame, and timing for sprite rendering.
 * 
 * This class is fully immutable: all methods return new instances
 * rather than modifying the existing state.
 * 
 * @example
 * ```typescript
 * const animState = new AnimationState('idle');
 * const updated = animState.update(deltaTime, ANIMATIONS.player);
 * const running = updated.setAnimation('run'); // Switch to run animation
 * ```
 */
export class AnimationState {
  /** Name of the currently playing animation */
  readonly currentAnimation: string;
  /** Index of the current frame within the animation */
  readonly currentFrame: number;
  /** Time accumulated since last frame change (in seconds) */
  readonly frameTimer: number;
  
  /**
   * Creates a new animation state.
   * @param initialAnimation - Name of the animation to start with (default: 'idle')
   * @param frame - Initial frame index (default: 0)
   * @param timer - Initial frame timer (default: 0)
   */
  constructor(initialAnimation: string = 'idle', frame: number = 0, timer: number = 0) {
    this.currentAnimation = initialAnimation;
    this.currentFrame = frame;
    this.frameTimer = timer;
  }
  
  /**
   * Updates the animation state based on elapsed time.
   * Advances to next frame when enough time has passed based on frameRate.
   * Returns a new AnimationState instance with updated values.
   * 
   * @param deltaTime - Time elapsed since last update (in seconds)
   * @param animations - Map of animation names to Animation definitions
   * @returns New AnimationState with updated frame timing
   */
  update(deltaTime: number, animations: Record<string, Animation>): AnimationState {
    const anim = animations[this.currentAnimation];
    if (!anim) return this;
    
    const newFrameTimer = this.frameTimer + deltaTime;
    
    if (newFrameTimer >= 1 / anim.frameRate) {
      const nextFrame = this.currentFrame + 1;
      
      if (nextFrame >= anim.frames.length) {
        if (anim.loop) {
          // Loop back to first frame
          return new AnimationState(this.currentAnimation, 0, 0);
        } else {
          // Stay on last frame
          return new AnimationState(this.currentAnimation, anim.frames.length - 1, 0);
        }
      } else {
        // Advance to next frame
        return new AnimationState(this.currentAnimation, nextFrame, 0);
      }
    }
    
    // Not enough time elapsed, just update timer
    return new AnimationState(this.currentAnimation, this.currentFrame, newFrameTimer);
  }
  
  /**
   * Changes to a different animation.
   * Resets frame counter and timer when switching animations.
   * Returns the same instance if already playing the specified animation.
   * 
   * @param name - Name of the animation to switch to
   * @returns New AnimationState with the specified animation, or same instance if unchanged
   */
  setAnimation(name: string): AnimationState {
    if (this.currentAnimation !== name) {
      return new AnimationState(name, 0, 0);
    }
    return this;
  }
  
  /**
   * Creates a copy of this animation state.
   * Since the class is immutable, this returns the same instance.
   * Kept for backward compatibility.
   * 
   * @returns This AnimationState instance
   */
  clone(): AnimationState {
    return this;
  }
}

/**
 * Predefined animations for player character.
 * Maps animation names to their frame sequences and timing.
 */
export const PLAYER_ANIMATIONS: Record<string, Animation> = {
  idle: { frames: [0], frameRate: 1, loop: true },
  run: { frames: [1, 2, 3, 4], frameRate: 10, loop: true },
  climb: { frames: [5, 6], frameRate: 8, loop: true },
  fall: { frames: [7], frameRate: 1, loop: true },
  dig: { frames: [8, 9], frameRate: 12, loop: false }
};

/**
 * Predefined animations for enemy characters.
 * Maps animation names to their frame sequences and timing.
 */
export const ENEMY_ANIMATIONS: Record<string, Animation> = {
  run: { frames: [0, 1, 2, 3], frameRate: 8, loop: true },
  climb: { frames: [4, 5], frameRate: 8, loop: true },
  fall: { frames: [6], frameRate: 1, loop: true },
  trapped: { frames: [7, 8], frameRate: 4, loop: true }
};
