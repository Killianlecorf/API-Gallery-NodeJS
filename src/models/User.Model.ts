import mongoose, { Document, Schema, Model, model } from 'mongoose';
import { IPicture } from './Picture.Model';

export interface IUser extends Document {
    name: string;
    password: string;
    pictures: IPicture[];
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
            select: false
        },
        pictures: [
            { type: Schema.Types.ObjectId, ref: "Picture",required: true},
        ],
    },
    { timestamps: true }
);

export const User: Model<IUser> = model<IUser>('User', userSchema);
