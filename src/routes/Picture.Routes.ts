import { Router } from 'express';
import { 
  uploadImageMiddleware, 
  uploadImage, 
  getUserImages, 
  deleteImage,
  getPublicImages,
  toggleImageVisibility
} from '../controllers/Picture.Controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

router.post('/upload/:id', authenticateUser,  uploadImageMiddleware, uploadImage);

router.get('/:id', authenticateUser, getUserImages);
router.get('/', getPublicImages);

router.put('/visibility/:imageId', toggleImageVisibility);


router.delete('/:id', authenticateUser,  deleteImage);

export default router;