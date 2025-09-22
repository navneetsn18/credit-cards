const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const sampleCards = [
  {
    cardName: "Chase Sapphire Preferred",
    platformName: "Amazon",
    platformImageUrl: "https://logo.clearbit.com/amazon.com",
    rewardRate: "2x points",
    description: "2x points on Amazon purchases",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    cardName: "Chase Sapphire Preferred", 
    platformName: "Restaurants",
    platformImageUrl: "",
    rewardRate: "3x points",
    description: "3x points on dining and restaurants",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    cardName: "American Express Gold",
    platformName: "Groceries",
    platformImageUrl: "",
    rewardRate: "4x points",
    description: "4x points on supermarket purchases",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    cardName: "American Express Gold",
    platformName: "Restaurants", 
    platformImageUrl: "",
    rewardRate: "4x points",
    description: "4x points on dining worldwide",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    cardName: "Capital One Venture X",
    platformName: "Travel",
    platformImageUrl: "",
    rewardRate: "2x miles",
    description: "2x miles on all travel purchases",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const sampleCardNames = [
  {
    name: "Chase Sapphire Preferred",
    imageUrl: "https://creditcards.chase.com/K-Marketplace/images/cardart/sapphire_preferred_card.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "American Express Gold",
    imageUrl: "https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/category/cardarts/gold-card.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Capital One Venture X",
    imageUrl: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

async function seedData() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Clear existing data
    await db.collection('cardplatforms').deleteMany({});
    await db.collection('cards').deleteMany({});
    console.log('Cleared existing data');
    
    // Insert sample card benefits
    const cardResult = await db.collection('cardplatforms').insertMany(sampleCards);
    console.log(`Inserted ${cardResult.insertedCount} card benefits`);
    
    // Insert sample card names
    const nameResult = await db.collection('cards').insertMany(sampleCardNames);
    console.log(`Inserted ${nameResult.insertedCount} card names`);
    
    console.log('Sample data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await client.close();
  }
}

seedData();