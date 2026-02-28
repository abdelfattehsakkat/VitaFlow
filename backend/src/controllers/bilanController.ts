import { Response } from 'express';
import Patient from '../models/Patient';
import { AuthRequest } from '../middleware/auth';

/**
 * Get financial statistics for the cabinet
 */
export const getBilanStats = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Dimanche
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Agrégation pour le jour
    const dayStats = await Patient.aggregate([
      { $unwind: '$soins' },
      {
        $match: {
          'soins.date': { $gte: startOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalHonoraires: { $sum: '$soins.honoraire' },
          totalRecu: { $sum: '$soins.recu' },
          nombreSoins: { $sum: 1 }
        }
      }
    ]);

    // Agrégation pour la semaine
    const weekStats = await Patient.aggregate([
      { $unwind: '$soins' },
      {
        $match: {
          'soins.date': { $gte: startOfWeek }
        }
      },
      {
        $group: {
          _id: null,
          totalHonoraires: { $sum: '$soins.honoraire' },
          totalRecu: { $sum: '$soins.recu' },
          nombreSoins: { $sum: 1 }
        }
      }
    ]);

    // Agrégation pour le mois
    const monthStats = await Patient.aggregate([
      { $unwind: '$soins' },
      {
        $match: {
          'soins.date': { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalHonoraires: { $sum: '$soins.honoraire' },
          totalRecu: { $sum: '$soins.recu' },
          nombreSoins: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        jour: dayStats[0] || { totalHonoraires: 0, totalRecu: 0, nombreSoins: 0 },
        semaine: weekStats[0] || { totalHonoraires: 0, totalRecu: 0, nombreSoins: 0 },
        mois: monthStats[0] || { totalHonoraires: 0, totalRecu: 0, nombreSoins: 0 }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get monthly statistics for the last 12 months
 */
export const getBilanMonthly = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const monthlyStats = await Patient.aggregate([
      { $unwind: '$soins' },
      {
        $match: {
          'soins.date': { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$soins.date' },
            month: { $month: '$soins.date' }
          },
          totalHonoraires: { $sum: '$soins.honoraire' },
          totalRecu: { $sum: '$soins.recu' },
          nombreSoins: { $sum: 1 },
          nombrePatients: { $addToSet: '$_id' }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalHonoraires: 1,
          totalRecu: 1,
          nombreSoins: 1,
          nombrePatients: { $size: '$nombrePatients' }
        }
      },
      {
        $sort: { year: 1, month: 1 }
      }
    ]);

    // Remplir les mois manquants avec des valeurs à 0
    const result = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const existing = monthlyStats.find(s => s.year === year && s.month === month);
      
      result.push({
        year,
        month,
        monthName: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        totalHonoraires: existing?.totalHonoraires || 0,
        totalRecu: existing?.totalRecu || 0,
        nombreSoins: existing?.nombreSoins || 0,
        nombrePatients: existing?.nombrePatients || 0,
        resteAPayer: (existing?.totalHonoraires || 0) - (existing?.totalRecu || 0)
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

/**
 * Get top patients by revenue
 */
export const getTopPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;

    const topPatients = await Patient.aggregate([
      {
        $project: {
          nom: 1,
          prenom: 1,
          telephone: 1,
          totalHonoraires: 1,
          totalRecu: 1,
          nombreSoins: { $size: '$soins' },
          resteAPayer: { $subtract: ['$totalHonoraires', '$totalRecu'] }
        }
      },
      {
        $sort: { totalHonoraires: -1 }
      },
      {
        $limit: Number(limit)
      }
    ]);

    res.json({
      success: true,
      data: topPatients
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get overall cabinet statistics
 */
export const getBilanOverall = async (req: AuthRequest, res: Response) => {
  try {
    const overallStats = await Patient.aggregate([
      {
        $group: {
          _id: null,
          totalPatients: { $sum: 1 },
          totalHonoraires: { $sum: '$totalHonoraires' },
          totalRecu: { $sum: '$totalRecu' },
          totalResteAPayer: { $sum: { $subtract: ['$totalHonoraires', '$totalRecu'] } }
        }
      }
    ]);

    const totalSoins = await Patient.aggregate([
      { $unwind: '$soins' },
      { $count: 'total' }
    ]);

    res.json({
      success: true,
      data: {
        ...overallStats[0],
        totalSoins: totalSoins[0]?.total || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
