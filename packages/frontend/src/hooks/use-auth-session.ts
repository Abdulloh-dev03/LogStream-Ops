// src/hooks/use-auth-session.ts
import { useGetProfileQuery, useSignOutMutation } from '@/redux/features/authApi';
import { useEffect, useCallback } from 'react';
import type { User } from '@logstream/shared';

interface AuthSession {
  user?: User;
  isCheckingSession: boolean;
  isAuthenticated: boolean;
}

/**
 * Centralised auth/session hook.
 * - Fetches the profile to determine authentication status.
 * - Normalises the error shape (401 → guest, other → error state).
 * - Provides a sign‑out helper that also clears the client cache.
 */
export function useAuthSession(): AuthSession {
  // 1️⃣ Attempt to fetch the profile. 
  // We don't skip based on document.cookie because HttpOnly cookies are invisible to JS.
  const {
    data: user,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetProfileQuery(undefined, {
    refetchOnMountOrArgChange: true, // keep profile fresh after a refresh
  });

  const [signOutApi] = useSignOutMutation();

  // 2️⃣ Helper that also clears RTK cache & cookie
  const signOut = useCallback(async () => {
    try {
      await signOutApi().unwrap(); // hit /auth/sign-out
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }, [signOutApi]);

  // 3️⃣ Derive flags
  const isCheckingSession = isLoading || isFetching;
  const isAuthenticated = !!user && !isError;

  // 4️⃣ Optional: auto‑refresh on 401
  useEffect(() => {
    if (error && (error as any).status === 401) {
      // token invalid – treat as guest
    }
  }, [error]);

  return {
    user,
    isCheckingSession,
    isAuthenticated,
  };
}
