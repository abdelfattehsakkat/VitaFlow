import { Response } from 'express';
import Patient from '../models/Patient';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all patients avec pagination et recherche
 */
export const getPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'id' } = req.query;
    
    const query: any = {};
    if (search) {
      const searchStr = String(search).trim();
      query.$or = [
        { nom: { $regex: searchStr, $options: 'i' } },
        { prenom: { $regex: searchStr, $options: 'i' } },
        { telephone: { $regex: searchStr, $options: 'i' } }
      ];
      
      // Si recherche ressemble à un ID patient (P000123 ou 123)
      const idMatch = searchStr.match(/^P?(\d+)$/i);
      if (idMatch) {
        const numericId = parseInt(idMatch[1], 10);
        query.$or.push({ id: numericId });
      }
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [patients, total] = await Promise.all([
      Patient.find(query)
        .sort({ [String(sortBy)]: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Patient.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get patient by ID avec historique complet des soins
 */
export const getPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findById(id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: patient
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create new patient (génère ID auto-increment)
 */
export const createPatient = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      nom, 
      prenom, 
      dateNaissance,
      telephone, 
      email,
      adresse,
      mutuelle,
      numeroMutuelle,
      antecedents
    } = req.body;
    
    const patient = await Patient.create({
      nom,
      prenom,
      dateNaissance,
      telephone,
      email,
      adresse,
      mutuelle,
      numeroMutuelle,
      antecedents,
      soins: []
    });
    
    res.status(201).json({
      success: true,
      message: `Patient créé avec ID ${patient.id}`,
      data: patient
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update patient infos (sauf soins)
 */
export const updatePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      nom, 
      prenom, 
      dateNaissance,
      telephone, 
      email,
      adresse,
      mutuelle,
      numeroMutuelle,
      antecedents
    } = req.body;
    
    const patient = await Patient.findByIdAndUpdate(
      id,
      { 
        nom, 
        prenom, 
        dateNaissance,
        telephone, 
        email,
        adresse,
        mutuelle,
        numeroMutuelle,
        antecedents
      },
      { new: true, runValidators: true }
    );
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Patient modifié',
      data: patient
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Add soin to patient
 */
export const addSoin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date, description, honoraire, recu } = req.body;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient non trouvé' });
    }
    
    patient.soins.push({
      date: date || new Date(),
      description,
      honoraire,
      recu,
      createdAt: new Date()
    } as any);
    
    await patient.save();
    
    res.json({
      success: true,
      message: 'Consultation ajoutée',
      data: patient
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update soin of patient
 */
export const updateSoin = async (req: AuthRequest, res: Response) => {
  try {
    const { id, soinId } = req.params;
    const { date, description, honoraire, recu } = req.body;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient non trouvé' });
    }
    
    const soin = (patient.soins as any).id(soinId);
    if (!soin) {
      return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
    }
    
    // Mettre à jour les champs fournis
    if (date) soin.date = new Date(date);
    if (description) soin.description = description;
    if (honoraire !== undefined) soin.honoraire = honoraire;
    if (recu !== undefined) soin.recu = recu;
    
    await patient.save();
    
    res.json({
      success: true,
      message: 'Consultation modifiée',
      data: patient
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete soin from patient
 */
export const deleteSoin = async (req: AuthRequest, res: Response) => {
  try {
    const { id, soinId } = req.params;
    
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient non trouvé' });
    }
    
    const soinIndex = patient.soins.findIndex((s: any) => s._id.toString() === soinId);
    if (soinIndex === -1) {
      return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
    }
    
    patient.soins.splice(soinIndex, 1);
    await patient.save();
    
    res.json({
      success: true,
      message: 'Consultation supprimée'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete patient (soft delete possible à implémenter)
 */
export const deletePatient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const patient = await Patient.findByIdAndDelete(id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Patient supprimé'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
