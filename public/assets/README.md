# Game Assets

This directory contains placeholder assets for the Lode Runner game.

## Sprite Sheets

All sprite sheets use 16x16 pixel frames arranged horizontally.

### player.png (128x32, 10 frames)
- Frame 0: Idle
- Frames 1-4: Run animation
- Frames 5-6: Climb animation
- Frame 7: Fall
- Frames 8-9: Dig animation

Color: Blue (#4169E1) with dark blue border (#1E3A8A)

### enemy.png (128x32, 9 frames)
- Frames 0-3: Run animation
- Frames 4-5: Climb animation
- Frame 6: Fall
- Frames 7-8: Trapped animation

Color: Red (#DC143C) with dark red border (#8B0000)

### tiles.png (128x16, 7 frames)
- Frame 0: Empty (black)
- Frame 1: Brick (brown #8B4513)
- Frame 2: Steel (gray #708090)
- Frame 3: Ladder (gold #DAA520)
- Frame 4: Rope (tan #CD853F)
- Frame 5: Gold (yellow #FFD700)
- Frame 6: Exit (green #00FF00)

## Sound Effects

All sound effects are simple sine wave beeps at different frequencies and durations.

- **dig.mp3**: 440 Hz, 0.15s - Played when digging a hole
- **gold.mp3**: 880 Hz, 0.2s - Played when collecting gold
- **death.mp3**: 220 Hz, 0.5s - Played when player dies
- **complete.mp3**: 660 Hz, 0.3s - Played when level is completed
- **click.mp3**: 1000 Hz, 0.1s - Played for UI interactions

## Regenerating Assets

To regenerate these placeholder assets:

```bash
# Generate sprite sheets
node scripts/generate-sprites.js

# Generate sound effects (requires FFmpeg)
node scripts/generate-sounds.js

# Verify all assets
node scripts/verify-assets.js
```

## Replacing with Final Assets

These are placeholder assets using simple colored rectangles and beep sounds. To replace with final game assets:

1. Replace PNG files in `public/assets/sprites/` with proper pixel art sprite sheets
2. Replace MP3 files in `public/assets/sfx/` with proper sound effects
3. Maintain the same file names and frame counts for compatibility
4. Keep sprite frames at 16x16 pixels
