/**
 * Creates simple SVG icons for PWA
 * Run: node create-icons.js
 * (from the client/public directory)
 */
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

// SVG template — purple gradient with 💰 emoji
function makeSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6"/>
      <stop offset="50%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#6d28d9"/>
    </linearGradient>
    <radialGradient id="glow" cx="40%" cy="35%" r="60%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.18)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" ry="${size * 0.22}" fill="url(#bg)"/>
  <rect width="${size}" height="${size}" rx="${size * 0.22}" ry="${size * 0.22}" fill="url(#glow)"/>
  <text x="${size / 2}" y="${size / 2 + size * 0.07}" font-size="${size * 0.46}" text-anchor="middle" dominant-baseline="middle" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji">💰</text>
</svg>`;
}

// Write SVG icons (usable directly as icons too)
fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), makeSVG(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), makeSVG(512));

console.log('✅ SVG icons created in public/icons/');
console.log('   • public/icons/icon-192.svg');
console.log('   • public/icons/icon-512.svg');
console.log('\n⚠️  For PNG: rename-copy these SVG files as .png OR use an online SVG-to-PNG converter.');
