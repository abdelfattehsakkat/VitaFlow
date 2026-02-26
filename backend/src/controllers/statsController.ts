import { Response } from 'express';
import Patient from '../models/Patient';
import RendezVous from '../models/RendezVous';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

/**
 * Dashboard overview stats
 */
export const getOverviewStats = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    // Statistiques de base
    const [
      totalPatients,
      totalMedecins,
      rendezVousToday,
      rendezVousMonth,
      patientsThisMonth
    ] = await Promise.all([
      Patient.countDocuments(),
      User.countDocuments({ role: 'medecin' }),
      RendezVous.countDocuments({
        date: { $gte: today, $lt: tomorrow },
        statut: { $ne: 'annule' }
      }),
      RendezVous.countDocuments({
        date: { $gte: firstDayOfMonth, $lt: firstDayOfNextMonth },
        statut: { $ne: 'annule' }
      }),
      Patient.countDocuments({
        createdAt: { $gte: firstDayOfMonth, $lt: firstDayOfNextMonth }
      })
    ]);
    
    // Calculer le revenu du mois
    const patients = await Patient.find({
      'soins.date': { $gte: firstDayOfMonth, $lt: firstDayOfNextMonth }
    }).select('soins');
    
    let revenueMonth = 0;
    patients.forEach(patient => {
      patient.soins.forEach(soin => {
        if (soin.date >= firstDayOfMonth && soin.date < firstDayOfNextMonth) {
          revenueMonth += (typeof soin.recu === 'number' ? soin.recu : 0);
        }
      });
    });
    
    res.json({
      success: true,
      data: {
        totalPatients,
        totalMedecins,
        rendezVousToday,
        rendezVousMonth,
        patientsThisMonth,
        revenueMonth
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Revenue statistics by period
 */
export const getRevenueStats = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, medecinId } = req.query;
    
    const start = startDate ? new Date(String(startDate)) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(String(endDate)) : new Date();
    
    const query: any = {
      'soins.date': { $gte: start, $lte: end }
    };
    
    const patients = await Patient.find(query).select('soins');
    
    // Grouper par mois
    const revenueByMonth: { [key: string]: number } = {};
    const revenueByMedecin: { [key: string]: { nom: string; total: number } } = {};
    
    patients.forEach(patient => {
      patient.soins.forEach(soin => {
        if (soin.date >= start && soin.date <= end) {
          // Filtrer par médecin si spécifié
          if (medecinId && soin.medecinId.toString() !== medecinId) {
            return;
          }
          
          // Par mois
          const monthKey = `${soin.date.getFullYear()}-${String(soin.date.getMonth() + 1).padStart(2, '0')}`;
          revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + (typeof soin.recu === 'number' ? soin.recu : 0);
          
          // Par médecin
          const medecinKey = soin.medecinId.toString();
          if (!revenueByMedecin[medecinKey]) {
            revenueByMedecin[medecinKey] = {
              nom: soin.medecinNom || 'Inconnu',
              total: 0
            };
          }
          revenueByMedecin[medecinKey].total += (typeof soin.recu === 'number' ? soin.recu : 0);
        }
      });
    });
    
    res.json({
      success: true,
      data: {
        revenueByMonth: Object.entries(revenueByMonth).map(([month, total]) => ({
          month,
          total
        })),
        revenueByMedecin: Object.entries(revenueByMedecin).map(([id, data]) => ({
          medecinId: id,
          medecinNom: data.nom,
          total: data.total
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Top patients by revenue
 */
export const getTopPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    
    const patients = await Patient.find()
      .select('id nom prenom soins telephone')
      .lean();
    
    // Calculer le total pour chaque patient
    const patientsWithTotal = patients.map(patient => {
      const totalRecu = patient.soins?.reduce((sum, soin) => {
        return sum + (typeof soin.recu === 'number' ? soin.recu : 0);
      }, 0) || 0;
      
      return {
        id: patient.id,
        nom: patient.nom,
        prenom: patient.prenom,
        telephone: patient.telephone,
        totalRecu,
        nombreSoins: patient.soins?.length || 0
      };
    });
    
    // Trier par total décroissant
    patientsWithTotal.sort((a, b) => b.totalRecu - a.totalRecu);
    
    res.json({
      success: true,
      data: patientsWithTotal.slice(0, Number(limit))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Appointments statistics
 */
export const getAppointmentStats = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(String(startDate)) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(String(endDate)) : new Date();
    
    const appointments = await RendezVous.find({
      date: { $gte: start, $lte: end }
    }).select('statut date medecinId');
    
    // Statistiques par statut
    const byStatus = {
      planifie: 0,
      confirme: 0,
      termine: 0,
      annule: 0
    };
    
    // Par médecin
    const byMedecin: { [key: string]: number } = {};
    
    appointments.forEach(rdv => {
      byStatus[rdv.statut]++;
      
      const medecinKey = rdv.medecinId.toString();
      byMedecin[medecinKey] = (byMedecin[medecinKey] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        total: appointments.length,
        byStatus,
        byMedecin: Object.entries(byMedecin).map(([id, count]) => ({
          medecinId: id,
          count
        }))
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
