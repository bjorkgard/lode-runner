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
 * This class is immutable-friendly: the update method can be used
 * in a functional style by creating a new instance with updated values.
 * 
 * @example
 * ```typescript
 * const animState = new AnimationState('idle');
 * const updated = animState.update(deltaTime, ANIMATIONS.player);
 * animState.setAnimation('run'); // Switch to run animation
 * ```
 */
export class AnimationState {
  /** Name of the currently playing animation */
  currentAnimation: string;
  /** Index of the current frame within the animation */
  currentFrame: number;
  /** Time accumulated since last frame change (in seconds) */
  frameTimer: number;
  
  /**
   * Creates a new animation state.
   * @param initialAnimation - Name of the animation to start with (default: 'idle')
   */
  constructor(initialAnimation: string = 'idle') {
    this.currentAnimation = initialAnimation;
    this.currentFrame = 0;
    this.frameTimer = 0;
  }
  
  /**
   * Updates the animation state based on elapsed time.
   * Advances to next frame when enough time has passed based on frameRate.
   * 
   * Note: This method mutates the instance. For immutable updates,
   * create a new AnimationState and copy the updated values.
   * 
   * @param deltaTime - Time elapsed since last update (in seconds)
   * @param animations - Map of animation names to Animation definitions
   */
  update(deltaTime: number, animations: Record<string, Animation>): void {
    const anim = animations[this.currentAnimation];
    if (!anim) return;
    
    this.frameTimer += deltaTime;
    
    if (this.frameTimer >= 1 / anim.frameRate) {
      this.frameTimer = 0;
      this.currentFrame++;
      
      if (this.currentFrame >= anim.frames.length) {
        if (anim.loop) {
          this.currentFrame = 0;
        } else {
          this.currentFrame = anim.frames.length - 1;
        }
      }
    }
  }
  
  /**
   * Changes to a different animation.
   * Resets frame counter and timer when switching animations.
   * Does nothing if already playing the specified animation.
   * 
   * @param name - Name of the animation to switch to
   */
  setAnimation(name: string): void {
    if (this.currentAnimation !== name) {
      this.currentAnimation = name;
      this.currentFrame = 0;
      this.frameTimer = 0;
    }
  }
  
  /**
   * Creates a copy of this animation state.
   * Useful for immutable update patterns.
   * 
   * @returns A new AnimationState with the same values
   */
  clone(): AnimationState {
    const cloned = new AnimationState(this.currentAnimation);
    cloned.currentFrame = this.currentFrame;
    cloned.frameTimer = this.frameTimer;
    return cloned;
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
