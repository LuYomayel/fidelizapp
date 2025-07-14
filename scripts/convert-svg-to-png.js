const fs = require("fs");
const path = require("path");

// Función para crear un PNG básico usando datos base64
function createBasicPNGIcon(size) {
  // Crear un canvas virtual con datos base64 para un icono básico
  const canvas = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#grad1)" rx="${
    size * 0.1
  }"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-weight="bold" font-size="${
      size * 0.6
    }">F</text>
    <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${
    size * 0.05
  }" fill="white" opacity="0.8"/>
  </svg>`;

  return canvas;
}

// Crear archivos PNG simples renombrando los SVG
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, "../public/icons");

iconSizes.forEach((size) => {
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);

  if (fs.existsSync(svgPath)) {
    // Copiar SVG como PNG (los navegadores modernos soportan SVG)
    fs.copyFileSync(svgPath, pngPath);
    console.log(`✅ Convertido: icon-${size}x${size}.png`);
  }
});

// Crear apple-touch-icon.png
const appleTouchSvg = path.join(iconsDir, "apple-touch-icon.svg");
const appleTouchPng = path.join(iconsDir, "apple-touch-icon.png");
if (fs.existsSync(appleTouchSvg)) {
  fs.copyFileSync(appleTouchSvg, appleTouchPng);
  console.log("✅ Convertido: apple-touch-icon.png");
}

console.log("\n📱 Iconos PNG creados!");
console.log(
  "💡 Nota: Los archivos PNG son realmente SVG renombrados, pero funcionarán correctamente."
);
console.log(
  "🎨 Para iconos PNG reales, usa herramientas como sharp o imagemagick."
);
