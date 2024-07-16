import { Request, Response } from 'express';
import { User, IUser } from '../models/User.Model';
import Image, { IImage } from '../models/Picture.Model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

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

// GET /users/:id
export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération de l\'utilisateur.' });
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
      await User.findByIdAndDelete(id);
      await Image.deleteMany({ user: id });
      res.status(200).json({ message: 'User and images deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };