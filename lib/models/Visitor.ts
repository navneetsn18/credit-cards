import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitor extends Document {
  ipAddress: string;
  firstVisit: Date;
  lastVisit: Date;
  visitCount: number;
}

const VisitorSchema: Schema = new Schema(
  {
    ipAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstVisit: {
      type: Date,
      default: Date.now,
    },
    lastVisit: {
      type: Date,
      default: Date.now,
    },
    visitCount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Visitor || mongoose.model<IVisitor>('Visitor', VisitorSchema);