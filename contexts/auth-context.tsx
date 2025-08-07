"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createSupabaseClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, fullName?: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  signInWithLinkedIn: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // Check if environment variables are available
    try {
      const supabase = createSupabaseClient();
      
      // Get initial session
      const getInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      };

      getInitialSession();

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);

          // If user signs in, we'll need to update the backend session tracking
          if (event === 'SIGNED_IN' && session?.user) {
            // Optionally sync user data to your backend
            console.log('User signed in:', session.user);
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      // Environment variables not configured, just set loading to false
      console.warn('Supabase not configured, auth features disabled');
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Authentication not configured' } };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      });
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Authentication not configured' } };
    }
  };

  const signOut = async () => {
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Redirect to homepage after successful sign out
      router.push('/');
    } catch (error) {
      console.warn('Sign out failed:', error);
      // Even if sign out fails, redirect to homepage for security
      router.push('/');
    }
  };

  const signInWithGoogle = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Authentication not configured' } };
    }
  };

  const signInWithLinkedIn = async () => {
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Authentication not configured' } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Authentication not configured' } };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });
      return { data, error };
    } catch (error) {
      return { data: null, error: { message: 'Authentication not configured' } };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithLinkedIn,
    resetPassword,
    updatePassword,
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
