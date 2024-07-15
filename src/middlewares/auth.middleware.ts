import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.Model';
import dotenv from 'dotenv';

dotenv.config();

interface DecodedToken {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token;
    
        if (!token) {
          return res.status(401).json({ error: 'Authentification requise.' });
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    
        const user = await User.findById(decodedToken.userId);
    
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé.' });
        }
    
        req.user = user; 
    
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Jeton d\'authentification invalide.' });
    }
};
