import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'driver'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "driver"' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Update user's role
    const { error: roleError } = await supabase
      .from('roles')
      .update({ role })
      .eq('user_id', userId);

    if (roleError) {
      console.error('Error updating user role:', roleError);
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      role
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
