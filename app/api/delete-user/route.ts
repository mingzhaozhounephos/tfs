import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Delete user's roles first
    const { error: roleError } = await supabase
      .from('roles')
      .delete()
      .eq('user_id', userId);

    if (roleError) {
      console.error('Error deleting user roles:', roleError);
      return NextResponse.json(
        { error: 'Failed to delete user roles' },
        { status: 500 }
      );
    }

    // Delete user from users table
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) {
      console.error('Error deleting user:', userError);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    // TODO: Delete user from auth.users if needed
    // This would typically require admin privileges

    return NextResponse.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
