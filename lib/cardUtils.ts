import CardPlatform from '@/lib/models/Card';
import Card from '@/lib/models/CardName';

/**
 * Clean up orphaned card names that have no associated benefits
 * This should be called after deleting benefits to maintain data consistency
 */
export async function cleanupOrphanedCardNames(): Promise<string[]> {
  try {
    // Get all card names
    const allCardNames = await Card.find({}).select('name').lean();
    
    // Get unique card names that have benefits
    const cardNamesWithBenefits = await CardPlatform.distinct('cardName');
    
    // Find orphaned card names (exist in Card collection but not in CardPlatform)
    const orphanedCardNames = allCardNames
      .filter(card => !cardNamesWithBenefits.includes(card.name))
      .map(card => card.name);
    
    // Delete orphaned card names
    if (orphanedCardNames.length > 0) {
      await Card.deleteMany({ name: { $in: orphanedCardNames } });
      console.log(`Cleaned up ${orphanedCardNames.length} orphaned card names:`, orphanedCardNames);
    }
    
    return orphanedCardNames;
  } catch (error) {
    console.error('Error cleaning up orphaned card names:', error);
    return [];
  }
}

/**
 * Check if a card name has any associated benefits
 */
export async function cardHasBenefits(cardName: string): Promise<boolean> {
  try {
    const benefitsCount = await CardPlatform.countDocuments({ cardName });
    return benefitsCount > 0;
  } catch (error) {
    console.error('Error checking card benefits:', error);
    return false;
  }
}

/**
 * Get all card names that actually have benefits
 */
export async function getCardNamesWithBenefits(): Promise<string[]> {
  try {
    return await CardPlatform.distinct('cardName');
  } catch (error) {
    console.error('Error getting card names with benefits:', error);
    return [];
  }
}