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
}

interface AuthContextProps extends AuthState {
  login: (payload: {
    tokens: Tokens;
    user: any;
    userType: "admin" | "client";
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth-storage");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Compatibilidad con la estructura esperada por api-client
        return parsed.state || parsed;
      }
    }
    return { tokens: null, user: null, userType: null } as AuthState;
  });

  const router = useRouter();

  // Persistir cambios en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Guardar en la estructura que espera el api-client
      localStorage.setItem("auth-storage", JSON.stringify({ state }));
    }
  }, [state]);

  const login = useCallback<AuthContextProps["login"]>(
    ({ tokens, user, userType }) => {
      console.log("✅ AuthContext: Usuario autenticado", {
        userType,
        email: user?.email,
      });
      setState({ tokens, user, userType });
    },
    []
  );

  const logout = useCallback(() => {
    const currentUserType = state.userType;
    setState({ tokens: null, user: null, userType: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
    }
    console.log("🚪 AuthContext: Cerrando sesión", currentUserType);
    router.push(
      currentUserType === "admin" ? "/admin/login" : "/cliente/login"
    );
  }, [router, state.userType]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
