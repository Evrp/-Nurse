
const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create', protect, authorize('head_nurse'), shiftController.createShift); // Changed from / to /create
router.post('/assign', protect, authorize('head_nurse'), shiftController.assignShift);
router.get('/', protect, authorize('head_nurse'), shiftController.getAllShifts); // New route for head nurse to get all shifts

// Nurse routes
router.get('/my-shifts', protect, authorize('nurse'), shiftController.getMySchedule); // Renamed from /my-schedule to /my-shifts

module.exports = router;
