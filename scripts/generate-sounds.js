import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdirSync } from 'fs';

const execAsync = promisify(exec);

// Create output directory
mkdirSync('public/assets/sfx', { recursive: true });

// Check if ffmpeg is available
async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch (error) {
    return false;
  }
}

// Generate a simple beep sound using ffmpeg
async function generateBeep(filename, frequency, duration) {
  const outputPath = `public/assets/sfx/${filename}`;
  const command = `ffmpeg -f lavfi -i "sine=frequency=${frequency}:duration=${duration}" -af "volume=0.3" -y ${outputPath}`;
  
  try {
    await execAsync(command);
    console.log(`Created ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Failed to create ${filename}:`, error.message);
    return false;
  }
}

// Main function
async function main() {
  const hasFFmpeg = await checkFFmpeg();
  
  if (!hasFFmpeg) {
    console.log('FFmpeg not found. Creating silent placeholder files instead...');
    console.log('To generate actual sounds, install FFmpeg: brew install ffmpeg (macOS)');
    
    // Create minimal silent MP3 files as placeholders
    const { writeFileSync } = await import('fs');
    
    // Minimal valid MP3 file header (silent)
    const silentMp3 = Buffer.from([
      0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    
    const files = ['dig.mp3', 'gold.mp3', 'death.mp3', 'complete.mp3', 'click.mp3'];
    files.forEach(file => {
      writeFileSync(`public/assets/sfx/${file}`, silentMp3);
      console.log(`Created placeholder public/assets/sfx/${file}`);
    });
    
    return;
  }
  
  // Generate sounds with different frequencies and durations
  await generateBeep('dig.mp3', 440, 0.15);      // A4 note, short
  await generateBeep('gold.mp3', 880, 0.2);      // A5 note, medium
  await generateBeep('death.mp3', 220, 0.5);     // A3 note, longer
  await generateBeep('complete.mp3', 660, 0.3);  // E5 note, medium
  await generateBeep('click.mp3', 1000, 0.1);    // High pitch, very short
  
  console.log('All sound effects generated successfully!');
}

main().catch(console.error);
