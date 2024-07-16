import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware';
import {
    getAllUsers,
    getUserById,
    createUser,
    getUserLogin,
    deleteUser
  } from '../controllers/User.controller';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Authentification
router.post('/register', createUser);
router.post('/login', getUserLogin);

router.delete('/:id', authenticateUser, deleteUser);

export default router;