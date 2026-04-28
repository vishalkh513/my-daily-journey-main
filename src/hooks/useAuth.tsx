import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface LocalUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface AuthCtx {
  user: LocalUser | null;
  loading: boolean;
  signIn: (user: LocalUser) => void;
  signOut: () => void;
}

const Ctx = createContext<AuthCtx>({ user: null, loading: true, signIn: () => {}, signOut: () => {} });

// Read user from localStorage synchronously (runs on app start)
const getStoredUser = (): LocalUser | null => {
  try {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Failed to parse stored user:', error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize with stored user (synchronous read on mount)
  const [user, setUser] = useState<LocalUser | null>(getStoredUser());
  const [loading, setLoading] = useState(false);

  const signIn = (userData: LocalUser) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const signOut = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPassword');
    setUser(null);
  };

  // Listen for auth events from authService
  useEffect(() => {
    const handleAuthChange = (event: any) => {
      const userData = event.detail;
      setUser(userData);
    };

    // Listen for auth events
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  return <Ctx.Provider value={{ user, loading, signIn, signOut }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
