import { Router } from 'express';
import { getActiveChats, completeChat } from '../controllers/chat.controller.js';
const router = Router();

router.get('/active', getActiveChats);
router.post('/complete', completeChat);

export default router;