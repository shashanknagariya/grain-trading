const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Source image (you'll need to provide this)
const SOURCE_ICON = path.join(__dirname, '../src/assets/logo.png');

const SIZES = [192, 512];

SIZES.forEach(size => {
  sharp(SOURCE_ICON)
    .resize(size, size)
    .toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`))
    .then(info => console.log(`Generated ${size}x${size} icon`))
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
  .toFile(path.join(ICONS_DIR, 'maskable-icon.png'))
  .then(() => console.log('Generated maskable icon'))
  .catch(err => console.error('Error generating maskable icon:', err)); 