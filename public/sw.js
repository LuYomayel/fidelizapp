// Service Worker para Stampia PWA
const CACHE_NAME = "stampia-v1";
const STATIC_CACHE_NAME = "stampia-static-v1";
const API_CACHE_NAME = "stampia-api-v1";

// Detectar si estamos en desarrollo
const isDevelopment =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1";

// Archivos estáticos para cachear (solo en producción)
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/offline.html",
];

// Archivos que siempre deben ser frescos
const NEVER_CACHE = [
  "/api/auth/me",
  "/api/auth/refresh",
  "/_next/static/chunks/webpack",
  "/_next/static/development/",
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  NETWORK_FIRST: "network-first",
  CACHE_FIRST: "cache-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
};

// Configuración de rutas y estrategias
const ROUTE_STRATEGIES = {
  // API routes - siempre fresh en desarrollo
  "/api/": isDevelopment
    ? CACHE_STRATEGIES.NETWORK_ONLY
    : CACHE_STRATEGIES.NETWORK_FIRST,

  // Static assets
  "/_next/static/": CACHE_STRATEGIES.CACHE_FIRST,
  "/icons/": CACHE_STRATEGIES.CACHE_FIRST,

  // Pages - diferentes estrategias según ambiente
  "/": isDevelopment
    ? CACHE_STRATEGIES.NETWORK_ONLY
    : CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  "/cliente/": isDevelopment
    ? CACHE_STRATEGIES.NETWORK_ONLY
    : CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
  "/admin/": isDevelopment
    ? CACHE_STRATEGIES.NETWORK_ONLY
    : CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
};

// Utilidades
function shouldNeverCache(url) {
  return NEVER_CACHE.some((pattern) => url.includes(pattern));
}

function getRouteStrategy(url) {
  for (const [route, strategy] of Object.entries(ROUTE_STRATEGIES)) {
    if (url.includes(route)) {
      return strategy;
    }
  }
  return isDevelopment
    ? CACHE_STRATEGIES.NETWORK_ONLY
    : CACHE_STRATEGIES.NETWORK_FIRST;
}

function isApiRequest(url) {
  return url.includes("/api/");
}

function getCacheName(url) {
  if (isApiRequest(url)) return API_CACHE_NAME;
  if (url.includes("/_next/static/")) return STATIC_CACHE_NAME;
  return CACHE_NAME;
}

// Event Listeners

// Install event
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  // Solo cachear en producción
  if (!isDevelopment) {
    event.waitUntil(
      caches
        .open(STATIC_CACHE_NAME)
        .then((cache) => {
          console.log("[SW] Caching static assets");
          return cache.addAll(STATIC_ASSETS);
        })
        .catch((err) => {
          console.error("[SW] Error caching static assets:", err);
        })
    );
  }

  // Activar inmediatamente
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Limpiar caches antiguos
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== API_CACHE_NAME
          ) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Tomar control inmediatamente
  self.clients.claim();
});

// Fetch event
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Ignorar requests que no son GET
  if (event.request.method !== "GET") {
    return;
  }

  // Ignorar requests que nunca deben cachearse
  if (shouldNeverCache(url)) {
    return;
  }

  // En desarrollo, solo cachear assets estáticos críticos
  if (
    isDevelopment &&
    !url.includes("/_next/static/") &&
    !url.includes("/icons/")
  ) {
    return;
  }

  const strategy = getRouteStrategy(url);
  const cacheName = getCacheName(url);

  event.respondWith(handleRequest(event.request, strategy, cacheName));
});

// Estrategias de cache
async function handleRequest(request, strategy, cacheName) {
  const cache = await caches.open(cacheName);

  switch (strategy) {
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cache);

    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cache);

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cache);

    case CACHE_STRATEGIES.NETWORK_ONLY:
    default:
      return fetch(request);
  }
}

async function networkFirst(request, cache) {
  try {
    const networkResponse = await fetch(request);

    // Solo cachear respuestas exitosas
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback para páginas
    if (request.destination === "document") {
      return (
        cache.match("/offline.html") || new Response("Offline", { status: 503 })
      );
    }

    throw error;
  }
}

async function cacheFirst(request, cache) {
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[SW] Cache first failed:", error);
    throw error;
  }
}

async function staleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request);

  // Actualizar cache en background
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log("[SW] Background update failed:", error);
    });

  // Devolver cache si existe, sino esperar network
  return cachedResponse || networkPromise;
}

// Message event para comunicación con la app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => {
        event.ports[0].postMessage({ success: true });
      });
  }
});

// Sync event para background sync
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log("[SW] Background sync triggered");
  // Aquí puedes implementar sincronización de datos offline
}

console.log(
  "[SW] Service Worker loaded - Environment:",
  isDevelopment ? "Development" : "Production"
);
