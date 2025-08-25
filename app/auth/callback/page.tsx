"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createSupabaseClient();
        
        // Check if we have auth params (email confirmation or password reset)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const urlParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || urlParams.get('refresh_token');
        const type = hashParams.get('type') || urlParams.get('type');
        
        
        if (accessToken && refreshToken) {
          // We have tokens - set the session
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Error setting session:', error);
            router.push('/auth/login?error=session_failed');
            return;
          }
          
          if (data.session) {
            
            // Check if this is a password recovery
            if (type === 'recovery') {
              // Redirect to password reset page
              router.push('/auth/reset-password');
              return;
            } else {
              // Regular email confirmation - go to home page
              setTimeout(() => {
                router.push('/');
              }, 1000);
              return;
            }
          }
        }
        
        // Fallback: try to get existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth/login?error=auth_failed');
          return;
        }

        if (data.session) {
          setTimeout(() => {
            router.push('/');
          }, 500);
        } else {
          router.push('/auth/login?message=please_sign_in');
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error);
        router.push('/auth/login?error=configuration');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f0efe1] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
