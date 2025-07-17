#!/usr/bin/env node

/**
 * Script para limpiar el caché del service worker en desarrollo
 * Uso: node scripts/clear-sw-cache.js
 */

const fs = require("fs");
const path = require("path");

console.log("🧹 Limpiando caché del service worker...");

// Rutas a limpiar
const pathsToClean = [".next", "node_modules/.cache", "public/sw.js"];

// Función para limpiar directorio recursivamente
function cleanDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directorio no existe: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      cleanDirectory(filePath);
      // No eliminar directorios, solo su contenido
    } else {
      // Eliminar archivos de caché específicos
      if (
        file.includes("cache") ||
        file.includes("sw") ||
        file.endsWith(".tmp")
      ) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Eliminado: ${filePath}`);
      }
    }
  }
}

// Función para limpiar archivo específico
function cleanFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️  Eliminado: ${filePath}`);
  } else {
    console.log(`⚠️  Archivo no existe: ${filePath}`);
  }
}

// Limpiar cada ruta
pathsToClean.forEach((pathToClean) => {
  const fullPath = path.resolve(pathToClean);

  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      cleanDirectory(fullPath);
    } else {
      cleanFile(fullPath);
    }
  } else {
    console.log(`⚠️  Ruta no existe: ${fullPath}`);
  }
});

console.log("✅ Limpieza completada!");
console.log("");
console.log("💡 Para desarrollo, también puedes:");
console.log("   1. Abrir DevTools > Application > Storage > Clear storage");
console.log("   2. Usar Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)");
console.log(
  "   3. Deshabilitar el service worker en DevTools > Application > Service Workers"
);
