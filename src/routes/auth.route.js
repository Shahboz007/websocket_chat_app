import { Router } from 'express';
import { loginUser, loginCallCenterMember, register } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/users/login', loginUser);
router.post('/callcenter/login', loginCallCenterMember);

export default router;