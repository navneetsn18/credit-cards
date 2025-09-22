import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CardPlatform from '@/lib/models/Card';
import mongoose from 'mongoose';
import { canWrite } from '@/lib/permissions';
import { cleanupOrphanedCardNames } from '@/lib/cardUtils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid ID',
          message: 'Please provide a valid card ID',
        },
        { status: 400 }
      );
    }

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

    const updatedCard = await CardPlatform.findByIdAndUpdate(
      id,
      {
        cardName: cardName.trim(),
        platformName: platformName.trim(),
        platformImageUrl: platformImageUrl?.trim() || '',
        rewardRate: rewardRate.trim(),
        description: description?.trim() || '',
      },
      { new: true, runValidators: true }
    );

    if (!updatedCard) {
      return NextResponse.json(
        {
          success: false,
          error: 'Card not found',
          message: 'No card found with the provided ID',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCard,
      message: 'Card updated successfully',
    });
  } catch (error) {
    console.error('PUT /api/cards/[id] error:', error);
    
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
        error: 'Failed to update card',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid ID',
          message: 'Please provide a valid card ID',
        },
        { status: 400 }
      );
    }

    const deletedCard = await CardPlatform.findByIdAndDelete(id);

    if (!deletedCard) {
      return NextResponse.json(
        {
          success: false,
          error: 'Card not found',
          message: 'No card found with the provided ID',
        },
        { status: 404 }
      );
    }

    // Clean up orphaned card names after deleting benefits
    const orphanedCards = await cleanupOrphanedCardNames();
    
    const message = orphanedCards.length > 0 
      ? `Card deleted successfully. Also removed ${orphanedCards.length} unused card name(s).`
      : 'Card deleted successfully';

    return NextResponse.json({
      success: true,
      data: deletedCard,
      message,
      orphanedCardsRemoved: orphanedCards,
    });
  } catch (error) {
    console.error('DELETE /api/cards/[id] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete card',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}