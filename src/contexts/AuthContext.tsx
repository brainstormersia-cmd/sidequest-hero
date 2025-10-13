import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  type AuthError,
  type PostgrestError,
  type Session,
  type User
} from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  rating_average: number;
  rating_count: number;
  total_earnings: number;
  missions_completed: number;
  missions_created: number;
  is_verified: boolean;
  account_type?: 'worker' | 'employer' | 'admin';
  onboarding_completed?: boolean;
  skills?: string[] | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: PostgrestError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (nextSession: Session | null) => {
    if (!nextSession?.user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', nextSession.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile', error);
      setProfile(null);
      return;
    }

    if (data) {
      setProfile(data as Profile);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        if (!isMounted) return;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        await loadProfile(nextSession);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) {
        return;
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
      await loadProfile(data.session);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/`
      : undefined;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      const missingUserError: PostgrestError = {
        message: 'No user found',
        code: 'P0001',
        details: null,
        hint: null
      };
      return { error: missingUserError };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  const value = {
    session,
    user,
    profile,
    loading,
    signUp,
    signIn,
    resetPassword,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}