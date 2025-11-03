import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export interface UserPreferences {
  interviewDate?: string;
  interviewFrequency?: string;
  preferencesCompleted?: boolean;
  preferencesSkippedAt?: string;
}

export async function checkUserNeedsPreferences(): Promise<{
  needsPreferences: boolean;
  userPreferences?: UserPreferences;
  error?: string;
}> {
  try {
    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { needsPreferences: false, error: 'User not authenticated' };
    }

    // Get user preferences from database
    const { data, error } = await supabase
      .from('users')
      .select('interview_date, interview_frequency, preferences_completed, preferences_skipped_at')
      .eq('id', user.id)
      .single();

    if (error) {
      // If user doesn't exist in the users table yet, they need to set preferences
      if (error.code === 'PGRST116') {
        return { needsPreferences: true };
      }
      console.error('Database error:', error);
      return { needsPreferences: false, error: 'Failed to fetch user data' };
    }

    const userPreferences: UserPreferences = {
      interviewDate: data?.interview_date,
      interviewFrequency: data?.interview_frequency,
      preferencesCompleted: data?.preferences_completed,
      preferencesSkippedAt: data?.preferences_skipped_at
    };

    // Check if user has completed preferences
    if (data?.preferences_completed === true) {
      return { needsPreferences: false, userPreferences };
    }

    // If preferences_completed is false (user cancelled/left page), always show preferences
    if (data?.preferences_completed === false) {
      return { needsPreferences: true, userPreferences };
    }

    // Check if user skipped recently (within 12 hours) - only if they haven't cancelled
    if (data?.preferences_skipped_at && data?.preferences_completed !== false) {
      const skippedAt = new Date(data.preferences_skipped_at);
      const now = new Date();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      
      if (skippedAt > twelveHoursAgo) {
        // User skipped within the last 12 hours, don't ask again
        return { needsPreferences: false, userPreferences };
      }
    }

    // User needs to set preferences
    return { needsPreferences: true, userPreferences };

  } catch (error) {
    console.error('Error checking user preferences:', error);
    return { needsPreferences: false, error: 'Internal server error' };
  }
}

export function shouldShowPreferences(userPreferences?: UserPreferences): boolean {
  // If no preferences data, show preferences
  if (!userPreferences) {
    return true;
  }

  // If user has completed preferences, don't show
  if (userPreferences.preferencesCompleted === true) {
    return false;
  }

  // If user skipped recently (within 12 hours), don't show
  if (userPreferences.preferencesSkippedAt) {
    const skippedAt = new Date(userPreferences.preferencesSkippedAt);
    const now = new Date();
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
    if (skippedAt > twelveHoursAgo) {
      return false;
    }
  }

  // Show preferences in all other cases
  return true;
}