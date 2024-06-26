import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPicture extends Document {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    user: Schema.Types.ObjectId | string;
    createdAt: Date;
    updatedAt: Date;
}

const pictureSchema = new Schema<IPicture>(
    {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        mimetype: { type: String, required: true },
        size: { type: Number, required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

const Picture: Model<IPicture> = mongoose.model<IPicture>('Picture', pictureSchema);

export default Picture;
