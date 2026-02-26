import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Créer un nouvel utilisateur (admin only)
 * @access  Private (admin)
 */
router.post('/register', authenticate, authorize('admin'), authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authentifier un utilisateur
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renouveler les tokens
 * @access  Public
 */
router.post('/refresh', authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnecter un utilisateur
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Récupérer l'utilisateur connecté
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

export default router;
