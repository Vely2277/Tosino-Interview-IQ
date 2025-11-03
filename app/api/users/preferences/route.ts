import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { interviewDate, interviewFrequency, action } = await request.json();
    
    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Handle skip action
    if (action === 'skip') {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
          preferences_skipped_at: new Date().toISOString(),
          preferences_completed: null, // Reset to null when skipped
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to save skip status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Preferences skipped successfully'
      });
    }

    // Handle mark incomplete action (user visited the page but didn't complete)
    if (action === 'mark_incomplete') {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
          preferences_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to mark preferences as incomplete' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Preferences marked as incomplete'
      });
    }

    // Handle setting preferences (normal flow)
    // Validate input
    if (!interviewDate || !interviewFrequency) {
      return NextResponse.json(
        { error: 'Interview date and frequency are required' },
        { status: 400 }
      );
    }

    // Validate frequency
    const validFrequencies = ['daily', 'weekly', 'bi-weekly', 'monthly'];
    if (!validFrequencies.includes(interviewFrequency)) {
      return NextResponse.json(
        { error: 'Invalid frequency. Must be daily, weekly, bi-weekly, or monthly' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(interviewDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Check if date is today or in the future
    const selectedDate = new Date(interviewDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json(
        { error: 'Interview date must be today or in the future' },
        { status: 400 }
      );
    }

    // Update user preferences in database (or create if user doesn't exist)
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name,
        interview_date: interviewDate,
        interview_frequency: interviewFrequency,
        preferences_completed: true,
        preferences_skipped_at: null, // Clear skip timestamp when preferences are set
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Preferences saved successfully',
      data: data?.[0]
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Get user preferences from database
    const { data, error } = await supabase
      .from('users')
      .select('interview_date, interview_frequency, preferences_completed, preferences_skipped_at')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      interviewDate: data?.interview_date,
      interviewFrequency: data?.interview_frequency,
      preferencesCompleted: data?.preferences_completed,
      preferencesSkippedAt: data?.preferences_skipped_at
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}