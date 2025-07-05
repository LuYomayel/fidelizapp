import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { userType, tokens, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Si no hay tokens, permitir acceso a la página pública
    if (!tokens) {
      setIsLoading(false);
      return;
    }

    // Si hay tokens pero no hay userType, esperar a que se cargue
    if (tokens && !userType) {
      return;
    }

    // Si el usuario está autenticado, redirigir según su tipo
    if (userType) {
      if (userType === "admin") {
        router.replace("/admin/dashboard");
      } else if (userType === "client") {
        router.replace("/cliente/mi-tarjeta");
      }
      return;
    }

    setIsLoading(false);
  }, [tokens, userType, router, authLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
