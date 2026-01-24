// Audio system for managing sound effects and volume settings

import { loadAudioSettings, saveAudioSettings } from './storage';
import type { AudioSettings } from './types';

/**
 * Audio assets loaded from files
 */
interface AudioAssets {
  dig: HTMLAudioElement;
  goldPickup: HTMLAudioElement;
  death: HTMLAudioElement;
  levelComplete: HTMLAudioElement;
  uiClick: HTMLAudioElement;
}

/**
 * Audio manager class that handles sound effects and volume settings.
 * Encapsulates audio state and provides methods for audio playback.
 * 
 * Benefits of class-based approach:
 * - Easier to test (can create isolated instances)
 * - No module-level state pollution
 * - Better for hot module replacement
 * - Proper encapsulation of audio resources
 */
export class AudioManager {
  private audioAssets: AudioAssets | null = null;
  private audioSettings: AudioSettings;
  
  constructor() {
    this.audioSettings = loadAudioSettings();
  }
  
  /**
   * Initializes the audio system by loading all sound effects.
   * Includes error handling for audio load failures - game continues without audio if loading fails.
   * 
   * @returns Promise that resolves when audio initialization is complete
   */
  async init(): Promise<void> {
    try {
      // Load all audio assets
      this.audioAssets = {
        dig: await this.loadAudio('/assets/sfx/dig.mp3'),
        goldPickup: await this.loadAudio('/assets/sfx/gold.mp3'),
        death: await this.loadAudio('/assets/sfx/death.mp3'),
        levelComplete: await this.loadAudio('/assets/sfx/complete.mp3'),
        uiClick: await this.loadAudio('/assets/sfx/click.mp3')
      };
      
      // Set initial volume on all audio elements
      for (const audio of Object.values(this.audioAssets)) {
        audio.volume = this.audioSettings.volume;
      }
    } catch (error) {
      console.error('Failed to load audio assets:', error);
      this.audioAssets = null; // Game continues without audio
    }
  }
  
  /**
   * Loads a single audio file from the specified path.
   * 
   * @param path - Path to the audio file
   * @returns Promise that resolves with the loaded HTMLAudioElement
   */
  private loadAudio(path: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = reject;
      audio.src = path;
      audio.load();
    });
  }
  
  /**
   * Plays a sound effect by name.
   * Does nothing if audio is not loaded or if audio is muted.
   * Uses audio cloning to allow overlapping sounds.
   * 
   * @param soundName - Name of the sound to play (must match a key in AudioAssets)
   */
  playSound(soundName: keyof AudioAssets): void {
    if (!this.audioAssets || this.audioSettings.muted) return;
    
    const audio = this.audioAssets[soundName];
    
    // Clone audio element to allow overlapping sounds
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = this.audioSettings.volume;
    clone.play().catch(error => {
      console.error(`Failed to play sound ${soundName}:`, error);
    });
  }
  
  /**
   * Sets the muted state of the audio system.
   * When muted, no sounds will play.
   * Persists the setting to localStorage.
   * 
   * @param muted - True to mute audio, false to unmute
   */
  setMuted(muted: boolean): void {
    this.audioSettings.muted = muted;
    saveAudioSettings(this.audioSettings);
  }
  
  /**
   * Sets the volume level for all audio.
   * Volume is clamped to the range [0, 1].
   * Updates all loaded audio elements and persists the setting to localStorage.
   * 
   * @param volume - Volume level from 0.0 (silent) to 1.0 (full volume)
   */
  setVolume(volume: number): void {
    // Clamp volume to valid range [0, 1]
    this.audioSettings.volume = Math.max(0, Math.min(1, volume));
    
    // Update volume on all loaded audio elements
    if (this.audioAssets) {
      for (const audio of Object.values(this.audioAssets)) {
        audio.volume = this.audioSettings.volume;
      }
    }
    
    saveAudioSettings(this.audioSettings);
  }
  
  /**
   * Toggles the muted state of the audio system.
   * If currently muted, unmutes. If currently unmuted, mutes.
   */
  toggleMute(): void {
    this.setMuted(!this.audioSettings.muted);
  }
  
  /**
   * Gets the current audio settings.
   * Useful for UI components that need to display current audio state.
   * 
   * @returns Current audio settings (muted state and volume)
   */
  getAudioSettings(): AudioSettings {
    return { ...this.audioSettings };
  }
}
