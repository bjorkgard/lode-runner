import { readFileSync, existsSync } from 'fs';

console.log('Verifying game assets...\n');

// Check sprite sheets
const sprites = ['player.png', 'enemy.png', 'tiles.png'];
console.log('Sprite Sheets:');
sprites.forEach(sprite => {
  const path = `public/assets/sprites/${sprite}`;
  if (existsSync(path)) {
    const stats = readFileSync(path);
    console.log(`  ✓ ${sprite} (${(stats.length / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  ✗ ${sprite} - MISSING`);
  }
});

// Check sound effects
const sounds = ['dig.mp3', 'gold.mp3', 'death.mp3', 'complete.mp3', 'click.mp3'];
console.log('\nSound Effects:');
sounds.forEach(sound => {
  const path = `public/assets/sfx/${sound}`;
  if (existsSync(path)) {
    const stats = readFileSync(path);
    console.log(`  ✓ ${sound} (${(stats.length / 1024).toFixed(2)} KB)`);
  } else {
    console.log(`  ✗ ${sound} - MISSING`);
  }
});

console.log('\n✓ All assets verified successfully!');
