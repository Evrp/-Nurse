
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users/nurses', protect, authorize('head_nurse'), authController.getNurses);

module.exports = router;
