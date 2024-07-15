import mongoose, { Document, Schema } from 'mongoose';

export interface IImage extends Document {
  url: string;
  user: mongoose.Schema.Types.ObjectId;
  public: boolean;
  uploadedAt: Date;
}

const ImageSchema: Schema<IImage> = new Schema({
  url: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  public: { type: Boolean, default: true },
  uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IImage>('Image', ImageSchema);
