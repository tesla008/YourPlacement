import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types.ts';
import { api, setStoredToken } from '../lib/api.ts';

export type DemoRoleKey =
  | 'admin'
  | 'cs_coord'
  | 'it_coord'
  | 'mech_coord'
  | 'student_rahul'
  | 'student_sanika'
  | 'student_rohan'
  | 'student_ananya';

export type AppMode = 'student' | 'tpo';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  switchMode: (targetMode: AppMode) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  switchDemoRole: (roleKey: DemoRoleKey) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Derive mode directly from current user role
  const mode: AppMode = user?.role === 'student' ? 'student' : 'tpo';

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await api.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Auto login as demo admin on fresh initial launch
          try {
            const res = await api.login('admin@college.edu', 'admin123');
            setUser(res.user);
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.error('Failed to load user session', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.login(email, password);
    setUser(res.user);
    return res.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
      setStoredToken(null);
    }
  };

  const switchDemoRole = async (roleKey: DemoRoleKey): Promise<User> => {
    const creds: Record<DemoRoleKey, { email: string; password: string }> = {
      admin: { email: 'admin@college.edu', password: 'admin123' },
      cs_coord: { email: 'cs.coord@college.edu', password: 'coord123' },
      it_coord: { email: 'it.coord@college.edu', password: 'coord123' },
      mech_coord: { email: 'mech.coord@college.edu', password: 'coord123' },
      student_rahul: { email: 'rahul.sharma@college.edu', password: 'student123' },
      student_sanika: { email: 'sanika.joshi@college.edu', password: 'student123' },
      student_rohan: { email: 'rohan.verma@college.edu', password: 'student123' },
      student_ananya: { email: 'ananya.iyer@college.edu', password: 'student123' },
    };

    const target = creds[roleKey];
    const res = await api.login(target.email, target.password);
    setUser(res.user);
    return res.user;
  };

  const switchMode = async (targetMode: AppMode): Promise<User> => {
    if (targetMode === 'student' && user?.role !== 'student') {
      return switchDemoRole('student_rahul');
    } else if (targetMode === 'tpo' && user?.role === 'student') {
      return switchDemoRole('admin');
    }
    return user!;
  };

  const setMode = (newMode: AppMode) => {
    switchMode(newMode);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        mode,
        setMode,
        switchMode,
        login,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
