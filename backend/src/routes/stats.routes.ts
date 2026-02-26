import { Router } from 'express';
import * as statsController from '../controllers/statsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Toutes les routes stats nécessitent authentification
router.use(authenticate);

/**
 * @route   GET /api/stats/overview
 * @desc    Vue d'ensemble : patients, RDV, revenus
 * @access  Private
 */
router.get('/overview', statsController.getOverviewStats);

/**
 * @route   GET /api/stats/revenue
 * @desc    Statistiques de revenus (par mois, par médecin)
 * @access  Private
 */
router.get('/revenue', statsController.getRevenueStats);

/**
 * @route   GET /api/stats/top-patients
 * @desc    Top patients par revenus
 * @access  Private
 */
router.get('/top-patients', statsController.getTopPatients);

/**
 * @route   GET /api/stats/appointments
 * @desc    Statistiques rendez-vous (par statut, par médecin)
 * @access  Private
 */
router.get('/appointments', statsController.getAppointmentStats);

export default router;
