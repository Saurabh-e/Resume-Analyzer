import express from 'express';
import {
  getUserDashboard,
  getAdminDashboard,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// User dashboard
router.get('/stats', getUserDashboard);

// Admin routes
router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/admin/users', authorize('admin'), getAllUsers);
router.put('/admin/users/:id/toggle-status', authorize('admin'), toggleUserStatus);
router.delete('/admin/users/:id', authorize('admin'), deleteUser);

export default router;
