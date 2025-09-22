import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Card from '@/lib/models/CardName';
import { canRead, canWrite } from '@/lib/permissions';
import { getCardNamesWithBenefits } from '@/lib/cardUtils';

export async function GET() {
  try {
    console.log('GET /api/cards/names - Starting request');
    console.log('GET /api/cards/names - canRead():', canRead());
    console.log('GET /api/cards/names - Environment check:', {
      allowRead: process.env.ALLOW_READ,
      mongodbUri: !!process.env.MONGODB_URI,
    });
    
    if (!canRead()) {
      console.log('Read access denied');
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

    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully');

    console.log('Fetching cards from database...');
    
    // Get card names that actually have benefits
    // const cardNamesWithBenefits = await getCardNamesWithBenefits();
    
    // Only return cards that have benefits
    // const cards = await Card.find({ name: { $in: cardNamesWithBenefits } })
    const cards = await Card.find({})
      .select('name imageUrl')
      .sort({ name: 1 })
      .lean();
    console.log('Found cards with benefits:', cards.length);

    const response = NextResponse.json({
      success: true,
      data: cards,
      count: cards.length,
    });

    // Add cache headers - card names change less frequently
    response.headers.set('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    return response;
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
    console.log('POST /api/cards/names - canWrite():', canWrite());
    
    if (!canWrite()) {
      console.log('Write access denied');
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

export async function DELETE(request: NextRequest) {
  try {
    console.log('DELETE /api/cards/names - canWrite():', canWrite());
    
    if (!canWrite()) {
      console.log('Write access denied');
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
    const { name } = body;

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

    // Find and delete the card name
    const deletedCard = await Card.findOneAndDelete({ name: name.trim() });
    
    if (!deletedCard) {
      return NextResponse.json(
        {
          success: false,
          error: 'Card not found',
          message: 'No card found with the provided name',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deletedCard,
      message: 'Card name deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/cards/names error:', error);
    
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

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete card name',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}