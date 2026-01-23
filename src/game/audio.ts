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
 * Global audio state
 */
let audioAssets: AudioAssets | null = null;
let audioSettings: AudioSettings = { muted: false, volume: 0.7 };

/**
 * Initializes the audio system by loading all sound effects and audio settings.
 * This should be called once at game startup.
 * Includes error handling for audio load failures - game continues without audio if loading fails.
 * 
 * @returns Promise that resolves when audio initialization is complete
 */
export async function initAudio(): Promise<void> {
  // Load saved audio settings
  audioSettings = loadAudioSettings();
  
  try {
    // Load all audio assets
    audioAssets = {
      dig: await loadAudio('/assets/sfx/dig.mp3'),
      goldPickup: await loadAudio('/assets/sfx/gold.mp3'),
      death: await loadAudio('/assets/sfx/death.mp3'),
      levelComplete: await loadAudio('/assets/sfx/complete.mp3'),
      uiClick: await loadAudio('/assets/sfx/click.mp3')
    };
    
    // Set initial volume on all audio elements
    for (const audio of Object.values(audioAssets)) {
      audio.volume = audioSettings.volume;
    }
  } catch (error) {
    console.error('Failed to load audio assets:', error);
    audioAssets = null; // Game continues without audio
  }
}

/**
 * Loads a single audio file from the specified path.
 * 
 * @param path - Path to the audio file
 * @returns Promise that resolves with the loaded HTMLAudioElement
 */
function loadAudio(path: string): Promise<HTMLAudioElement> {
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
export function playSound(soundName: keyof AudioAssets): void {
  if (!audioAssets || audioSettings.muted) return;
  
  const audio = audioAssets[soundName];
  
  // Clone audio element to allow overlapping sounds
  const clone = audio.cloneNode() as HTMLAudioElement;
  clone.volume = audioSettings.volume;
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
export function setMuted(muted: boolean): void {
  audioSettings.muted = muted;
  saveAudioSettings(audioSettings);
}

/**
 * Sets the volume level for all audio.
 * Volume is clamped to the range [0, 1].
 * Updates all loaded audio elements and persists the setting to localStorage.
 * 
 * @param volume - Volume level from 0.0 (silent) to 1.0 (full volume)
 */
export function setVolume(volume: number): void {
  // Clamp volume to valid range [0, 1]
  audioSettings.volume = Math.max(0, Math.min(1, volume));
  
  // Update volume on all loaded audio elements
  if (audioAssets) {
    for (const audio of Object.values(audioAssets)) {
      audio.volume = audioSettings.volume;
    }
  }
  
  saveAudioSettings(audioSettings);
}

/**
 * Toggles the muted state of the audio system.
 * If currently muted, unmutes. If currently unmuted, mutes.
 */
export function toggleMute(): void {
  setMuted(!audioSettings.muted);
}

/**
 * Gets the current audio settings.
 * Useful for UI components that need to display current audio state.
 * 
 * @returns Current audio settings (muted state and volume)
 */
export function getAudioSettings(): AudioSettings {
  return { ...audioSettings };
}
