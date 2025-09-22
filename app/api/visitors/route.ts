import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Visitor from '@/lib/models/Visitor';

function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to a default IP for development
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const clientIP = getClientIP(request);
    
    // Check if visitor exists
    let visitor = await Visitor.findOne({ ipAddress: clientIP });
    
    if (visitor) {
      // Update existing visitor
      visitor.lastVisit = new Date();
      visitor.visitCount += 1;
      await visitor.save();
    } else {
      // Create new visitor
      visitor = new Visitor({
        ipAddress: clientIP,
        firstVisit: new Date(),
        lastVisit: new Date(),
        visitCount: 1,
      });
      await visitor.save();
    }

    // Get total unique visitors count
    const totalUniqueVisitors = await Visitor.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        totalUniqueVisitors,
        isNewVisitor: visitor.visitCount === 1,
        visitCount: visitor.visitCount,
      },
    });
  } catch (error) {
    console.error('POST /api/visitors error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track visitor',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const totalUniqueVisitors = await Visitor.countDocuments();
    const totalVisits = await Visitor.aggregate([
      {
        $group: {
          _id: null,
          totalVisits: { $sum: '$visitCount' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUniqueVisitors,
        totalVisits: totalVisits[0]?.totalVisits || 0,
      },
    });
  } catch (error) {
    console.error('GET /api/visitors error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get visitor stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}