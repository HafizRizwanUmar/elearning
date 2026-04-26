const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/profileController');

router.use(protect);
router.get('/', ctrl.getProfile);
router.put('/', ctrl.updateProfile);
router.put('/change-password', ctrl.changePassword);

module.exports = router;
