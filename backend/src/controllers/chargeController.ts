import { Response } from 'express';
import Charge from '../models/Charge';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all charges avec pagination et recherche
 */
export const getCharges = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'date', sortOrder = 'desc' } = req.query;
    
    const query: any = {};
    if (search) {
      const searchStr = String(search).trim();
      query.$or = [
        { motif: { $regex: searchStr, $options: 'i' } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    
    const [charges, total] = await Promise.all([
      Charge.find(query)
        .sort({ [String(sortBy)]: sortDirection })
        .skip(skip)
        .limit(Number(limit)),
      Charge.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        charges,
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
 * Get charge by ID
 */
export const getCharge = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const charge = await Charge.findById(id);
    
    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: charge
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create new charge
 */
export const createCharge = async (req: AuthRequest, res: Response) => {
  try {
    const { date, motif, montant } = req.body;
    
    const charge = await Charge.create({
      date: date || new Date(),
      motif,
      montant
    });
    
    res.status(201).json({
      success: true,
      data: charge,
      message: 'Charge créée avec succès'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update charge
 */
export const updateCharge = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date, motif, montant } = req.body;
    
    const charge = await Charge.findByIdAndUpdate(
      id,
      { date, motif, montant },
      { new: true, runValidators: true }
    );
    
    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge non trouvée'
      });
    }
    
    res.json({
      success: true,
      data: charge,
      message: 'Charge mise à jour avec succès'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete charge
 */
export const deleteCharge = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const charge = await Charge.findByIdAndDelete(id);
    
    if (!charge) {
      return res.status(404).json({
        success: false,
        message: 'Charge non trouvée'
      });
    }
    
    res.json({
      success: true,
      message: 'Charge supprimée avec succès'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get charges statistics (day/week/month)
 */
export const getChargesStats = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Agrégation pour le jour
    const dayStats = await Charge.aggregate([
      {
        $match: {
          date: { $gte: startOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalMontant: { $sum: '$montant' },
          nombreCharges: { $sum: 1 }
        }
      }
    ]);

    // Agrégation pour la semaine
    const weekStats = await Charge.aggregate([
      {
        $match: {
          date: { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          totalMontant: { $sum: '$montant' },
          nombreCharges: { $sum: 1 }
        }
      }
    ]);

    // Agrégation pour le mois
    const monthStats = await Charge.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalMontant: { $sum: '$montant' },
          nombreCharges: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        jour: dayStats[0] || { totalMontant: 0, nombreCharges: 0 },
        semaine: weekStats[0] || { totalMontant: 0, nombreCharges: 0 },
        mois: monthStats[0] || { totalMontant: 0, nombreCharges: 0 }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get monthly charges for the last 12 months
 */
export const getChargesMonthly = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const monthlyStats = await Charge.aggregate([
      {
        $match: {
          date: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalMontant: { $sum: '$montant' },
          nombreCharges: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalMontant: 1,
          nombreCharges: 1
        }
      },
      {
        $sort: { year: 1, month: 1 }
      }
    ]);

    // Remplir les mois manquants avec des valeurs à 0
    const result = [];
    for (let i = 0; i <= 11; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const existing = monthlyStats.find(s => s.year === year && s.month === month);
      
      result.push({
        year,
        month,
        monthName: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        totalMontant: existing?.totalMontant || 0,
        nombreCharges: existing?.nombreCharges || 0
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
