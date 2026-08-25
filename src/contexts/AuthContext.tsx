// ============================================================
// AUTH CONTEXT - Manages authentication state throughout the app
// DEVELOPMENT ONLY: Uses mock authentication.
// When backend is ready, replace mock auth calls with real API.
// ============================================================

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import * as authService from '@/services/authService';
import { hasPermission, type RoleType, type PermissionType } from '@/config';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  employeeId: string;
}

interface UserProfile extends AuthUser {
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  phone: string;
  avatar: string | null;
  status: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (permission: PermissionType) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check for saved session
  useEffect(() => {
    const session = authService.getSavedSession();
    if (session) {
      setUser(session.user);
      loadProfile(session.user.employeeId);
    }
    setIsLoading(false);
  }, []);

  const loadProfile = async (employeeId: string) => {
    try {
      const prof = await authService.getCurrentUser(employeeId);
      setProfile(prof);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    setUser(result.user);
    authService.saveSession(result.user, result.token);
    await loadProfile(result.user.employeeId);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.employeeId);
  }, [user]);

  const checkPermission = useCallback((permission: PermissionType): boolean => {
    if (!user) return false;
    return hasPermission(user.role as RoleType, permission);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      checkPermission,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
