import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} from '../validations/authValidation.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, updateProfile);
router.put('/change-password', protect, changePasswordValidation, changePassword);
router.post('/logout', protect, logout);

export default router;
