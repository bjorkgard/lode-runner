import type { Level, GameStateData } from './types';
import { TileType } from './types';
import { AnimationState } from './animation';
import { LevelLoadError, LevelValidationError } from './errors';

/**
 * Standard placeholder level template.
 * Used for levels that haven't been designed yet.
 */
const PLACEHOLDER_TEMPLATE: TileType[][] = [
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
  [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
  [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
  [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
];

/**
 * Creates a single placeholder level from the template.
 * Customizes par time and enemy count based on level number.
 * 
 * @param levelNumber - The level number to create
 * @returns A complete level object
 */
function createPlaceholderLevel(levelNumber: number): Level {
  // Calculate difficulty scaling
  const levelIndex = levelNumber - 11; // 0-89 for levels 11-100
  const difficultyTier = Math.floor(levelIndex / 30); // 0, 1, or 2
  
  // Gradually increase par time
  const parTime = 60 + (levelIndex * 2);
  
  // Increase enemy count based on difficulty tier
  const enemyStarts = [
    { x: 10, y: 7 },
    { x: 16, y: 7 }
  ];
  
  // Add more enemies for higher tiers
  if (difficultyTier >= 1) {
    enemyStarts.push({ x: 6, y: 3 });
  }
  if (difficultyTier >= 2) {
    enemyStarts.push({ x: 20, y: 3 });
  }
  
  return {
    number: levelNumber,
    width: 28,
    height: 16,
    tiles: PLACEHOLDER_TEMPLATE.map(row => [...row]), // Deep copy
    playerStart: { x: 1, y: 14 },
    enemyStarts,
    parTime
  };
}

/**
 * Generates placeholder levels from a template.
 * Creates levels with sequential numbering and gradually increasing difficulty.
 * 
 * @param startLevel - First level number to generate (inclusive)
 * @param endLevel - Last level number to generate (inclusive)
 * @returns Array of generated levels
 */
function generatePlaceholderLevels(startLevel: number, endLevel: number): Level[] {
  const levels: Level[] = [];
  
  for (let levelNum = startLevel; levelNum <= endLevel; levelNum++) {
    levels.push(createPlaceholderLevel(levelNum));
  }
  
  return levels;
}

/**
 * Array of all 100 game levels.
 * Each level defines the tile layout, spawn points, and par time.
 * Levels 1-10 are complete, levels 11-100 are generated from template.
 */
export const LEVELS: Level[] = [
  // Level 1: Tutorial - Simple gold collection
  {
    number: 1,
    width: 28,
    height: 16,
    tiles: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,5,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    playerStart: { x: 1, y: 14 },
    enemyStarts: [],
    parTime: 30
  },

  // Level 2: Introduction to digging
  {
    number: 2,
    width: 28,
    height: 16,
    tiles: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    playerStart: { x: 1, y: 14 },
    enemyStarts: [],
    parTime: 45
  },

  // Level 3: First enemy encounter
  {
    number: 3,
    width: 28,
    height: 16,
    tiles: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    playerStart: { x: 1, y: 14 },
    enemyStarts: [{ x: 20, y: 5 }],
    parTime: 50
  },

  // Level 4: Ladders and ropes
  {
    number: 4,
    width: 28,
    height: 16,
    tiles: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    playerStart: { x: 1, y: 14 },
    enemyStarts: [{ x: 10, y: 9 }],
    parTime: 60
  },

  // Level 5: Trap the enemy
  {
    number: 5,
    width: 28,
    height: 16,
    tiles: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    playerStart: { x: 1, y: 14 },
    enemyStarts: [{ x: 12, y: 9 }],
    parTime: 55
  },

  // Level 6: Multiple enemies
  {
    number: 6,
    width: 28,
    height: 16,
    tiles: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    playerStart: { x: 1, y: 14 },
    enemyStarts: [{ x: 6, y: 7 }, { x: 16, y: 7 }],
    parTime: 70
  },

  // Level 7: Steel barriers
  {
    number: 7,
    width: 28,
    height: 16,
    tiles: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    playerStart: { x: 1, y: 14 },
    enemyStarts: [{ x: 6, y: 7 }, { x: 16, y: 7 }],
    parTime: 75
  },

  // Level 8: Complex maze
  {
    number: 8,
    width: 28,
    height: 16,
    tiles: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    playerStart: { x: 1, y: 14 },
    enemyStarts: [{ x: 6, y: 5 }, { x: 16, y: 5 }, { x: 12, y: 9 }],
    parTime: 90
  },

  // Level 9: Timing challenge
  {
    number: 9,
    width: 28,
    height: 16,
    tiles: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    playerStart: { x: 1, y: 13 },
    enemyStarts: [{ x: 6, y: 5 }, { x: 16, y: 5 }, { x: 6, y: 9 }, { x: 16, y: 9 }],
    parTime: 80
  },

  // Level 10: Final test
  {
    number: 10,
    width: 28,
    height: 16,
    tiles: [
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,0,0,0,0,0,0,5,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,5,0,0,0,0,0,3,0,0,0,5,0,0,0,0,0,0,0,0,0,0,2],
      [2,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2],
      [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
    ],
    playerStart: { x: 1, y: 13 },
    enemyStarts: [{ x: 6, y: 2 }, { x: 18, y: 2 }, { x: 6, y: 6 }, { x: 16, y: 6 }, { x: 12, y: 10 }],
    parTime: 100
  },

  // Levels 11-100: Generated from template
  ...generatePlaceholderLevels(11, 100)
];

/**
 * Loads a level into the game state.
 * Initializes tiles, player position, enemies, and resets level-specific state.
 * 
 * @param state - The current game state to modify
 * @param levelNumber - The level number to load (1-100)
 * @throws {LevelLoadError} If level number is out of range
 * @throws {LevelValidationError} If level data is invalid
 */
export function loadLevel(state: GameStateData, levelNumber: number): void {
  // Validate level number
  if (levelNumber < 1 || levelNumber > LEVELS.length) {
    throw new LevelLoadError(
      levelNumber,
      'Level number out of range',
      { min: 1, max: LEVELS.length }
    );
  }
  
  const level = LEVELS[levelNumber - 1];
  
  // Validate level data
  const validationErrors = validateLevel(level);
  if (validationErrors.length > 0) {
    throw new LevelValidationError(levelNumber, validationErrors);
  }
  
  // Update state with level data
  state.currentLevel = levelNumber;
  
  // Deep copy tiles to avoid modifying original level data
  state.tiles = level.tiles.map(row => [...row]);
  
  // Set player position
  state.player.pos = { ...level.playerStart };
  state.player.velocity = { x: 0, y: 0 };
  state.player.isDead = false;
  state.player.isDigging = false;
  state.player.digDirection = null;
  
  // Create enemies at their start positions
  state.enemies = level.enemyStarts.map(pos => ({
    pos: { ...pos },
    velocity: { x: 0, y: 0 },
    animation: new AnimationState('run'),
    isOnGround: false,
    isOnLadder: false,
    isOnRope: false,
    isTrapped: false,
    trapTimer: 0
  }));
  
  // Reset level-specific state
  state.holes = [];
  state.goldRemaining = countGold(level.tiles);
  state.exitRevealed = false;
  state.levelTimer = 0;
}

/**
 * Counts the number of gold tiles in a tile grid.
 * Used to determine how much gold must be collected to complete a level.
 * 
 * @param tiles - 2D array of tile types
 * @returns The number of gold tiles found
 */
export function countGold(tiles: TileType[][]): number {
  let count = 0;
  for (const row of tiles) {
    for (const tile of row) {
      if (tile === TileType.Gold) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Validates that a level has all required fields and valid data.
 * Returns an array of validation error messages.
 * 
 * @param level - The level to validate
 * @returns Array of validation error messages (empty if valid)
 */
function validateLevel(level: Level): string[] {
  const errors: string[] = [];
  
  // Check required fields exist
  if (!level || typeof level.number !== 'number') {
    errors.push('Missing or invalid level number');
    return errors; // Can't continue validation without basic structure
  }
  
  if (typeof level.width !== 'number' || typeof level.height !== 'number') {
    errors.push('Missing or invalid dimensions');
  }
  
  if (level.width <= 0 || level.height <= 0) {
    errors.push('Dimensions must be positive');
  }
  
  // Check tiles array exists and has correct dimensions
  if (!Array.isArray(level.tiles)) {
    errors.push('Missing tiles array');
  } else {
    if (level.tiles.length !== level.height) {
      errors.push(`Tiles height mismatch: expected ${level.height}, got ${level.tiles.length}`);
    }
    
    for (let i = 0; i < level.tiles.length; i++) {
      if (!Array.isArray(level.tiles[i])) {
        errors.push(`Tiles row ${i} is not an array`);
      } else if (level.tiles[i].length !== level.width) {
        errors.push(`Tiles row ${i} width mismatch: expected ${level.width}, got ${level.tiles[i].length}`);
      }
    }
  }
  
  // Check player start position is valid
  if (!level.playerStart) {
    errors.push('Missing player start position');
  } else {
    if (typeof level.playerStart.x !== 'number' || typeof level.playerStart.y !== 'number') {
      errors.push('Invalid player start position coordinates');
    } else {
      if (level.playerStart.x < 0 || level.playerStart.x >= level.width) {
        errors.push(`Player start X out of bounds: ${level.playerStart.x}`);
      }
      if (level.playerStart.y < 0 || level.playerStart.y >= level.height) {
        errors.push(`Player start Y out of bounds: ${level.playerStart.y}`);
      }
    }
  }
  
  // Check enemy starts array exists
  if (!Array.isArray(level.enemyStarts)) {
    errors.push('Missing enemy starts array');
  } else {
    // Validate each enemy start position
    level.enemyStarts.forEach((enemyStart, index) => {
      if (!enemyStart) {
        errors.push(`Enemy ${index} start position is null/undefined`);
      } else if (typeof enemyStart.x !== 'number' || typeof enemyStart.y !== 'number') {
        errors.push(`Enemy ${index} has invalid coordinates`);
      } else {
        if (enemyStart.x < 0 || enemyStart.x >= level.width) {
          errors.push(`Enemy ${index} start X out of bounds: ${enemyStart.x}`);
        }
        if (enemyStart.y < 0 || enemyStart.y >= level.height) {
          errors.push(`Enemy ${index} start Y out of bounds: ${enemyStart.y}`);
        }
      }
    });
  }
  
  // Check par time is valid
  if (typeof level.parTime !== 'number' || level.parTime <= 0) {
    errors.push('Invalid par time: must be a positive number');
  }
  
  return errors;
}

/**
 * Validates that a level has all required fields and valid data.
 * Checks for proper dimensions, tile data, and spawn positions.
 * 
 * @param level - The level to validate
 * @returns true if level is valid, false otherwise
 */
export function isValidLevel(level: Level): boolean {
  return validateLevel(level).length === 0;
}

/**
 * Gets a level by its number.
 * 
 * @param levelNumber - The level number (1-100)
 * @returns The level object, or undefined if not found
 */
export function getLevel(levelNumber: number): Level | undefined {
  if (levelNumber < 1 || levelNumber > LEVELS.length) {
    return undefined;
  }
  return LEVELS[levelNumber - 1];
}
