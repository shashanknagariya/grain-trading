const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SOURCE_ICON = path.join(__dirname, '../src/assets/logo.png');
const OUTPUT_DIR = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Generate regular icons
ICON_SIZES.forEach(size => {
  sharp(SOURCE_ICON)
    .resize(size, size)
    .toFile(path.join(OUTPUT_DIR, `icon-${size}x${size}.png`))
    .then(() => console.log(`Generated ${size}x${size} icon`))
    .catch(err => console.error(`Error generating ${size}x${size} icon:`, err));
});

// Generate maskable icon (with padding for safe area)
sharp(SOURCE_ICON)
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
  .toFile(path.join(OUTPUT_DIR, 'maskable-icon.png'))
  .then(() => console.log('Generated maskable icon'))
  .catch(err => console.error('Error generating maskable icon:', err)); 