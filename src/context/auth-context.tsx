"use client";

import * as React from "react";

import type { Profile, UserRole } from "@/lib/types";
import { CURRENT_ADMIN_ID, CURRENT_LEARNER_ID, mockProfiles } from "@/lib/mock-data";

/**
 * Mock authentication context.
 *
 * TODO(supabase): replace this whole provider with one backed by
 * `supabase.auth.onAuthStateChange` + a `profiles` table lookup. Every
 * consumer of `useAuth()` should keep working unchanged — only this file's
 * internals need to change (see docs/supabase-integration.md once written).
 *
 * For now, session state is simulated in memory + localStorage so the app
 * can demonstrate logged-out, learner, and admin states without a backend.
 * "Login" accepts any email/password; an email containing "admin" signs in
 * as the mock admin profile, anything else signs in as the mock learner.
 */

interface AuthContextValue {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, _password: string) => Promise<Profile>;
  register: (fullName: string, email: string, _password: string) => Promise<Profile>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "neurobridge.mock-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const storedId = window.localStorage.getItem(STORAGE_KEY);
    if (storedId) {
      const found = mockProfiles.find((p) => p.id === storedId);
      if (found) setUser(found);
    }
    setIsLoading(false);
  }, []);

  const persist = (profile: Profile | null) => {
    if (profile) {
      window.localStorage.setItem(STORAGE_KEY, profile.id);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const login = React.useCallback(async (email: string, _password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const profile = email.toLowerCase().includes("admin")
      ? mockProfiles.find((p) => p.id === CURRENT_ADMIN_ID)!
      : mockProfiles.find((p) => p.id === CURRENT_LEARNER_ID)!;
    setUser(profile);
    persist(profile);
    return profile;
  }, []);

  const register = React.useCallback(async (fullName: string, email: string, _password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const profile: Profile = {
      id: CURRENT_LEARNER_ID,
      fullName: fullName || "New Learner",
      email,
      role: "learner",
      createdAt: new Date().toISOString(),
    };
    setUser(profile);
    persist(profile);
    return profile;
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    persist(null);
  }, []);

  const value: AuthContextValue = {
    user,
    role: user?.role ?? null,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
