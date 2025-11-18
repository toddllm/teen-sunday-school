const express = require('express');
const router = express.Router();
const {
  getTodayScreen,
  getVerseOfDay,
  getCurrentPlan
} = require('../controllers/todayController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/today-screen', protect, getTodayScreen);
router.get('/verse-of-the-day', optionalAuth, getVerseOfDay);
router.get('/current-plan', protect, getCurrentPlan);

module.exports = router;
