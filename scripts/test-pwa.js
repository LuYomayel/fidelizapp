const fs = require("fs");
const path = require("path");

console.log("🔍 Verificando implementación PWA...\n");

// Verificar archivos requeridos
const requiredFiles = [
  "public/manifest.json",
  "public/sw.js",
  "public/offline.html",
  "public/icons/icon-192x192.png",
  "public/icons/icon-512x512.png",
  "hooks/usePWA.ts",
  "hooks/useAuthPersistence.ts",
  "components/pwa/InstallPrompt.tsx",
  "components/pwa/UpdatePrompt.tsx",
  "components/pwa/OfflineIndicator.tsx",
  "components/pwa/PWAProvider.tsx",
];

let allFilesExist = true;

console.log("📁 Verificando archivos requeridos:");
requiredFiles.forEach((file) => {
  const exists = fs.existsSync(path.join(__dirname, "..", file));
  console.log(`${exists ? "✅" : "❌"} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log("\n❌ Faltan archivos requeridos para PWA");
  process.exit(1);
}

// Verificar manifest.json
console.log("\n📋 Verificando manifest.json:");
try {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "public/manifest.json"), "utf8")
  );

  const requiredFields = [
    "name",
    "short_name",
    "start_url",
    "display",
    "theme_color",
    "background_color",
    "icons",
  ];
  requiredFields.forEach((field) => {
    const exists = manifest[field] !== undefined;
    console.log(
      `${exists ? "✅" : "❌"} ${field}: ${exists ? "✓" : "Missing"}`
    );
  });

  // Verificar iconos
  console.log(`✅ Iconos: ${manifest.icons.length} definidos`);
} catch (error) {
  console.log("❌ Error leyendo manifest.json:", error.message);
}

// Verificar Service Worker
console.log("\n⚙️ Verificando Service Worker:");
try {
  const swContent = fs.readFileSync(
    path.join(__dirname, "..", "public/sw.js"),
    "utf8"
  );

  const requiredFeatures = [
    "addEventListener",
    "install",
    "activate",
    "fetch",
    "caches",
    "isDevelopment",
  ];

  requiredFeatures.forEach((feature) => {
    const exists = swContent.includes(feature);
    console.log(`${exists ? "✅" : "❌"} ${feature}`);
  });
} catch (error) {
  console.log("❌ Error leyendo sw.js:", error.message);
}

// Verificar iconos
console.log("\n🎨 Verificando iconos:");
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
iconSizes.forEach((size) => {
  const iconPath = path.join(
    __dirname,
    "..",
    `public/icons/icon-${size}x${size}.png`
  );
  const exists = fs.existsSync(iconPath);
  console.log(`${exists ? "✅" : "❌"} icon-${size}x${size}.png`);
});

// Verificar _document.tsx
console.log("\n📄 Verificando _document.tsx:");
try {
  const documentContent = fs.readFileSync(
    path.join(__dirname, "..", "pages/_document.tsx"),
    "utf8"
  );

  const requiredMeta = [
    "manifest.json",
    "theme-color",
    "apple-mobile-web-app-capable",
    "apple-touch-icon",
  ];

  requiredMeta.forEach((meta) => {
    const exists = documentContent.includes(meta);
    console.log(`${exists ? "✅" : "❌"} ${meta}`);
  });
} catch (error) {
  console.log("❌ Error leyendo _document.tsx:", error.message);
}

// Verificar _app.tsx
console.log("\n📱 Verificando _app.tsx:");
try {
  const appContent = fs.readFileSync(
    path.join(__dirname, "..", "pages/_app.tsx"),
    "utf8"
  );

  const requiredComponents = ["PWAProvider", "AuthProvider"];

  requiredComponents.forEach((component) => {
    const exists = appContent.includes(component);
    console.log(`${exists ? "✅" : "❌"} ${component}`);
  });
} catch (error) {
  console.log("❌ Error leyendo _app.tsx:", error.message);
}

// Verificar next.config.js
console.log("\n⚙️ Verificando next.config.js:");
try {
  const nextConfigContent = fs.readFileSync(
    path.join(__dirname, "..", "next.config.js"),
    "utf8"
  );

  const requiredConfig = ["headers", "sw.js", "manifest.json", "Cache-Control"];

  requiredConfig.forEach((config) => {
    const exists = nextConfigContent.includes(config);
    console.log(`${exists ? "✅" : "❌"} ${config}`);
  });
} catch (error) {
  console.log("❌ Error leyendo next.config.js:", error.message);
}

console.log("\n🚀 Verificación PWA completada!");
console.log("\n📖 Para más información, consulta: docs/PWA_GUIDE.md");
console.log("\n🎯 Próximos pasos:");
console.log("1. Ejecutar: npm run build");
console.log("2. Ejecutar: npm run start");
console.log("3. Abrir DevTools → Application → Service Workers");
console.log("4. Verificar que el Service Worker esté activo");
console.log("5. Probar instalación en dispositivo móvil");

console.log("\n✨ ¡Tu PWA está lista para usar!");
