
import { Router } from 'express';
import { processMessage } from '../controllers/chatController';

const router = Router();

// Route for processing chat messages
router.post('/', processMessage);

export default router;
