import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

import * as authService
  from '@/services/authService';

import {
  hasPermission,
  type RoleType,
  type PermissionType,
} from '@/config';

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
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (
    permission: PermissionType
  ) => boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  // ==========================================================
  // LOAD CURRENT AUTHENTICATED USER
  // ==========================================================

  const loadCurrentUser =
    useCallback(async () => {

      try {

        const currentUser =
          await authService.getCurrentUser();

        setUser(currentUser);

        setProfile(currentUser);

      } catch {

        authService.clearSavedUser();

        setUser(null);

        setProfile(null);
      }

    }, []);

  // ==========================================================
  // INITIAL AUTH CHECK
  // ==========================================================

  useEffect(() => {

    let mounted = true;

    const initialize =
      async () => {

        try {

          await authService.initializeCsrf();

          const currentUser =
            await authService.getCurrentUser();

          if (!mounted) {
            return;
          }

          setUser(currentUser);

          setProfile(currentUser);

        } catch {

          if (!mounted) {
            return;
          }

          authService.clearSavedUser();

          setUser(null);

          setProfile(null);

        } finally {

          if (mounted) {
            setIsLoading(false);
          }

        }
      };

    initialize();

    return () => {
      mounted = false;
    };

  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = useCallback(
    async (
      email: string,
      password: string
    ) => {

      const result =
        await authService.login(
          email,
          password
        );

      setUser(result.user);

      const currentUser =
        await authService.getCurrentUser();

      setProfile(currentUser);

    },
    []
  );

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = useCallback(
    async () => {

      await authService.logout();

      setUser(null);

      setProfile(null);

    },
    []
  );

  // ==========================================================
  // REFRESH PROFILE
  // ==========================================================

  const refreshProfile =
    useCallback(async () => {

      if (!user) {
        return;
      }

      try {

        const currentUser =
          await authService.getCurrentUser();

        setUser(currentUser);

        setProfile(currentUser);

      } catch {

        setUser(null);

        setProfile(null);
      }

    }, [user]);

  // ==========================================================
  // PERMISSIONS
  // ==========================================================

  const checkPermission =
    useCallback(
      (
        permission: PermissionType
      ): boolean => {

        if (!user) {
          return false;
        }

        return hasPermission(
          user.role as RoleType,
          permission
        );

      },
      [user]
    );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkPermission,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}