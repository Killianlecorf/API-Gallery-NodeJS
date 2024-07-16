import { Router } from 'express';
import { 
  uploadImageMiddleware, 
  uploadImage, 
  getUserImages, 
  deleteImage,
  getAllImages
} from '../controllers/Picture.Controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

router.post('/upload',authenticateUser, uploadImageMiddleware, uploadImage);

router.get('/:id', authenticateUser, getUserImages);
router.get('/', authenticateUser, getAllImages);

router.delete('/:id', authenticateUser,  deleteImage);

export default router;