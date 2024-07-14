import { Router } from 'express';
import {
  uploadImage,
  listImages,
  toggleAccessibility,
  deleteImage,
  generateUrl
} from '../controllers/Picture.Controller';
import {authenticateUser} from '../middlewares/auth.middleware';

const router = Router();

router.post('/upload', authenticateUser, uploadImage);
router.get('/', authenticateUser, listImages);
router.put('/:id', authenticateUser, toggleAccessibility);
router.delete('/:id', authenticateUser, deleteImage);
router.post('/:id/generate-url', authenticateUser, generateUrl);

export default router;