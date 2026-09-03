'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  farmName: string;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (updated: Partial<UserProfile>) => void;
  getInitials: () => string;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  updateUser: () => {},
  getInitials: () => 'LF',
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const updateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const getInitials = () => {
    if (!user?.name) return 'LF';
    const words = user.name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        refreshUser: fetchUser,
        updateUser,
        getInitials,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
