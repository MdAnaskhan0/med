const express = require('express');
const router = express.Router();
const userActivityController = require('../controllers/userActivityController');

router.get('/:username', userActivityController.getUserActivities);
router.delete('/:id', userActivityController.deleteUserActivity);

module.exports = router;