import express from 'express';
import { authenticate, requireOrgAdmin } from '../middleware/auth';
import * as calendarController from '../controllers/calendar.controller';

const router = express.Router();

// Calendar view (requires auth)
router.get(
  '/calendar',
  authenticate,
  calendarController.getCalendar
);

// Calendar metrics (requires auth)
router.get(
  '/calendar/metrics',
  authenticate,
  calendarController.getCalendarMetrics
);

// Schedule management (requires auth + org admin for modifications)
router.post(
  '/calendar/assign',
  authenticate,
  requireOrgAdmin,
  calendarController.assignLesson
);

router.get(
  '/calendar/:id',
  authenticate,
  calendarController.getSchedule
);

router.patch(
  '/calendar/:id',
  authenticate,
  requireOrgAdmin,
  calendarController.updateSchedule
);

router.delete(
  '/calendar/:id',
  authenticate,
  requireOrgAdmin,
  calendarController.deleteSchedule
);

export default router;
