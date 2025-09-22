const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const sampleCards = [
  
];

const sampleCardNames = [
 
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