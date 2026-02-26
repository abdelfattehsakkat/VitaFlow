import { Router } from 'express';
import * as rendezVousController from '../controllers/rendezVousController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Toutes les routes rendez-vous nécessitent authentification
router.use(authenticate);

/**
 * @route   GET /api/rendez-vous
 * @desc    Liste des rendez-vous avec filtres (date, médecin, patient, statut)
 * @access  Private
 */
router.get('/', rendezVousController.getRendezVous);

/**
 * @route   GET /api/rendez-vous/:id
 * @desc    Détails d'un rendez-vous
 * @access  Private
 */
router.get('/:id', rendezVousController.getRendezVousById);

/**
 * @route   POST /api/rendez-vous
 * @desc    Créer un rendez-vous (avec validation chevauchement)
 * @access  Private
 */
router.post('/', rendezVousController.createRendezVous);

/**
 * @route   PATCH /api/rendez-vous/:id
 * @desc    Modifier un rendez-vous
 * @access  Private
 */
router.patch('/:id', rendezVousController.updateRendezVous);

/**
 * @route   DELETE /api/rendez-vous/:id
 * @desc    Supprimer/Annuler un rendez-vous (soft delete par défaut)
 * @access  Private
 */
router.delete('/:id', rendezVousController.deleteRendezVous);

export default router;
