import mongoose, { Document, Schema } from 'mongoose';

export interface ICardPlatform extends Document {
  _id: string;
  cardName: string;
  platformName: string;
  platformImageUrl?: string;
  rewardRate: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CardPlatformSchema = new Schema<ICardPlatform>(
  {
    cardName: {
      type: String,
      required: [true, 'Card name is required'],
      trim: true,
      maxlength: [100, 'Card name cannot exceed 100 characters'],
    },
    platformName: {
      type: String,
      required: [true, 'Platform name is required'],
      trim: true,
      maxlength: [50, 'Platform name cannot exceed 50 characters'],
    },
    platformImageUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Platform image URL cannot exceed 500 characters'],
    },
    rewardRate: {
      type: String,
      required: [true, 'Reward rate is required'],
      trim: true,
      maxlength: [200, 'Reward rate cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient searching
CardPlatformSchema.index({ platformName: 1 });
CardPlatformSchema.index({ cardName: 1 });
CardPlatformSchema.index({ platformName: 1, cardName: 1 });

// Prevent model re-compilation during development
const CardPlatform = mongoose.models.CardPlatform || mongoose.model<ICardPlatform>('CardPlatform', CardPlatformSchema);

export default CardPlatform;