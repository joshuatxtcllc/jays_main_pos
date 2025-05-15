
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

type ReplitUser = {
  id: string;
  name: string;
  profileImage?: string;
};

type AuthState = {
  authenticated: boolean;
  user: ReplitUser | null;
  loading: boolean;
};

export const useReplitAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    user: null,
    loading: true,
  });

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      setAuthState({
        authenticated: data.authenticated,
        user: data.authenticated ? data.user : null,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking authentication status:', error);
      setAuthState({
        authenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = () => {
    window.addEventListener('message', authComplete);
    
    const h = 500;
    const w = 350;
    const left = window.screen.width / 2 - w / 2;
    const top = window.screen.height / 2 - h / 2;

    const authWindow = window.open(
      `https://replit.com/auth_with_repl_site?domain=${location.host}`,
      '_blank',
      `modal=yes,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,copyhistory=no,width=${w},height=${h},top=${top},left=${left}`
    );

    function authComplete(e: MessageEvent) {
      if (e.data !== 'auth_complete') {
        return;
      }

      window.removeEventListener('message', authComplete);
      authWindow?.close();
      checkAuthStatus();
    }
  };

  const logout = async () => {
    window.location.href = '/__replauthlogout';
  };

  return {
    authenticated: authState.authenticated,
    user: authState.user,
    loading: authState.loading,
    login,
    logout,
    checkAuthStatus,
  };
};

export const ReplitAuthButton: React.FC = () => {
  const { authenticated, user, loading, login, logout } = useReplitAuth();

  if (loading) {
    return <Button disabled>Loading...</Button>;
  }

  if (authenticated && user) {
    return (
      <div className="flex items-center gap-2">
        {user.profileImage && (
          <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full" />
        )}
        <span className="mr-2">{user.name}</span>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
    );
  }

  return <Button onClick={login}>Log in with Replit</Button>;
};

export default ReplitAuthButton;
