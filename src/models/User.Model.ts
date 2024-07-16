import { Document, Schema, Model, model } from 'mongoose';
import { IImage } from './Picture.Model';

export interface IUser extends Document {
  name: string;
  password: string;
  pictures: IImage[];
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    pictures: [
      { type: Schema.Types.ObjectId, ref: 'Image', required: true },
    ],
  },
  { timestamps: true }
);

export const User: Model<IUser> = model<IUser>('User', userSchema);
