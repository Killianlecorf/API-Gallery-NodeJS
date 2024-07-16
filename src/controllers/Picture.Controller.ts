import { Request, Response } from 'express';
import multer, { Multer } from 'multer';
import Image, { IImage } from '../models/Picture.Model';
import { User, IUser } from '../models/User.Model';
import fs from 'fs';
import path from 'path';

// Configuration de multer pour l'upload d'image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload: Multer = multer({ storage });

export const uploadImageMiddleware = upload.single('image');

export const uploadImage = async (req: Request, res: Response) => {
  const { id } = req.body;
  const file: Express.Multer.File | undefined = req.file;
  try {
    const user = await User.findById(id).exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const image = new Image({
      url: `/uploads/${file.filename}`,
      user: id
    } as IImage);
    await image.save();
    user.pictures.push(image._id as any);
    await user.save();
    res.status(201).json({ message: 'Image uploaded successfully', url: image.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllImages = async (req: Request, res: Response) => {
  try {
    const images = await Image.find().exec();
    res.status(200).json(images);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Lister les images d'un utilisateur, triées par date et séparées par mois
export const getUserImages = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate('pictures').exec();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const images = user.pictures as IImage[];
    const groupedImages = images.reduce((acc, image) => {
      const monthYear = image.uploadDate.toISOString().substring(0, 7);
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(image);
      return acc;
    }, {} as { [key: string]: IImage[] });
    res.status(200).json(groupedImages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


export const deleteImage = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const image = await Image.findByIdAndDelete(id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await User.updateOne({ _id: image.user }, { $pull: { pictures: image._id } });

    const imagePath = path.resolve(__dirname, '../../../uploads', path.basename(image.url));
    console.log('Attempting to delete file at path:', imagePath);

    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err);
        } else {
          console.log('File deleted successfully:', imagePath);
        }
      });
    } else {
      console.log('File not found:', imagePath);
    }

    return res.status(200).json({ message: 'Image deleted successfully' });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};