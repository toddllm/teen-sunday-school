import express from 'express';
import { authenticate } from '../middleware/auth';
import * as sessionController from '../controllers/session.controller';
import * as attendanceController from '../controllers/attendance.controller';

const router = express.Router();

// Session routes
router.post('/sessions', authenticate, sessionController.createSession);
router.get('/sessions', authenticate, sessionController.getSessions);
router.get('/sessions/:id', authenticate, sessionController.getSession);
router.put('/sessions/:id', authenticate, sessionController.updateSession);
router.delete('/sessions/:id', authenticate, sessionController.deleteSession);

// Session actions
router.post('/sessions/:id/start', authenticate, sessionController.startSession);
router.post('/sessions/:id/end', authenticate, sessionController.endSession);
router.post('/sessions/:id/cancel', authenticate, sessionController.cancelSession);
router.get('/sessions/:id/stats', authenticate, sessionController.getSessionStats);

// Attendance routes
router.post('/sessions/:id/check-in', authenticate, attendanceController.checkIn);
router.post('/sessions/:id/attendance', authenticate, attendanceController.markAttendance);
router.get('/sessions/:id/attendance', authenticate, attendanceController.getSessionAttendance);
router.get('/sessions/:id/attendance/report', authenticate, attendanceController.getAttendanceReport);

// User attendance
router.get('/users/:userId/attendance', authenticate, attendanceController.getUserAttendance);

// Group attendance summary
router.get('/groups/:groupId/attendance/summary', authenticate, attendanceController.getGroupAttendanceSummary);

// Delete attendance
router.delete('/attendance/:attendanceId', authenticate, attendanceController.deleteAttendance);

export default router;
