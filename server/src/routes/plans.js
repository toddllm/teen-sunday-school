const express = require('express');
const router = express.Router();
const {
  getPlans,
  getPlan,
  enrollPlan,
  completeDay,
  getProgress,
  getUserPlans
} = require('../controllers/planController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getPlans);
router.get('/my-plans', protect, getUserPlans);
router.get('/:id', optionalAuth, getPlan);
router.post('/:id/enroll', protect, enrollPlan);
router.post('/:id/complete-day', protect, completeDay);
router.get('/:id/progress', protect, getProgress);

module.exports = router;
