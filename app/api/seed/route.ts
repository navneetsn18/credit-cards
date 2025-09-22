import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CardPlatform from '@/lib/models/Card';
import Card from '@/lib/models/CardName';
import { canWrite } from '@/lib/permissions';

const sampleCards = [
  {
    cardName: "Chase Sapphire Preferred",
    platformName: "Amazon",
    platformImageUrl: "https://logo.clearbit.com/amazon.com",
    rewardRate: "2x points",
    description: "2x points on Amazon purchases",
  },
  {
    cardName: "Chase Sapphire Preferred", 
    platformName: "Restaurants",
    platformImageUrl: "",
    rewardRate: "3x points",
    description: "3x points on dining and restaurants",
  },
  {
    cardName: "American Express Gold",
    platformName: "Groceries",
    platformImageUrl: "",
    rewardRate: "4x points",
    description: "4x points on supermarket purchases",
  },
  {
    cardName: "American Express Gold",
    platformName: "Restaurants", 
    platformImageUrl: "",
    rewardRate: "4x points",
    description: "4x points on dining worldwide",
  },
  {
    cardName: "Capital One Venture X",
    platformName: "Travel",
    platformImageUrl: "",
    rewardRate: "2x miles",
    description: "2x miles on all travel purchases",
  }
];

const sampleCardNames = [
  {
    name: "Chase Sapphire Preferred",
    imageUrl: "https://creditcards.chase.com/K-Marketplace/images/cardart/sapphire_preferred_card.png",
  },
  {
    name: "American Express Gold",
    imageUrl: "https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/category/cardarts/gold-card.png",
  },
  {
    name: "Capital One Venture X",
    imageUrl: "",
  }
];

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