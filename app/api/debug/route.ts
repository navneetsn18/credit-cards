import { NextResponse } from 'next/server';
import { canRead } from '@/lib/permissions';

export async function GET() {
  try {
    console.log('DEBUG: API endpoint called');
    console.log('DEBUG: canRead():', canRead());
    console.log('DEBUG: Environment variables check:');
    console.log('DEBUG: ALLOW_READ:', process.env.ALLOW_READ);
    console.log('DEBUG: ALLOW_WRITE:', process.env.ALLOW_WRITE);
    console.log('DEBUG: MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    return NextResponse.json({
      success: true,
      message: 'Debug endpoint working',
      permissions: {
        read: canRead(),
      },
      env: {
        allowRead: process.env.ALLOW_READ,
        mongodbUriExists: !!process.env.MONGODB_URI,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('DEBUG: Error in debug endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}