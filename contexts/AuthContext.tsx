import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useRouter } from "next/router";
import useAuthPersistence from "../hooks/useAuthPersistence";

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
  updateUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    tokens: null,
    user: null,
    userType: null,
    isLoading: true, // Comenzar con true para evitar renderizado prematuro
  });

  const router = useRouter();

  // Usar el hook de persistencia mejorado
  const authPersistence = useAuthPersistence({
    enableInDevelopment: false, // No persistir en desarrollo
    expirationHours: 24, // Expirar después de 24 horas
  });

  // Efecto para hidratar el estado desde localStorage
  useEffect(() => {
    if (authPersistence.isHydrated) {
      const storedAuth = authPersistence.loadFromStorage();

      if (storedAuth) {
        // Validar que los tokens no hayan expirado
        if (storedAuth.tokens?.expiresAt) {
          const expiresAt = new Date(storedAuth.tokens.expiresAt);
          if (expiresAt > new Date()) {
            setState({ ...storedAuth, isLoading: false });
          } else {
            // Token expirado, limpiar storage
            authPersistence.clearStorage();
            setState({
              tokens: null,
              user: null,
              userType: null,
              isLoading: false,
            });
          }
        } else if (storedAuth.tokens) {
          // Si hay tokens pero no tienen expiresAt, asumir que son válidos
          setState({ ...storedAuth, isLoading: false });
        } else {
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
    }
  }, [authPersistence.isHydrated]);

  // Persistir cambios en localStorage
  useEffect(() => {
    if (authPersistence.isHydrated && !state.isLoading) {
      authPersistence.saveToStorage(state);
    }
  }, [state, authPersistence.isHydrated]);

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

    if (state.tokens && authPersistence.isHydrated) {
      validateTokens();
      // Validar cada minuto
      const interval = setInterval(validateTokens, 60000);
      return () => clearInterval(interval);
    }
  }, [state.tokens, authPersistence.isHydrated]);

  const login = useCallback<AuthContextProps["login"]>(
    ({ tokens, user, userType }) => {
      setState({ tokens, user, userType, isLoading: false });
    },
    []
  );

  const logout = useCallback(() => {
    const currentUserType = state.userType;
    setState({ tokens: null, user: null, userType: null, isLoading: false });
    authPersistence.clearStorage();
    console.log("currentUserType", currentUserType);
    return;
    router.push(
      currentUserType === "admin" ? "/admin/login" : "/cliente/login"
    );
  }, [router, state.userType, authPersistence]);

  const isAuthenticated = !!(state.tokens && state.userType);

  const updateUser = useCallback<AuthContextProps["updateUser"]>(
    (user) => {
      setState({ ...state, user });
    },
    [state]
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isAuthenticated,
        isHydrated: authPersistence.isHydrated,
        updateUser,
      }}
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
