const fs = require("fs");
const path = require("path");

// Función para crear un icono SVG básico
function createBasicIcon(size) {
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fondo con gradiente -->
  <rect width="${size}" height="${size}" fill="url(#grad1)" rx="${size * 0.1}"/>
  
  <!-- Letra F estilizada -->
  <text x="50%" y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        fill="white" 
        font-family="Arial, sans-serif" 
        font-weight="bold" 
        font-size="${size * 0.6}">F</text>
  
  <!-- Pequeño punto decorativo -->
  <circle cx="${size * 0.8}" cy="${size * 0.2}" r="${
    size * 0.05
  }" fill="white" opacity="0.8"/>
</svg>`;

  return svg;
}

// Función para convertir SVG a PNG (placeholder - en producción usarías sharp o similar)
function createIconPlaceholder(size) {
  const content = `<!-- Icono ${size}x${size} - Reemplazar con imagen real -->
${createBasicIcon(size)}`;

  return content;
}

// Tamaños de iconos PWA requeridos
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Crear directorio si no existe
const iconsDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generar iconos
iconSizes.forEach((size) => {
  const iconContent = createIconPlaceholder(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, iconContent);
  console.log(`✅ Creado: ${filename}`);
});

// Crear favicon.ico placeholder
const faviconContent = createBasicIcon(32);
fs.writeFileSync(path.join(__dirname, "../public/favicon.svg"), faviconContent);
console.log("✅ Creado: favicon.svg");

// Crear apple-touch-icon
const appleTouchIcon = createBasicIcon(180);
fs.writeFileSync(path.join(iconsDir, "apple-touch-icon.svg"), appleTouchIcon);
console.log("✅ Creado: apple-touch-icon.svg");

console.log("\n📱 Iconos PWA básicos creados!");
console.log(
  "💡 Recomendación: Reemplaza los archivos SVG con imágenes PNG reales para mejor compatibilidad."
);
console.log(
  "🎨 Puedes usar herramientas como https://realfavicongenerator.net/ para generar iconos profesionales."
);
