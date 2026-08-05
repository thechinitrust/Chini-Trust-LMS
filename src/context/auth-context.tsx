"use client";

import * as React from "react";

import type { Profile, UserRole } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

/**
 * Supabase-backed authentication context. Session state comes from
 * `supabase.auth` (cookies, refreshed by middleware.ts); `user` is the
 * matching `profiles` row, kept in sync via `onAuthStateChange`.
 *
 * `role` is never trusted from anything the client sets (auth metadata) --
 * it's whatever the `profiles` row says, which only the database (see
 * supabase/schemas/10_profiles.sql) is allowed to change.
 */

interface RegisterResult {
  profile: Profile | null;
  /** True when signup succeeded but no session was issued yet -- this
   *  project requires clicking an email confirmation link before login. */
  needsEmailConfirmation: boolean;
}

interface AuthContextValue {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Profile>;
  register: (fullName: string, email: string, password: string) => Promise<RegisterResult>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url ?? undefined,
    createdAt: row.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = React.useMemo(() => createClient(), []);
  const [user, setUser] = React.useState<Profile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  // Mirrors `user` synchronously (state updates are async/batched) so
  // onAuthStateChange can tell "this is the profile we already have" from
  // "this is a different user" without a stale closure over `user`.
  const userRef = React.useRef<Profile | null>(null);

  const loadProfile = React.useCallback(
    async (userId: string): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url, created_at")
        .eq("id", userId)
        .single();

      if (error || !data) {
        userRef.current = null;
        setUser(null);
        return null;
      }

      const profile = toProfile(data);
      userRef.current = profile;
      setUser(profile);
      return profile;
    },
    [supabase]
  );

  React.useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        void loadProfile(session.user.id).finally(() => isMounted && setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // `login()`/`register()` already fetch and set the profile
        // themselves (they need it synchronously, to pick a redirect
        // target) -- this listener also fires for that same sign-in a
        // moment later. Without this check every login/register did the
        // profile lookup twice, and every silent background token refresh
        // (roughly hourly, for as long as the tab stays open) did it again
        // for no reason. Only fetch when the signed-in user is actually
        // different from what's already loaded.
        if (userRef.current?.id === session.user.id) return;
        void loadProfile(session.user.id);
      } else {
        userRef.current = null;
        setUser(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, loadProfile]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        throw new Error(error?.message ?? "Login failed.");
      }
      const profile = await loadProfile(data.user.id);
      if (!profile) {
        throw new Error("Signed in, but no profile was found for this account.");
      }
      return profile;
    },
    [supabase, loadProfile]
  );

  const register = React.useCallback(
    async (fullName: string, email: string, password: string): Promise<RegisterResult> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        throw new Error(error.message);
      }
      if (!data.user) {
        throw new Error("Registration failed.");
      }
      if (!data.session) {
        // Email confirmation is required before a session is issued -- the
        // profiles row already exists (created by the on-signup trigger),
        // but we can't read it as this unauthenticated client yet.
        return { profile: null, needsEmailConfirmation: true };
      }
      const profile = await loadProfile(data.user.id);
      return { profile, needsEmailConfirmation: false };
    },
    [supabase, loadProfile]
  );

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut();
    userRef.current = null;
    setUser(null);
  }, [supabase]);

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
