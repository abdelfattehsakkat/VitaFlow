import { Response } from 'express';
import RendezVous from '../models/RendezVous';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all rendez-vous avec filtres
 */
export const getRendezVous = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      date, 
      patientId, 
      statut,
      startDate,
      endDate,
      includeAnnule,
      page = 1,
      limit = 50
    } = req.query;
    
    const query: any = {};
    
    // Par défaut, exclure les rendez-vous annulés
    if (includeAnnule !== 'true') {
      query.statut = { $ne: 'annule' };
    }
    
    // Filtres
    if (date) {
      const startOfDay = new Date(String(date));
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(String(date));
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(String(startDate)),
        $lte: new Date(String(endDate))
      };
    }
    
    if (patientId) query.patientId = patientId;
    if (statut) {
      // Si un statut spécifique est demandé, l'utiliser
      query.statut = statut;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [rendezVous, total] = await Promise.all([
      RendezVous.find(query)
        .populate('patientId', 'nom prenom telephone')
        .sort({ date: 1, heureDebut: 1 })
        .skip(skip)
        .limit(Number(limit)),
      RendezVous.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        rendezVous,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get rendez-vous by ID
 */
export const getRendezVousById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const rdv = await RendezVous.findById(id)
      .populate('patientId', 'nom prenom telephone adresse');
    
    if (!rdv) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous non trouvé'
      });
    }
    
    res.json({ success: true, data: rdv });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create rendez-vous avec validation chevauchement
 */
export const createRendezVous = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, date, heureDebut, heureFin, motif, notes } = req.body;
    
    // Récupérer le nom du patient automatiquement
    const Patient = (await import('../models/Patient')).default;
    
    const patient = await Patient.findById(patientId).select('nom prenom');
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient non trouvé' });
    }
    
    const patientNom = `${patient.nom} ${patient.prenom}`;
    
    // Vérifier chevauchement pour le même patient
    const overlapping = await RendezVous.findOne({
      patientId,
      date: new Date(date),
      statut: { $ne: 'annule' },
      $or: [
        // Nouveau RDV commence pendant un RDV existant
        { heureDebut: { $lte: heureDebut }, heureFin: { $gt: heureDebut } },
        // Nouveau RDV finit pendant un RDV existant
        { heureDebut: { $lt: heureFin }, heureFin: { $gte: heureFin } },
        // Nouveau RDV englobe un RDV existant
        { heureDebut: { $gte: heureDebut }, heureFin: { $lte: heureFin } }
      ]
    });
    
    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: 'Ce créneau est déjà occupé',
        data: overlapping
      });
    }
    
    const rdv = await RendezVous.create({
      patientId,
      patientNom,
      date,
      heureDebut,
      heureFin,
      motif,
      notes,
      statut: 'planifie'
    });
    
    await rdv.populate('patientId', 'nom prenom telephone');
    
    res.status(201).json({
      success: true,
      message: 'Rendez-vous créé',
      data: rdv
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Erreur lors de la création du rendez-vous' });
  }
};

/**
 * Update rendez-vous
 */
export const updateRendezVous = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date, heureDebut, heureFin, motif, notes, statut } = req.body;
    
    const rdv = await RendezVous.findById(id);
    if (!rdv) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }
    
    // Si on change l'horaire, vérifier chevauchement
    if (date || heureDebut || heureFin) {
      const newDate = date ? new Date(date) : rdv.date;
      const newHeureDebut = heureDebut || rdv.heureDebut;
      const newHeureFin = heureFin || rdv.heureFin;
      
      const overlapping = await RendezVous.findOne({
        _id: { $ne: id },
        patientId: rdv.patientId,
        date: newDate,
        statut: { $ne: 'annule' },
        $or: [
          { heureDebut: { $lte: newHeureDebut }, heureFin: { $gt: newHeureDebut } },
          { heureDebut: { $lt: newHeureFin }, heureFin: { $gte: newHeureFin } },
          { heureDebut: { $gte: newHeureDebut }, heureFin: { $lte: newHeureFin } }
        ]
      });
      
      if (overlapping) {
        return res.status(400).json({
          success: false,
          message: 'Ce créneau est déjà occupé'
        });
      }
      
      if (date) rdv.date = newDate;
      if (heureDebut) rdv.heureDebut = heureDebut;
      if (heureFin) rdv.heureFin = heureFin;
    }
    
    if (motif !== undefined) rdv.motif = motif;
    if (notes !== undefined) rdv.notes = notes;
    if (statut !== undefined) rdv.statut = statut;
    
    await rdv.save();
    await rdv.populate('patientId', 'nom prenom telephone');
    
    res.json({
      success: true,
      message: 'Rendez-vous modifié',
      data: rdv
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Delete rendez-vous (suppression définitive)
 */
export const deleteRendezVous = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const rdv = await RendezVous.findByIdAndDelete(id);
    
    if (!rdv) {
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }
    
    res.json({
      success: true,
      message: 'Rendez-vous supprimé'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
