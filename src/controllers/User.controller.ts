import { Request, Response } from 'express';
import { User, IUser } from '../models/User.Model';
import Image, { IImage } from '../models/Picture.Model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// GET /users   
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des utilisateurs.' });
  }
};

// GET /user/
export const getUserById = async (req: Request, res: Response) => {
  const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Token missing or invalid' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };

        const user = await User.findById(decoded.userId).populate('pictures');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            id: user._id,
            name: user.name,
            pictures: user.pictures, 
        });

    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
};


export const createUser = async (req: Request, res: Response) => {
    const userData: IUser = req.body;

    try {
        const { name, password } = userData;

        const existingUser = await User.findOne({ name });
        if (existingUser) {
            return res.status(409).json({ error: 'Cet utilisateur existe déjà.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            password: hashedPassword,
            pictures: []
        });

        await user.save();

        const secretKey = process.env.JWT_SECRET;
        const token = jwt.sign({ userId: user._id }, secretKey);

        const cookieOptions = {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        };

        res.cookie('token', token, cookieOptions);

        res.json({ user, token });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Une erreur est survenue lors de la création de l\'utilisateur.' });
    }
};


  export const getUserLogin = async (req: Request, res: Response) => {
    const { name, password } = req.body;
  
    try {
      const user = await User.findOne({ name }).select('+password');
      if (!user) {
        return res.status(401).json({ error: 'L\'adresse e-mail est incorrect.' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'le mot de passe est incorrect.' });
      }
  
      const secretKey = process.env.JWT_SECRET; 
      const token = jwt.sign({ userId: user._id }, secretKey);

      const cookieOptions = {
        httpOnly: true
      };
  
      res.cookie('token', token, cookieOptions);
  
      res.json({ user, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Une erreur est survenue lors de la connexion.' });
    }
  };

  // DELETE /users/:id
  export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const user = await User.findById(id).populate('pictures').exec();
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      await User.findByIdAndDelete(id);
      const images = await Image.find({ user: id });
  
      const deleteFilePromises = images.map(image => {
        const imagePath = path.join(__dirname, '../../../uploads', path.basename(image.url));
        console.log('Constructed imagePath:', imagePath);
        console.log('Original image URL:', image.url);
  
        return new Promise<void>((resolve, reject) => {
          if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
              if (err) {
                console.error('Error deleting file:', err);
                reject(err);
              } else {
                console.log('File deleted successfully:', imagePath);
                resolve();
              }
            });
          } else {
            console.log('File not found:', imagePath);
            resolve();
          }
        });
      });
  
      try {
        await Promise.all(deleteFilePromises);
        await Image.deleteMany({ user: id });
        res.status(200).json({ message: 'User and images deleted successfully' });
      } catch (err) {
        console.error('Error in deleting files:', err);
        res.status(500).json({ error: 'Error deleting files' });
      }
  
    } catch (err: any) {
      console.error('Error in deleteUser:', err);
      res.status(500).json({ error: err.message });
    }
  };

  export function isAuthenticated(req: Request, res: Response) {
    try {
      const token = req.cookies.token;
      
      if (token) {
        return res.status(200).json({ isAuthenticated: true });
      } else {
        return res.status(401).json({ isAuthenticated: false, message: 'Non connecté, token non trouvé.' });
      }
    } catch (error) {
      console.error('Erreur de vérification:', error);
      return res.status(500).json({ message: 'Une erreur est survenue lors de la vérification de l\'authentification.' });
    }
  }

  export function logOut(req: Request, res: Response) {
    try {
      res.clearCookie('token');
      return res.status(200).json({ message: 'Déconnexion réussie.' });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return res.status(500).json({ message: 'Une erreur est survenue lors de la déconnexion.' });
    }
  };