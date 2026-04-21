import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  identifier?: string;
  setIdentifier: (identifier: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [identifier, setIdentifierState] = useState<string | undefined>(() => {
    return localStorage.getItem("p69_auth") || undefined;
  });

  const setIdentifier = (id: string) => {
    localStorage.setItem("p69_auth", id);
    setIdentifierState(id);
  };

  const signOut = () => {
    localStorage.removeItem("p69_auth");
    setIdentifierState(undefined);
  };

  return (
    <AuthContext.Provider value={{ identifier, setIdentifier, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
