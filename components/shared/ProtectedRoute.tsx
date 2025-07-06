import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ("admin" | "client")[];
}

export function ProtectedRoute({
  children,
  allowedUserTypes,
}: ProtectedRouteProps) {
  const { isAuthenticated, userType, isHydrated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir después de que se haya hidratado
    if (isHydrated && !isLoading) {
      if (!isAuthenticated) {
        // Redirigir a login según la ruta actual
        const isAdminRoute = router.pathname.startsWith("/admin");
        router.push(isAdminRoute ? "/admin/login" : "/cliente/login");
        return;
      }

      // Verificar tipo de usuario si se especifica
      if (
        allowedUserTypes &&
        userType &&
        !allowedUserTypes.includes(userType)
      ) {
        // Redirigir según el tipo de usuario
        if (userType === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/cliente/mi-tarjeta");
        }
        return;
      }
    }
  }, [
    isAuthenticated,
    userType,
    isHydrated,
    isLoading,
    router,
    allowedUserTypes,
  ]);

  // Mostrar loading mientras se hidrata
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  // Si el tipo de usuario no está permitido, no mostrar nada (se redirigirá)
  if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
    return null;
  }

  return <>{children}</>;
}
