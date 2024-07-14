import { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import Image, { IImage } from '../models/Picture.Model';
import { AuthRequest } from '../middlewares/auth.middleware';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, uuidv4() + '-' + file.originalname)
});

const upload = multer({ storage }).single('image');

export const uploadImage = (req: AuthRequest, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ msg: 'Error uploading file' });
    }
    try {
      const newImage = new Image({
        url: req.file.path,
        user: req.user.id
      });
      await newImage.save();
      res.json({ url: newImage.url });
    } catch (err) {
      res.status(500).send('Server error');
    }
  });
};

export const listImages = async (req: AuthRequest, res: Response) => {
  try {
    const images = await Image.find({ user: req.user.id }).sort({ uploadedAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

export const toggleAccessibility = async (req: AuthRequest, res: Response) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image || image.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    image.public = !image.public;
    await image.save();
    res.json(image);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

export const deleteImage = async (req: AuthRequest, res: Response) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image || image.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    await image.remove();
    res.json({ msg: 'Image deleted' });
  } catch (err) {
    res.status(500).send('Server error');
  }
};

export const generateUrl = async (req: AuthRequest, res: Response) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image || image.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    image.url = `${image.url}-${uuidv4()}`;
    await image.save();
    res.json({ url: image.url });
  } catch (err) {
    res.status(500).send('Server error');
  }
};
