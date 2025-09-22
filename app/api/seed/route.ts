import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CardPlatform from '@/lib/models/Card';
import Card from '@/lib/models/CardName';
import { canWrite } from '@/lib/permissions';

import { ICardPlatform } from '@/lib/models/Card';
import { ICard } from '@/lib/models/CardName';
// ...existing code...
const sampleCards: ICardPlatform[] = [
]

const sampleCardNames: ICard[] = [
]

export async function POST() {
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
    
    // Clear existing data
    await CardPlatform.deleteMany({});
    await Card.deleteMany({});
    console.log('Cleared existing data');
    
    // Insert sample card names first
    const cardNames = await Card.insertMany(sampleCardNames);
    console.log(`Inserted ${cardNames.length} card names`);
    
    // Insert sample card benefits
    const cardBenefits = await CardPlatform.insertMany(sampleCards);
    console.log(`Inserted ${cardBenefits.length} card benefits`);
    
    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully!',
      data: {
        cardNames: cardNames.length,
        cardBenefits: cardBenefits.length,
      }
    });
    
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}