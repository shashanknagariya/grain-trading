import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ICONS_DIR = path.join(__dirname, '../public/icons');
const SOURCE_ICON = path.join(__dirname, '../src/assets/logo.png');

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Only generate icons if they don't exist
const generateIconIfNotExists = async (size, filename) => {
  const outputPath = path.join(ICONS_DIR, filename);
  
  if (!fs.existsSync(outputPath)) {
    console.log(`Generating ${filename}...`);
    await sharp(SOURCE_ICON)
      .resize(size, size)
      .toFile(outputPath);
  }
};

async function generateIcons() {
  try {
    // Generate standard icons
    await generateIconIfNotExists(192, 'icon-192x192.png');
    await generateIconIfNotExists(512, 'icon-512x512.png');

    // Generate maskable icon with padding
    const maskableOutput = path.join(ICONS_DIR, 'maskable-icon.png');
    if (!fs.existsSync(maskableOutput)) {
      console.log('Generating maskable icon...');
      await sharp(SOURCE_ICON)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .extend({
          top: 64,
          bottom: 64,
          left: 64,
          right: 64,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .resize(512, 512)
        .toFile(maskableOutput);
    }

    console.log('Icon generation complete!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons(); 