import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware';
import {
    getAllUsers,
    getUserById,
    createUser,
    getUserLogin,
    deleteUser,
    isAuthenticated,
    logOut
  } from '../controllers/User.controller';

const router = express.Router();

router.get('/users', getAllUsers);
router.get('/user/:id', getUserById);
router.get('/isAuth', isAuthenticated);

// Authentification
router.post('/register', createUser);
router.post('/login', getUserLogin);
router.post('/logout', logOut);

router.delete('/:id', authenticateUser, deleteUser);

export default router;