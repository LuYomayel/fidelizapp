import { useMemo } from "react";

interface Config {
  API_BASE_URL: string;
  UPLOADS_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
}

export function useConfig(): Config {
  return useMemo(() => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    return {
      API_BASE_URL,
      UPLOADS_URL: `${API_BASE_URL}/uploads`,
      APP_NAME: "Stampia",
      APP_VERSION: "1.0.0",
    };
  }, []);
}

// Función helper para obtener la URL completa de una imagen
export function getImageUrl(path?: string): string | null {
  if (!path) return null;

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Si ya es una URL completa, devolverla tal como está
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Si es una ruta relativa, construir la URL completa
  if (path.startsWith("/")) {
    return `${API_BASE_URL}/uploads${path}`;
  }

  // Si no tiene slash inicial, agregarlo
  return `${API_BASE_URL}/uploads/${path}`;
}
