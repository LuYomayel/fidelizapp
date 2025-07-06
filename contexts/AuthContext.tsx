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
  isHydrated: boolean; // Nuevo estado para controlar hidratación
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, setState] = useState<AuthState>({
    tokens: null,
    user: null,
    userType: null,
    isLoading: true, // Comenzar con true para evitar renderizado prematuro
  });

  const router = useRouter();

  // Efecto para hidratar el estado desde localStorage
  useEffect(() => {
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
              setState({ ...authState, isLoading: false });
            } else {
              // Token expirado, limpiar localStorage
              localStorage.removeItem("auth-storage");
              setState({
                tokens: null,
                user: null,
                userType: null,
                isLoading: false,
              });
            }
          } else if (authState.tokens) {
            // Si hay tokens pero no tienen expiresAt, asumir que son válidos
            setState({ ...authState, isLoading: false });
          } else {
            setState({
              tokens: null,
              user: null,
              userType: null,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Error parsing auth storage:", error);
          localStorage.removeItem("auth-storage");
          setState({
            tokens: null,
            user: null,
            userType: null,
            isLoading: false,
          });
        }
      } else {
        setState({
          tokens: null,
          user: null,
          userType: null,
          isLoading: false,
        });
      }
      setIsHydrated(true);
    }
  }, []);

  // Persistir cambios en localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && isHydrated) {
      // Guardar en la estructura que espera el api-client
      localStorage.setItem("auth-storage", JSON.stringify({ state }));
    }
  }, [state, isHydrated]);

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

    if (state.tokens && isHydrated) {
      validateTokens();
      // Validar cada minuto
      const interval = setInterval(validateTokens, 60000);
      return () => clearInterval(interval);
    }
  }, [state.tokens, isHydrated]);

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
    <AuthContext.Provider
      value={{ ...state, login, logout, isAuthenticated, isHydrated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
