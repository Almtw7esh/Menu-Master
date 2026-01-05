import React, { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut, getUser } from '@/lib/supabaseAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  const login = async (email: string, password: string) => {
    const response = await signIn(email, password);
    setUser(response?.user ?? null);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUser();
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
