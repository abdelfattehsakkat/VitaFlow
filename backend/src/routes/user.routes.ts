import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Toutes les routes users nécessitent authentification
router.use(authenticate);

// TODO: Ajouter middleware pour vérifier role admin sur ces routes
// router.use(requireAdmin);

/**
 * @route   GET /api/users
 * @desc    Liste des utilisateurs avec pagination et recherche
 * @access  Private (Admin only)
 */
router.get('/', userController.getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Détails d'un utilisateur
 * @access  Private (Admin only)
 */
router.get('/:id', userController.getUser);

/**
 * @route   POST /api/users
 * @desc    Créer un nouvel utilisateur
 * @access  Private (Admin only)
 */
router.post('/', userController.createUser);

/**
 * @route   PATCH /api/users/:id
 * @desc    Modifier un utilisateur
 * @access  Private (Admin only)
 */
router.patch('/:id', userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Supprimer un utilisateur
 * @access  Private (Admin only)
 */
router.delete('/:id', userController.deleteUser);

export default router;
