# Guía PWA - FidelizApp

## 🚀 Implementación PWA Completa

Esta guía explica cómo funciona la implementación PWA (Progressive Web App) en FidelizApp.

## 📋 Características Implementadas

### ✅ Core PWA Features

- **Service Worker** con cache inteligente
- **Manifest.json** para instalación
- **Iconos PWA** en múltiples tamaños
- **Página offline** funcional
- **Persistencia de autenticación** mejorada

### ✅ Funcionalidades Avanzadas

- **Instalación automática** con prompt personalizado
- **Actualizaciones automáticas** con notificación
- **Indicador de estado offline**
- **Cache diferenciado** por ambiente (dev/prod)
- **Persistencia inteligente** que no interfiere en desarrollo

## 🛠️ Arquitectura

### Service Worker (`/public/sw.js`)

```javascript
// Detecta automáticamente el ambiente
const isDevelopment = self.location.hostname === "localhost";

// Estrategias de cache diferenciadas:
// - Desarrollo: Solo assets críticos
// - Producción: Cache completo con estrategias inteligentes
```

### Estrategias de Cache

- **Network First**: APIs y datos dinámicos
- **Cache First**: Assets estáticos (iconos, CSS)
- **Stale While Revalidate**: Páginas principales
- **Network Only**: Desarrollo y endpoints críticos

### Persistencia de Autenticación

```typescript
// Solo persiste en producción por defecto
const authPersistence = useAuthPersistence({
  enableInDevelopment: false, // No interferir en desarrollo
  expirationHours: 24, // Sesiones de 24 horas
});
```

## 🎯 Configuración por Ambiente

### Desarrollo

- **Cache**: Deshabilitado para evitar problemas
- **Persistencia**: Opcional (deshabilitada por defecto)
- **Service Worker**: Solo assets críticos

### Producción

- **Cache**: Habilitado con estrategias inteligentes
- **Persistencia**: Habilitada automáticamente
- **Service Worker**: Funcionalidad completa

## 🔧 Componentes PWA

### 1. InstallPrompt

```typescript
import InstallPrompt from "../components/pwa/InstallPrompt";
// Se muestra automáticamente cuando la app es instalable
```

### 2. UpdatePrompt

```typescript
import UpdatePrompt from "../components/pwa/UpdatePrompt";
// Notifica cuando hay actualizaciones disponibles
```

### 3. OfflineIndicator

```typescript
import OfflineIndicator from "../components/pwa/OfflineIndicator";
// Muestra estado de conexión
```

### 4. PWAProvider

```typescript
import PWAProvider from "../components/pwa/PWAProvider";
// Engloba toda la funcionalidad PWA
```

## 📱 Instalación

### Android

1. Abrir Chrome/Edge
2. Visitar la app
3. Tap en "Instalar app" o usar el prompt automático
4. La app aparecerá en el launcher

### iOS

1. Abrir Safari
2. Visitar la app
3. Tap "Compartir" → "Agregar a pantalla de inicio"
4. La app aparecerá en la pantalla de inicio

### Desktop

1. Abrir Chrome/Edge
2. Visitar la app
3. Click en el icono de instalación en la barra de direcciones
4. La app aparecerá como aplicación nativa

## 🎨 Iconos y Assets

### Iconos Generados

- **16x16** a **512x512** - Todos los tamaños requeridos
- **Apple Touch Icons** - Soporte iOS
- **Favicon** - Navegadores
- **Microsoft Tiles** - Windows

### Ubicación

```
public/
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── ...
│   └── apple-touch-icon.png
├── manifest.json
├── sw.js
└── offline.html
```

## 🔄 Actualizaciones

### Automáticas

- El Service Worker verifica actualizaciones automáticamente
- Muestra notificación cuando hay nueva versión
- Usuario puede aplicar actualización inmediatamente

### Manuales

```typescript
const { checkForUpdates, skipWaiting } = usePWA();

// Verificar actualizaciones
await checkForUpdates();

// Aplicar actualización
skipWaiting();
```

## 📊 Cache Management

### Limpiar Cache

```typescript
const { clearCache } = usePWA();
await clearCache();
```

### Estrategias por Ruta

- `/api/` - Network First (datos frescos)
- `/_next/static/` - Cache First (assets estáticos)
- `/` - Stale While Revalidate (páginas principales)

## 🛡️ Persistencia Segura

### Características

- **Expiración automática** después de 24 horas
- **Detección de inactividad** (30 minutos)
- **Limpieza por ambiente** (dev/prod separados)
- **Validación de tokens** automática

### Configuración

```typescript
const authPersistence = useAuthPersistence({
  key: "auth-storage",
  expirationHours: 24,
  enableInDevelopment: false, // Cambiar a true para testing
});
```

## 📈 Métricas PWA

### Lighthouse Score Esperado

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 90+
- **PWA**: 100

### Verificar PWA

1. Abrir DevTools
2. Ir a "Application" tab
3. Verificar:
   - Service Worker activo
   - Manifest válido
   - Cache Storage funcionando

## 🐛 Debugging

### Service Worker

```javascript
// En DevTools Console
navigator.serviceWorker.getRegistrations().then((registrations) => {
  console.log("SW Registrations:", registrations);
});
```

### Cache

```javascript
// Ver caches disponibles
caches.keys().then((keys) => console.log("Cache Keys:", keys));
```

### Estado PWA

```typescript
const pwaState = usePWA();
console.log("PWA State:", pwaState);
```

## 🚀 Despliegue

### Checklist Pre-Despliegue

- [ ] Manifest.json configurado correctamente
- [ ] Service Worker registrado
- [ ] Iconos en todos los tamaños
- [ ] HTTPS habilitado (requerido para PWA)
- [ ] Cache headers configurados

### Variables de Entorno

```bash
# Producción
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api-fidelizapp.luciano-yomayel.com

# Desarrollo
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 📚 Recursos Adicionales

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

## 🔧 Mantenimiento

### Actualizaciones del Service Worker

1. Modificar `/public/sw.js`
2. Cambiar `CACHE_NAME` para forzar actualización
3. Desplegar nueva versión

### Agregar Nuevas Rutas al Cache

```javascript
// En sw.js
const ROUTE_STRATEGIES = {
  "/nueva-ruta/": CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  // ...
};
```

---

**¡Tu app FidelizApp ahora es una PWA completa! 🎉**
