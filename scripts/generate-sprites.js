import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create placeholder sprite sheets with colored rectangles
function createSpriteSheet(name, frames, colors) {
  const frameSize = 16;
  const framesPerRow = 8;
  const rows = Math.ceil(frames.length / framesPerRow);
  
  const canvas = createCanvas(frameSize * framesPerRow, frameSize * rows);
  const ctx = canvas.getContext('2d');
  
  // Fill background with transparency
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw each frame
  frames.forEach((frameData, index) => {
    const x = (index % framesPerRow) * frameSize;
    const y = Math.floor(index / framesPerRow) * frameSize;
    
    // Draw colored rectangle
    ctx.fillStyle = frameData.color;
    ctx.fillRect(x + 2, y + 2, frameSize - 4, frameSize - 4);
    
    // Add border
    ctx.strokeStyle = frameData.border || '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 2, y + 2, frameSize - 4, frameSize - 4);
    
    // Add label if provided
    if (frameData.label) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(frameData.label, x + frameSize / 2, y + frameSize / 2 + 2);
    }
  });
  
  // Save to file
  const buffer = canvas.toBuffer('image/png');
  const outputPath = `public/assets/sprites/${name}.png`;
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, buffer);
  console.log(`Created ${outputPath}`);
}

// Player sprite sheet (10 frames)
const playerFrames = [
  { color: '#4169E1', border: '#1E3A8A', label: '0' },  // idle
  { color: '#4169E1', border: '#1E3A8A', label: '1' },  // run 1
  { color: '#4169E1', border: '#1E3A8A', label: '2' },  // run 2
  { color: '#4169E1', border: '#1E3A8A', label: '3' },  // run 3
  { color: '#4169E1', border: '#1E3A8A', label: '4' },  // run 4
  { color: '#4169E1', border: '#1E3A8A', label: '5' },  // climb 1
  { color: '#4169E1', border: '#1E3A8A', label: '6' },  // climb 2
  { color: '#4169E1', border: '#1E3A8A', label: '7' },  // fall
  { color: '#4169E1', border: '#1E3A8A', label: '8' },  // dig 1
  { color: '#4169E1', border: '#1E3A8A', label: '9' },  // dig 2
];

// Enemy sprite sheet (9 frames)
const enemyFrames = [
  { color: '#DC143C', border: '#8B0000', label: '0' },  // run 1
  { color: '#DC143C', border: '#8B0000', label: '1' },  // run 2
  { color: '#DC143C', border: '#8B0000', label: '2' },  // run 3
  { color: '#DC143C', border: '#8B0000', label: '3' },  // run 4
  { color: '#DC143C', border: '#8B0000', label: '4' },  // climb 1
  { color: '#DC143C', border: '#8B0000', label: '5' },  // climb 2
  { color: '#DC143C', border: '#8B0000', label: '6' },  // fall
  { color: '#DC143C', border: '#8B0000', label: '7' },  // trapped 1
  { color: '#DC143C', border: '#8B0000', label: '8' },  // trapped 2
];

// Tiles sprite sheet (7 frames for 7 tile types)
const tileFrames = [
  { color: '#000000', border: '#000000', label: '' },     // Empty (0)
  { color: '#8B4513', border: '#654321', label: '' },     // Brick (1)
  { color: '#708090', border: '#2F4F4F', label: '' },     // Steel (2)
  { color: '#DAA520', border: '#B8860B', label: '' },     // Ladder (3)
  { color: '#CD853F', border: '#8B4513', label: '' },     // Rope (4)
  { color: '#FFD700', border: '#FFA500', label: '' },     // Gold (5)
  { color: '#00FF00', border: '#008000', label: '' },     // Exit (6)
];

// Generate all sprite sheets
createSpriteSheet('player', playerFrames);
createSpriteSheet('enemy', enemyFrames);
createSpriteSheet('tiles', tileFrames);

console.log('All sprite sheets generated successfully!');
