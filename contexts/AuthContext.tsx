import { createContext, useContext, useEffect, useState } from "react";
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
      if (stored) return JSON.parse(stored);
    }
    return { tokens: null, user: null, userType: null } as AuthState;
  });

  const router = useRouter();

  // Persistir cambios en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth-storage", JSON.stringify(state));
    }
  }, [state]);

  const login: AuthContextProps["login"] = ({ tokens, user, userType }) => {
    console.log("login", { tokens, user, userType });
    setState({ tokens, user, userType });
  };

  const logout = () => {
    setState({ tokens: null, user: null, userType: null });
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-storage");
    }
    router.push(state.userType === "admin" ? "/admin/login" : "/cliente/login");
  };

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
