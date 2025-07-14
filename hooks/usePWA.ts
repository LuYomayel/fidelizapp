import { useState, useEffect, useCallback } from "react";

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isUpdateAvailable: boolean;
  isOnline: boolean;
  isSupported: boolean;
}

interface PWAActions {
  install: () => Promise<void>;
  skipWaiting: () => void;
  clearCache: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const usePWA = (): PWAState & PWAActions => {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isUpdateAvailable: false,
    isOnline: typeof window !== "undefined" ? navigator.onLine : true,
    isSupported: typeof window !== "undefined" && "serviceWorker" in navigator,
  });

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  // Verificar si la app está instalada
  const checkIfInstalled = useCallback(() => {
    if (typeof window === "undefined") return false;

    // Verificar si está en modo standalone (instalada)
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIOSStandalone = isIOS && (window.navigator as any).standalone;

    return isStandalone || isIOSStandalone;
  }, []);

  // Registrar service worker
  const registerServiceWorker = useCallback(async () => {
    if (!state.isSupported) return;

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      setRegistration(reg);

      console.log("[PWA] Service Worker registrado:", reg);

      // Verificar updates
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setState((prev) => ({ ...prev, isUpdateAvailable: true }));
            }
          });
        }
      });

      // Verificar si hay un SW esperando
      if (reg.waiting) {
        setState((prev) => ({ ...prev, isUpdateAvailable: true }));
      }
    } catch (error) {
      console.error("[PWA] Error registrando Service Worker:", error);
    }
  }, [state.isSupported]);

  // Instalar PWA
  const install = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] Usuario aceptó la instalación");
        setState((prev) => ({
          ...prev,
          isInstalled: true,
          isInstallable: false,
        }));
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error("[PWA] Error en instalación:", error);
    }
  }, [deferredPrompt]);

  // Aplicar update
  const skipWaiting = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }, [registration]);

  // Limpiar cache
  const clearCache = useCallback(async () => {
    if (!registration) return;

    try {
      const messageChannel = new MessageChannel();

      const promise = new Promise<void>((resolve) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve();
          }
        };
      });

      registration.active?.postMessage({ type: "CLEAR_CACHE" }, [
        messageChannel.port2,
      ]);

      await promise;
      console.log("[PWA] Cache limpiado");
    } catch (error) {
      console.error("[PWA] Error limpiando cache:", error);
    }
  }, [registration]);

  // Verificar updates manualmente
  const checkForUpdates = useCallback(async () => {
    if (!registration) return;

    try {
      await registration.update();
      console.log("[PWA] Verificación de updates completada");
    } catch (error) {
      console.error("[PWA] Error verificando updates:", error);
    }
  }, [registration]);

  // Effects
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Verificar si está instalada
    setState((prev) => ({ ...prev, isInstalled: checkIfInstalled() }));

    // Registrar service worker solo en producción
    if (process.env.NODE_ENV === "production") {
      registerServiceWorker();
    }

    // Event listeners
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState((prev) => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setState((prev) => ({
        ...prev,
        isInstalled: true,
        isInstallable: false,
      }));
      setDeferredPrompt(null);
    };

    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOnline: false }));
    };

    const handleControllerChange = () => {
      window.location.reload();
    };

    // Agregar event listeners
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        handleControllerChange
      );
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);

      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          handleControllerChange
        );
      }
    };
  }, [registerServiceWorker, checkIfInstalled]);

  return {
    ...state,
    install,
    skipWaiting,
    clearCache,
    checkForUpdates,
  };
};

export default usePWA;
