# Game Mechanics

## Level System

The game includes **100 complete levels** with progressive difficulty:

### Levels 1-10: Tutorial and Introductory Levels

Fully designed levels that introduce game mechanics:

- **Level 1**: Simple gold collection tutorial
- **Level 2**: Introduction to digging mechanics
- **Level 3**: First enemy encounter
- **Level 4**: Ladders and ropes introduction
- **Level 5**: Enemy trapping mechanics
- **Level 6**: Multiple enemies
- **Level 7**: Steel barriers (non-diggable)
- **Level 8**: Complex maze navigation
- **Level 9**: Timing challenge with 4 enemies
- **Level 10**: Final test with 5 enemies

### Levels 11-100: Progressive Difficulty

Procedurally generated placeholder levels with:
- Gradually increasing difficulty
- More enemies and complex layouts
- Longer par times for time bonus

### Level Structure

Each level includes:
- Unique tile layout (28x16 grid)
- Player spawn position
- Enemy spawn positions (0-5 enemies)
- Par time for time bonus calculation
- Gold pieces to collect

## Controls

### Desktop (Keyboard)

- **Arrow Keys / WASD** - Move player
- **Z / Q** - Dig left
- **X / E** - Dig right
- **P / Escape** - Pause

### Mobile (Touch)

- On-screen D-pad for movement
- Dig left/right buttons

## Gameplay

1. Collect all gold pieces in the level
2. Avoid or trap enemies by digging holes
3. Reach the exit ladder after collecting all gold
4. Complete all 100 levels

## Tile Types

- **Empty** - Open space, player can fall through
- **Brick** - Diggable tiles that regenerate after 5 seconds
- **Steel** - Solid, non-diggable tiles
- **Ladder** - Climbable vertical movement
- **Rope** - Horizontal traversal without falling
- **Gold** - Collectible items (100 points each)
- **Exit** - Level completion point (revealed after all gold collected)

## Scoring

- **Gold Collection**: 100 points per gold piece
- **Time Bonus**: Points awarded for completing levels quickly
  - Bonus = (Par Time - Actual Time) × 10
  - Only awarded if level completed under par time
- **High Score**: Persisted to localStorage across sessions

## Lives System

- Start with 3 lives
- Lose a life when touching an enemy
- Game over when all lives are lost
- Level restarts with remaining lives

## Enemy Mechanics

- Enemies chase the player using pathfinding AI
- Enemies can be trapped by digging holes beneath them
- Trapped enemies are eliminated when holes regenerate
- Enemies respawn at level restart
