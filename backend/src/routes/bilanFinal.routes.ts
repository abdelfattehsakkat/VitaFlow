import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
  getBilanFinalStats,
  getBilanFinalMonthly
} from '../controllers/bilanFinalController'

const router = Router()

// All routes require authentication
router.use(authenticate)

// Get stats for current month
router.get('/stats', getBilanFinalStats)

// Get monthly bilan for last 12 months
router.get('/monthly', getBilanFinalMonthly)

export default router
