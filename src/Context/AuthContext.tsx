import { createContext, useContext, useState, ReactNode } from 'react';

// Define the user structure
export interface User {
  id: string;
  name: string;
  email: string;
  abhaId: string;
  role: string;
  organization: string;
}

// Define the shape of the Auth context
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context with type
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Simulate async API call
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));

      // Mock login logic
      if (email && password) {
        setUser({
          id: '1',
          name: 'Dr. Rajesh Kumar',
          email,
          abhaId: 'ABHA-2024-001234',
          role: 'Ayurveda Physician',
          organization: 'Government Ayurveda Hospital',
        });
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the Auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
