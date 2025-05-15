
import React, { createContext, useContext, ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useReplitAuth } from '../components/ReplitAuth';

// Create a context for authentication
const AuthContext = createContext<ReturnType<typeof useReplitAuth> | undefined>(undefined);

// Provider component that wraps the app
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useReplitAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Component to protect routes that require authentication
export const ProtectedRoute: React.FC<{ 
  children: ReactNode;
  fallback?: string; 
}> = ({ children, fallback = '/' }) => {
  const { authenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to fallback if not authenticated and not loading
  React.useEffect(() => {
    if (!authenticated && !loading) {
      setLocation(fallback);
    }
  }, [authenticated, loading, fallback, setLocation]);

  // Show loading state or render children
  if (loading) {
    return <div>Loading...</div>;
  }

  return authenticated ? <>{children}</> : null;
};

export default useAuth;
