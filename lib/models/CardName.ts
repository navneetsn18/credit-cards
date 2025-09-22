import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  name: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Card name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Card name cannot exceed 100 characters'],
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Image URL cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate card names
CardSchema.pre('save', async function (next) {
  if (this.isNew) {
    const existingCard = await mongoose.models.Card?.findOne({ name: this.name });
    if (existingCard) {
      const error = new Error('Card name already exists');
      error.name = 'ValidationError';
      return next(error);
    }
  }
  next();
});

export default mongoose.models.Card || mongoose.model<ICard>('Card', CardSchema);