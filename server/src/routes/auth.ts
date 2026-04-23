import { Router } from "express";
import {registerUser ,loginUser ,verifyOtp} from '../controller/authController.js'; 
const router = Router();

router.post('/register' , registerUser);
router.post('/login' , loginUser);
router.post('/verify', verifyOtp);

export default router;