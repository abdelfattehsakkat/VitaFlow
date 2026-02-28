import { Router } from 'express';
import * as chargeController from '../controllers/chargeController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Toutes les routes charges nécessitent authentification
router.use(authenticate);

/**
 * @route   GET /api/charges
 * @desc    Liste des charges avec pagination et recherche
 * @access  Private
 */
router.get('/', chargeController.getCharges);

/**
 * @route   GET /api/charges/stats
 * @desc    Statistiques jour/semaine/mois
 * @access  Private
 */
router.get('/stats', chargeController.getChargesStats);

/**
 * @route   GET /api/charges/monthly
 * @desc    Statistiques mensuelles sur 12 mois
 * @access  Private
 */
router.get('/monthly', chargeController.getChargesMonthly);

/**
 * @route   GET /api/charges/:id
 * @desc    Détails d'une charge
 * @access  Private
 */
router.get('/:id', chargeController.getCharge);

/**
 * @route   POST /api/charges
 * @desc    Créer une nouvelle charge
 * @access  Private
 */
router.post('/', chargeController.createCharge);

/**
 * @route   PATCH /api/charges/:id
 * @desc    Modifier une charge
 * @access  Private
 */
router.patch('/:id', chargeController.updateCharge);

/**
 * @route   DELETE /api/charges/:id
 * @desc    Supprimer une charge
 * @access  Private
 */
router.delete('/:id', chargeController.deleteCharge);

export default router;
