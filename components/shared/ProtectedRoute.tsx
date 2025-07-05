import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ("admin" | "client")[];
  redirectTo?: string;
  requireAuth?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedUserTypes = [],
  redirectTo,
  requireAuth = true,
}: ProtectedRouteProps) {
  const { userType, tokens, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Si no requiere autenticación, permitir acceso
    if (!requireAuth) {
      setIsLoading(false);
      return;
    }

    // Si no hay tokens, redirigir al login correspondiente
    if (!tokens) {
      const currentPath = router.pathname;
      let loginPath = "/";

      // Determinar la ruta de login basada en la ruta actual
      if (currentPath.startsWith("/admin")) {
        loginPath = "/admin/login";
      } else if (currentPath.startsWith("/cliente")) {
        loginPath = "/cliente/login";
      } else if (currentPath.startsWith("/negocio")) {
        loginPath = "/negocio/login";
      } else {
        // Para rutas generales, redirigir a la página principal
        loginPath = "/";
      }

      router.replace(loginPath);
      return;
    }

    // Si hay tokens pero no hay userType, esperar a que se cargue
    if (tokens && !userType) {
      return;
    }

    // Si se especificaron tipos de usuario permitidos, verificar
    if (
      allowedUserTypes.length > 0 &&
      userType &&
      !allowedUserTypes.includes(userType)
    ) {
      // Redirigir según el tipo de usuario autenticado
      let redirectPath = "/";
      if (userType === "admin") {
        redirectPath = "/admin/dashboard";
      } else if (userType === "client") {
        redirectPath = "/cliente/mi-tarjeta";
      }

      router.replace(redirectPath);
      return;
    }

    // Si se especifica una redirección personalizada
    if (redirectTo) {
      router.replace(redirectTo);
      return;
    }

    setIsLoading(false);
  }, [
    tokens,
    userType,
    router,
    allowedUserTypes,
    redirectTo,
    requireAuth,
    authLoading,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
