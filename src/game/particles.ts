// Particle system for visual effects

import type { Particle, Position } from './types';
import { TILE_SIZE } from './constants';
import { PARTICLES } from '../constants/ui';

/**
 * Size of the particle object pool.
 * Pre-allocates particles to avoid garbage collection during gameplay.
 */
const PARTICLE_POOL_SIZE = PARTICLES.POOL_SIZE;

/**
 * Particle manager class that handles particle effects.
 * Encapsulates particle state and provides methods for particle management.
 * 
 * Benefits of class-based approach:
 * - Easier to test (can create isolated instances)
 * - No module-level state pollution
 * - Better for hot module replacement
 * - Proper encapsulation of particle resources
 */
export class ParticleManager {
  private particlePool: Particle[] = [];
  private activeParticles: Particle[] = [];
  
  /**
   * Initializes the particle system by creating the object pool.
   * Should be called once before any particles are created.
   * 
   * Uses object pooling to avoid allocating/deallocating particles during gameplay,
   * which prevents garbage collection pauses and improves performance.
   */
  init(): void {
    this.particlePool = [];
    this.activeParticles = [];
    
    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      this.particlePool.push({
        pos: { x: 0, y: 0 },
        velocity: { x: 0, y: 0 },
        life: 0,
        maxLife: 1,
        color: '#FFD700'
      });
    }
  }
  
  /**
   * Creates a burst of particles at the specified tile position.
   * Used for gold collection visual effect.
   * 
   * Particles are emitted in a radial burst pattern with random velocities.
   * Each particle has a random lifetime and fades out over time.
   * 
   * @param tilePos - Position in tile coordinates where particles should spawn
   */
  createGoldParticles(tilePos: Position): void {
    // Convert tile coordinates to pixel coordinates (center of tile)
    const pixelPos = {
      x: tilePos.x * TILE_SIZE + TILE_SIZE / 2,
      y: tilePos.y * TILE_SIZE + TILE_SIZE / 2
    };
    
    // Create burst of 8-12 particles
    const count = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < count; i++) {
      const particle = this.particlePool.pop();
      if (!particle) break; // Pool exhausted
      
      // Calculate radial direction for this particle
      const angle = (Math.PI * 2 * i) / count;
      const speed = PARTICLES.MIN_SPEED + Math.random() * PARTICLES.SPEED_RANGE;
      
      // Initialize particle properties
      particle.pos = { ...pixelPos };
      particle.velocity = {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      };
      particle.life = 0;
      particle.maxLife = 0.5 + Math.random() * 0.5; // Random lifetime 0.5-1.0 seconds
      particle.color = '#FFD700'; // Gold color
      
      this.activeParticles.push(particle);
    }
  }
  
  /**
   * Updates all active particles by advancing their positions and lifetimes.
   * Removes expired particles and returns them to the pool.
   * 
   * Should be called once per frame with the time elapsed since last frame.
   * 
   * @param deltaTime - Time elapsed since last update in seconds
   */
  update(deltaTime: number): void {
    // Iterate backwards so we can safely remove particles
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const particle = this.activeParticles[i];
      
      // Update position based on velocity
      particle.pos.x += particle.velocity.x * deltaTime;
      particle.pos.y += particle.velocity.y * deltaTime;
      
      // Update lifetime
      particle.life += deltaTime;
      
      // Remove expired particles and return to pool
      if (particle.life >= particle.maxLife) {
        this.activeParticles.splice(i, 1);
        this.particlePool.push(particle);
      }
    }
  }
  
  /**
   * Renders all active particles to the canvas context.
   * Particles fade out as they approach their maximum lifetime.
   * 
   * Should be called once per frame during the render phase.
   * 
   * @param ctx - Canvas 2D rendering context to draw particles on
   */
  render(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.activeParticles) {
      // Calculate alpha based on remaining life (1.0 = just spawned, 0.0 = expired)
      const alpha = 1 - (particle.life / particle.maxLife);
      
      // Set particle color with fade
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = alpha;
      
      // Draw particle as a small square (4x4 pixels)
      ctx.fillRect(particle.pos.x - 2, particle.pos.y - 2, 4, 4);
    }
    
    // Reset global alpha for other rendering
    ctx.globalAlpha = 1;
  }
  
  /**
   * Gets the current number of active particles.
   * Useful for testing and debugging.
   * 
   * @returns Number of particles currently being updated and rendered
   */
  getActiveParticleCount(): number {
    return this.activeParticles.length;
  }
  
  /**
   * Gets the current number of particles available in the pool.
   * Useful for testing and debugging.
   * 
   * @returns Number of particles available for reuse
   */
  getPoolSize(): number {
    return this.particlePool.length;
  }
  
  /**
   * Clears all active particles and returns them to the pool.
   * Useful for testing and level transitions.
   */
  clear(): void {
    while (this.activeParticles.length > 0) {
      const particle = this.activeParticles.pop();
      if (particle) {
        this.particlePool.push(particle);
      }
    }
  }
}
