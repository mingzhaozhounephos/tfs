import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, name, role } = await request.json();

    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'Email, name, and role are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Create user in auth.users (this would typically be done through Supabase Auth)
    // For now, we'll create a placeholder user record
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        full_name: name,
        is_active: false // User needs to activate their account
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create role for the user
    const { error: roleError } = await supabase.from('roles').insert({
      user_id: user.id,
      role: role
    });

    if (roleError) {
      console.error('Error creating role:', roleError);
      return NextResponse.json(
        { error: 'Failed to create user role' },
        { status: 500 }
      );
    }

    // TODO: Send invitation email here
    // This would typically involve calling a service like SendGrid, Mailgun, etc.

    return NextResponse.json({
      message: 'User invited successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        role: role
      }
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
