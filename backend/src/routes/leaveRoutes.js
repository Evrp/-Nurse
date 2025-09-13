
const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Nurse routes
router.post('/request', protect, authorize('nurse'), leaveController.createLeaveRequest);

// Head nurse routes
router.get('/pending', protect, authorize('head_nurse'), leaveController.getPendingLeaveRequests);
router.post('/approve/:id', protect, authorize('head_nurse'), leaveController.approveLeaveRequest);
router.post('/reject/:id', protect, authorize('head_nurse'), leaveController.rejectLeaveRequest);

module.exports = router;
