import { Router } from 'express';
import * as bilanController from '../controllers/bilanController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Toutes les routes bilan nécessitent authentification
router.use(authenticate);

/**
 * @route   GET /api/bilan/stats
 * @desc    Statistiques jour/semaine/mois
 * @access  Private
 */
router.get('/stats', bilanController.getBilanStats);

/**
 * @route   GET /api/bilan/monthly
 * @desc    Statistiques mensuelles sur 12 mois
 * @access  Private
 */
router.get('/monthly', bilanController.getBilanMonthly);

/**
 * @route   GET /api/bilan/top-patients
 * @desc    Top patients par revenus
 * @access  Private
 */
router.get('/top-patients', bilanController.getTopPatients);

/**
 * @route   GET /api/bilan/overall
 * @desc    Statistiques globales du cabinet
 * @access  Private
 */
router.get('/overall', bilanController.getBilanOverall);

export default router;
