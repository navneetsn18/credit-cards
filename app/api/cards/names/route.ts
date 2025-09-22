import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Card from '@/lib/models/CardName';
import { canRead, canWrite } from '@/lib/permissions';

export async function GET() {
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

    const cards = await Card.find({})
      .select('name imageUrl')
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: cards,
      count: cards.length,
    });
  } catch (error) {
    console.error('GET /api/cards/names error:', error);
    
    // Check if it's a MongoDB authentication error
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database authentication failed',
          message: 'Please check your MongoDB credentials in the environment variables',
          data: [],
          count: 0,
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch card names',
        message: error instanceof Error ? error.message : 'Unknown error',
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
    const { name, imageUrl } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field',
          message: 'Card name is required',
        },
        { status: 400 }
      );
    }

    // Check if card name already exists
    const existingCard = await Card.findOne({ name: name.trim() });
    if (existingCard) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duplicate card name',
          message: 'A card with this name already exists',
        },
        { status: 409 }
      );
    }

    const newCard = new Card({
      name: name.trim(),
      imageUrl: imageUrl?.trim() || '',
    });

    const savedCard = await newCard.save();

    return NextResponse.json({
      success: true,
      data: savedCard,
      message: 'Card name created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/cards/names error:', error);
    
    // Check if it's a MongoDB authentication error
    if (error instanceof Error && error.message.includes('Authentication failed')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database authentication failed',
          message: 'Please check your MongoDB credentials in the environment variables',
        },
        { status: 500 }
      );
    }
    
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
        error: 'Failed to create card name',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}