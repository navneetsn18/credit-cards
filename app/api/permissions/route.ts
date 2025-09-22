import { NextResponse } from 'next/server';
import { getPermissions } from '@/lib/permissions';

export async function GET() {
  try {
    const permissions = getPermissions();
    
    return NextResponse.json({
      success: true,
      permissions,
    });
  } catch (error) {
    console.error('GET /api/permissions error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get permissions',
        message: error instanceof Error ? error.message : 'Unknown error',
        permissions: { read: false, write: false },
      },
      { status: 500 }
    );
  }
}