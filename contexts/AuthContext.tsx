import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/router";

interface Tokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string; // ISO string
}

interface AuthState {
  tokens: Tokens | null;
  user: any;
  userType: "admin" | "client" | null;
  isLoading: boolean;
}

interface AuthContextProps extends AuthState {
  login: (payload: {
    tokens: Tokens;
    user: any;
    userType: "admin" | "client";
  }) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth-storage");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const authState = parsed.state || parsed;

          // Validar que los tokens no hayan expirado
          if (authState.tokens?.expiresAt) {
            const expiresAt = new Date(authState.tokens.expiresAt);
            if (expiresAt > new Date()) {
              return { ...authState, isLoading: false };
            } else {
              // Token expirado, limpiar localStorage

              localStorage.removeItem("auth-storage");
            }
          } else if (authState.tokens) {
            // Si hay tokens pero no tienen expiresAt, asumir que son válidos

            return { ...authState, isLoading: false };
          }
        } catch (error) {
          console.error("Error parsing auth storage:", error);
          localStorage.removeItem("auth-storage");
        }
      }
    }
    return {
      tokens: null,
      user: null,
      userType: null,
      isLoading: false, // Cambiar a false para evitar loops
    } as AuthState;
  });

  const router = useRouter();

  // Persistir cambios en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Guardar en la estructura que espera el api-client
      localStorage.setItem("auth-storage", JSON.stringify({ state }));
    }
  }, [state]);

  // Validar tokens al cargar la aplicación
  useEffect(() => {
    const validateTokens = () => {
      if (state.tokens?.expiresAt) {
        const expiresAt = new Date(state.tokens.expiresAt);
        if (expiresAt <= new Date()) {
          logout();
        }
      }
    };

    if (state.tokens) {
      validateTokens();
      // Validar cada minuto
      const interval = setInterval(validateTokens, 60000);
      return () => clearInterval(interval);
    }
  }, [state.tokens]);

  const login = useCallback<AuthContextProps["login"]>(
    ({ tokens, user, userType }) => {
      setState({ tokens, user, userType, isLoading: false });
    },
    []
  );

  const logout = useCallback(() => {
    const currentUserType = state.userType;
    setState({ tokens: null, user: null, userType: null, isLoading: false });
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
    }

    router.push(
      currentUserType === "admin" ? "/admin/login" : "/cliente/login"
    );
  }, [router, state.userType]);

  const isAuthenticated = !!(state.tokens && state.userType);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
