import { NextRequest, NextResponse } from 'next/server';
import { checkUserNeedsPreferences } from '@/lib/preferences-utils';

export async function GET(request: NextRequest) {
  try {
    const result = await checkUserNeedsPreferences();
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      needsPreferences: result.needsPreferences,
      userPreferences: result.userPreferences
    });

  } catch (error) {
    console.error('Error checking preference status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}