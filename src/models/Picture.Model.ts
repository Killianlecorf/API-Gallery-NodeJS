import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IImage extends Document {
  url: string;
  public: boolean;
  uploadDate: Date;
  user: mongoose.Types.ObjectId;
}

const imageSchema: Schema<IImage> = new Schema({
  url: { type: String, required: true },
  public: { type: Boolean, default: true },
  uploadDate: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Image: Model<IImage> = mongoose.model<IImage>('Image', imageSchema);

export default Image;
