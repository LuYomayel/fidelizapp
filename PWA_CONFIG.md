# Configuración de PWA y Caché para Stampia

## 🎯 Problema Resuelto

El problema principal era que el service worker estaba cacheando contenido en desarrollo, lo que requería usar `Cmd+Shift+R` constantemente para ver los cambios. Ahora la PWA respeta el ambiente de desarrollo y solo cachea en producción.

## 🔧 Configuración por Ambiente

### Variables de Entorno

La PWA usa `NEXT_PUBLIC_ENV` para determinar el comportamiento:

```bash
# Desarrollo local
NEXT_PUBLIC_ENV=development

# Testing
NEXT_PUBLIC_ENV=testing

# Producción
NEXT_PUBLIC_ENV=production
```

### Comportamiento por Ambiente

| Ambiente        | Service Worker   | Caché             | Comportamiento                |
| --------------- | ---------------- | ----------------- | ----------------------------- |
| **Development** | ❌ No registrado | ❌ No cachea      | Sin caché, cambios inmediatos |
| **Testing**     | ✅ Registrado    | ⚠️ Cache limitado | Cache para assets estáticos   |
| **Production**  | ✅ Registrado    | ✅ Cache completo | Cache completo para PWA       |

## 🛠️ Archivos Modificados

### 1. Service Worker (`public/sw.js`)

- **Detección de ambiente**: Usa `NEXT_PUBLIC_ENV` o fallback por hostname
- **Estrategias de caché**: Diferentes según el ambiente
- **Logging mejorado**: Muestra el ambiente detectado

### 2. Next.js Config (`next.config.js`)

- **Inyección de variables**: Las variables de entorno se inyectan en el SW
- **Cache busting**: Build ID único por ambiente
- **Headers optimizados**: Para service worker y manifest

### 3. Hook PWA (`hooks/usePWA.ts`)

- **Registro condicional**: Solo registra SW en producción/testing
- **Logging mejorado**: Muestra el ambiente en los logs

## 🚀 Scripts Disponibles

```bash
# Limpiar caché del service worker
npm run clear:cache

# Iniciar desarrollo con caché limpio
npm run dev:clean

# Verificar PWA
npm run test:pwa

# Generar iconos
npm run generate:icons
```

## 🐛 Debug en Desarrollo

### Panel de Debug PWA

En desarrollo, aparece un botón flotante azul que abre un panel con:

- **Información del ambiente**: Variables de entorno
- **Estado de PWA**: Soporte, online, instalable, etc.
- **Acciones**: Limpiar caché, verificar updates, recargar
- **Tips**: Comandos útiles para desarrollo

### Acceso al Panel

1. El panel solo aparece en desarrollo (`NEXT_PUBLIC_ENV=development`)
2. Botón flotante en la esquina inferior derecha
3. Click para abrir/cerrar el panel

## 🔍 Troubleshooting

### Problema: Cambios no se ven en desarrollo

**Solución:**

```bash
# Opción 1: Usar script de limpieza
npm run dev:clean

# Opción 2: Limpiar manualmente
npm run clear:cache
npm run dev

# Opción 3: Hard refresh
Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)
```

### Problema: Service worker no se actualiza

**Solución:**

1. Abrir DevTools → Application → Service Workers
2. Click en "Unregister" para el SW actual
3. Recargar la página
4. El SW se registrará nuevamente

### Problema: Cache persistente

**Solución:**

1. DevTools → Application → Storage
2. Click en "Clear storage"
3. Recargar la página

## 📱 Instalación de PWA

### Criterios de Instalación

La PWA solo es instalable cuando:

1. **Ambiente**: No es desarrollo
2. **HTTPS**: La app está en HTTPS (excepto localhost)
3. **Manifest**: El manifest.json es válido
4. **Service Worker**: Está registrado y funcionando

### Proceso de Instalación

1. El navegador detecta que la app es instalable
2. Se muestra el prompt de instalación
3. Usuario acepta la instalación
4. La app se instala como PWA nativa

## 🔄 Updates de PWA

### Detección de Updates

1. El service worker verifica updates automáticamente
2. Si hay un nuevo SW, se marca como "waiting"
3. Se muestra notificación al usuario
4. Usuario puede aplicar el update

### Aplicación de Updates

```javascript
// En el hook usePWA
const { skipWaiting } = usePWA();

// Aplicar update
skipWaiting();
// La página se recarga automáticamente
```

## 📊 Monitoreo

### Logs del Service Worker

Los logs del SW muestran:

- Ambiente detectado
- Estrategias de caché aplicadas
- Requests cacheados/ignorados
- Errores de caché

### Console del Navegador

```javascript
// Verificar estado de PWA
console.log("PWA State:", {
  isSupported: "serviceWorker" in navigator,
  isInstalled: window.matchMedia("(display-mode: standalone)").matches,
  environment: process.env.NEXT_PUBLIC_ENV,
});
```

## 🎯 Mejores Prácticas

### Desarrollo

1. **Usar `npm run dev:clean`** para desarrollo limpio
2. **Panel de debug** para monitorear estado
3. **Hard refresh** cuando sea necesario
4. **Deshabilitar SW** en DevTools si causa problemas

### Testing

1. **Verificar caché** funciona correctamente
2. **Probar instalación** de PWA
3. **Simular offline** para testing
4. **Verificar updates** funcionan

### Producción

1. **Cache completo** para mejor performance
2. **Service worker** siempre activo
3. **Updates automáticos** para usuarios
4. **Fallback offline** funcionando

## 🔧 Configuración Avanzada

### Personalizar Estrategias de Caché

En `public/sw.js`, modificar `getRouteStrategies()`:

```javascript
const getRouteStrategies = () => {
  if (isDevelopment) {
    return {
      // Personalizar estrategias para desarrollo
      "/api/": CACHE_STRATEGIES.NETWORK_ONLY,
      "/_next/static/": CACHE_STRATEGIES.CACHE_FIRST,
      // ...
    };
  }
  // ...
};
```

### Agregar Rutas al Caché

En `public/sw.js`, modificar `STATIC_ASSETS`:

```javascript
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/offline.html",
  // Agregar nuevas rutas aquí
];
```

### Excluir Rutas del Caché

En `public/sw.js`, modificar `NEVER_CACHE`:

```javascript
const NEVER_CACHE = [
  "/api/auth/me",
  "/api/auth/refresh",
  "/_next/static/chunks/webpack",
  "/_next/static/development/",
  "/_next/webpack-hmr",
  // Agregar nuevas rutas aquí
];
```
