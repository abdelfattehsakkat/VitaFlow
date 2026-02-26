import { Router } from 'express';
import * as patientController from '../controllers/patientController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Toutes les routes patients nécessitent authentification
router.use(authenticate);

/**
 * @route   GET /api/patients
 * @desc    Liste des patients avec pagination et recherche
 * @access  Private
 */
router.get('/', patientController.getPatients);

/**
 * @route   GET /api/patients/:id
 * @desc    Détails d'un patient avec historique soins
 * @access  Private
 */
router.get('/:id', patientController.getPatient);

/**
 * @route   POST /api/patients
 * @desc    Créer un nouveau patient
 * @access  Private
 */
router.post('/', patientController.createPatient);

/**
 * @route   PATCH /api/patients/:id
 * @desc    Modifier les infos d'un patient
 * @access  Private
 */
router.patch('/:id', patientController.updatePatient);

/**
 * @route   DELETE /api/patients/:id
 * @desc    Supprimer un patient
 * @access  Private
 */
router.delete('/:id', patientController.deletePatient);

/**
 * @route   POST /api/patients/:id/soins
 * @desc    Ajouter une consultation à un patient
 * @access  Private
 */
router.post('/:id/soins', patientController.addSoin);

/**
 * @route   PATCH /api/patients/:id/soins/:soinId
 * @desc    Modifier une consultation d'un patient
 * @access  Private
 */
router.patch('/:id/soins/:soinId', patientController.updateSoin);

/**
 * @route   DELETE /api/patients/:id/soins/:soinId
 * @desc    Supprimer une consultation d'un patient
 * @access  Private
 */
router.delete('/:id/soins/:soinId', patientController.deleteSoin);

export default router;
