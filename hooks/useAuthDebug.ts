import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";

export const useAuthDebug = () => {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("🔍 AuthDebug: Estado actual", {
      pathname: router.pathname,
      isLoading: auth.isLoading,
      isAuthenticated: auth.isAuthenticated,
      userType: auth.userType,
      hasTokens: !!auth.tokens,
      userEmail: auth.user?.email,
    });
  }, [
    auth.isLoading,
    auth.isAuthenticated,
    auth.userType,
    auth.tokens,
    auth.user,
    router.pathname,
  ]);

  return {
    ...auth,
    debugInfo: {
      currentPath: router.pathname,
      isPublicRoute:
        router.pathname === "/" ||
        router.pathname.startsWith("/cliente/login") ||
        router.pathname.startsWith("/admin/login") ||
        router.pathname.startsWith("/negocio/"),
      isClientRoute: router.pathname.startsWith("/cliente/"),
      isAdminRoute: router.pathname.startsWith("/admin/"),
      isBusinessRoute: router.pathname.startsWith("/negocio/"),
    },
  };
};
