import { Response } from 'express'
import Patient from '../models/Patient'
import Charge from '../models/Charge'
import { AuthRequest } from '../middleware/auth'

/**
 * Get bilan stats for current month
 */
export const getBilanFinalStats = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    // Revenus du mois (soins)
    const revenusStats = await Patient.aggregate([
      { $unwind: '$soins' },
      {
        $match: {
          'soins.date': { $gte: startOfMonth, $lte: endOfMonth }
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
    ])

    // Charges du mois
    const chargesStats = await Charge.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalMontant: { $sum: '$montant' },
          nombreCharges: { $sum: 1 }
        }
      }
    ])

    const revenus = revenusStats[0] || { totalHonoraires: 0, totalRecu: 0, nombreSoins: 0 }
    const charges = chargesStats[0] || { totalMontant: 0, nombreCharges: 0 }

    const bilan = {
      mois: {
        revenus: revenus.totalRecu,
        charges: charges.totalMontant,
        benefice: revenus.totalRecu - charges.totalMontant,
        nombreSoins: revenus.nombreSoins,
        nombreCharges: charges.nombreCharges
      }
    }

    res.json({
      success: true,
      data: bilan
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Get monthly bilan for last 12 months
 */
export const getBilanFinalMonthly = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date()
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    // Revenus mensuels
    const revenusMonthly = await Patient.aggregate([
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
          totalRecu: { $sum: '$soins.recu' },
          nombreSoins: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalRecu: 1,
          nombreSoins: 1
        }
      }
    ])

    // Charges mensuelles
    const chargesMonthly = await Charge.aggregate([
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
      }
    ])

    // Remplir les mois manquants et calculer les bilans
    const result = []
    for (let i = 0; i <= 11; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      const revenus = revenusMonthly.find(r => r.year === year && r.month === month)
      const charges = chargesMonthly.find(c => c.year === year && c.month === month)

      const totalRevenus = revenus?.totalRecu || 0
      const totalCharges = charges?.totalMontant || 0
      const benefice = totalRevenus - totalCharges

      result.push({
        year,
        month,
        monthName: date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        revenus: totalRevenus,
        charges: totalCharges,
        benefice,
        nombreSoins: revenus?.nombreSoins || 0,
        nombreCharges: charges?.nombreCharges || 0
      })
    }

    res.json({
      success: true,
      data: result
    })
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message })
  }
}
