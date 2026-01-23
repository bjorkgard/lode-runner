// Storage system for persisting game data to localStorage

import { STORAGE_KEYS } from './constants';
import type { AudioSettings } from './types';

/**
 * Saves the high score to localStorage if it's higher than the current stored value.
 * Includes error handling for localStorage failures (quota exceeded, disabled, etc.).
 * 
 * @param score - The score to potentially save as the new high score
 */
export function saveHighScore(score: number): void {
  try {
    const currentHigh = loadHighScore();
    if (score > currentHigh) {
      localStorage.setItem(STORAGE_KEYS.highScore, score.toString());
    }
  } catch (error) {
    console.error('Failed to save high score:', error);
  }
}

/**
 * Loads the high score from localStorage.
 * Returns 0 if no high score is stored or if loading fails.
 * 
 * @returns The stored high score, or 0 if not found or on error
 */
export function loadHighScore(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.highScore);
    if (!stored) return 0;
    
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error('Failed to load high score:', error);
    return 0; // Default value
  }
}

/**
 * Saves audio settings (muted state and volume) to localStorage.
 * Includes error handling for localStorage failures.
 * 
 * @param settings - The audio settings to persist
 */
export function saveAudioSettings(settings: AudioSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.audioSettings, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save audio settings:', error);
  }
}

/**
 * Loads audio settings from localStorage.
 * Returns default settings (unmuted, 70% volume) if not found or on error.
 * 
 * @returns The stored audio settings, or default settings if not found or on error
 */
export function loadAudioSettings(): AudioSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.audioSettings);
    return stored ? JSON.parse(stored) : { muted: false, volume: 0.7 };
  } catch (error) {
    console.error('Failed to load audio settings:', error);
    return { muted: false, volume: 0.7 }; // Default values
  }
}

/**
 * Resets the high score by removing it from localStorage.
 * Includes error handling for localStorage failures.
 */
export function resetHighScore(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.highScore);
  } catch (error) {
    console.error('Failed to reset high score:', error);
  }
}
