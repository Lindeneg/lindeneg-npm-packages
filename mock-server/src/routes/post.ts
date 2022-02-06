import { Router } from 'express';
import {
  postPost,
  getPost,
  patchPost,
  putPost,
  deletePost,
} from '../controllers/post';

const router = Router();

router.post('/', postPost);
router.put('/', putPost);
router.get('/:id', getPost);
router.patch('/:id', patchPost);
router.delete('/:id', deletePost);

export default router;
