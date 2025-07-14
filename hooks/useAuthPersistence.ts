import { useEffect, useCallback, useState } from "react";

interface AuthData {
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
  } | null;
  user: any;
  userType: "admin" | "client" | null;
}

interface AuthPersistenceOptions {
  key?: string;
  expirationHours?: number;
  enableInDevelopment?: boolean;
}

const DEFAULT_OPTIONS: AuthPersistenceOptions = {
  key: "auth-storage",
  expirationHours: 24,
  enableInDevelopment: false, // Por defecto no persistir en desarrollo
};

const useAuthPersistence = (options: AuthPersistenceOptions = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);

  // Verificar si debemos persistir según el ambiente
  const shouldPersist = useCallback(() => {
    if (typeof window === "undefined") return false;

    const isProduction = process.env.NODE_ENV === "production";
    const isDevelopment = process.env.NODE_ENV === "development";

    // En producción siempre persistir
    if (isProduction) return true;

    // En desarrollo solo si está habilitado
    if (isDevelopment && config.enableInDevelopment) return true;

    return false;
  }, [config.enableInDevelopment]);

  // Generar clave única para el storage
  const getStorageKey = useCallback((key: string) => {
    const environment = process.env.NODE_ENV;
    return `${key}-${environment}`;
  }, []);

  // Validar si los datos han expirado
  const isExpired = useCallback(
    (data: any) => {
      if (!data.timestamp) return true;

      const timestamp = new Date(data.timestamp);
      const expirationTime = new Date(
        timestamp.getTime() + config.expirationHours! * 60 * 60 * 1000
      );

      return new Date() > expirationTime;
    },
    [config.expirationHours]
  );

  // Guardar datos en localStorage
  const saveToStorage = useCallback(
    (data: AuthData) => {
      if (!shouldPersist()) return;

      try {
        const storageData = {
          state: data,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          lastActivity: new Date().toISOString(),
        };

        const key = getStorageKey(config.key!);
        localStorage.setItem(key, JSON.stringify(storageData));

        // Actualizar actividad
        setLastActivity(new Date());
      } catch (error) {
        console.error("[Auth] Error guardando en localStorage:", error);
      }
    },
    [shouldPersist, getStorageKey, config.key]
  );

  // Cargar datos desde localStorage
  const loadFromStorage = useCallback((): AuthData | null => {
    if (!shouldPersist()) return null;

    try {
      const key = getStorageKey(config.key!);
      const stored = localStorage.getItem(key);

      if (!stored) return null;

      const parsed = JSON.parse(stored);

      // Verificar expiración
      if (isExpired(parsed)) {
        localStorage.removeItem(key);
        return null;
      }

      // Verificar que sea del mismo ambiente
      if (parsed.environment !== process.env.NODE_ENV) {
        localStorage.removeItem(key);
        return null;
      }

      // Actualizar última actividad
      if (parsed.lastActivity) {
        setLastActivity(new Date(parsed.lastActivity));
      }

      return parsed.state || parsed;
    } catch (error) {
      console.error("[Auth] Error cargando desde localStorage:", error);
      clearStorage();
      return null;
    }
  }, [shouldPersist, getStorageKey, config.key, isExpired]);

  // Limpiar storage
  const clearStorage = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const key = getStorageKey(config.key!);
      localStorage.removeItem(key);
      setLastActivity(null);
    } catch (error) {
      console.error("[Auth] Error limpiando localStorage:", error);
    }
  }, [getStorageKey, config.key]);

  // Limpiar todos los datos de auth (incluyendo otros ambientes)
  const clearAllAuthData = useCallback(() => {
    if (typeof window === "undefined") return;

    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(config.key!)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
      setLastActivity(null);
    } catch (error) {
      console.error("[Auth] Error limpiando todos los datos de auth:", error);
    }
  }, [config.key]);

  // Actualizar actividad del usuario
  const updateActivity = useCallback(() => {
    if (!shouldPersist()) return;

    setLastActivity(new Date());

    // Actualizar timestamp en localStorage si existe
    try {
      const key = getStorageKey(config.key!);
      const stored = localStorage.getItem(key);

      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.lastActivity = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    } catch (error) {
      console.error("[Auth] Error actualizando actividad:", error);
    }
  }, [shouldPersist, getStorageKey, config.key]);

  // Verificar inactividad
  const checkInactivity = useCallback(() => {
    if (!lastActivity || !shouldPersist()) return false;

    const inactivityLimit = 30 * 60 * 1000; // 30 minutos
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - lastActivity.getTime();

    return timeSinceLastActivity > inactivityLimit;
  }, [lastActivity, shouldPersist]);

  // Efecto para hidratar el estado al cargar
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsHydrated(true);
    }
  }, []);

  // Efecto para detectar actividad del usuario
  useEffect(() => {
    if (!shouldPersist() || !isHydrated) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const handleActivity = () => {
      updateActivity();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [shouldPersist, isHydrated, updateActivity]);

  // Efecto para verificar inactividad periódicamente
  useEffect(() => {
    if (!shouldPersist() || !isHydrated) return;

    const interval = setInterval(() => {
      if (checkInactivity()) {
        clearStorage();
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [shouldPersist, isHydrated, checkInactivity, clearStorage]);

  return {
    isHydrated,
    shouldPersist: shouldPersist(),
    saveToStorage,
    loadFromStorage,
    clearStorage,
    clearAllAuthData,
    updateActivity,
    checkInactivity,
    lastActivity,
    environment: process.env.NODE_ENV,
  };
};

export default useAuthPersistence;
