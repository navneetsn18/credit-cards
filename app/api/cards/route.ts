import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CardPlatform from '@/lib/models/Card';
import { canRead, canWrite } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    if (!canRead()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          message: 'Read access is disabled',
          data: [],
          count: 0,
        },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    let query = {};
    if (platform) {
      query = { platformName: { $regex: platform, $options: 'i' } };
    }

    const cards = await CardPlatform.find(query)
      .sort({ rewardRate: -1, cardName: 1 })
      .lean();

    console.log('GET /api/cards - Found cards:', cards.length);
    console.log('GET /api/cards - Sample card:', cards[0] || 'No cards found');

    const response = NextResponse.json({
      success: true,
      data: cards,
      count: cards.length,
    });

    // Add cache headers for better performance
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch (error) {
    console.error('GET /api/cards error:', error);
    
    // Check if it's a MongoDB authentication error
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database authentication failed',
          message: 'MongoDB credentials are invalid. Please check your environment variables.',
          data: [],
          count: 0,
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cards',
        message: error instanceof Error ? error.message : 'Database connection failed',
        data: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!canWrite()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied',
          message: 'Write access is disabled',
        },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { cardName, platformName, platformImageUrl, rewardRate, description } = body;

    // Validate required fields
    if (!cardName || !platformName || !rewardRate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'cardName, platformName, and rewardRate are required',
        },
        { status: 400 }
      );
    }

    const newCard = new CardPlatform({
      cardName: cardName.trim(),
      platformName: platformName.trim(),
      platformImageUrl: platformImageUrl?.trim() || '',
      rewardRate: rewardRate.trim(),
      description: description?.trim() || '',
    });

    const savedCard = await newCard.save();

    return NextResponse.json({
      success: true,
      data: savedCard,
      message: 'Card created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/cards error:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create card',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}