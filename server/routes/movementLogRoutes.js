const express = require('express');
const router = express.Router();
const movementLogController = require('../controllers/movementLogController');

// Movement edit log endpoints
router.post('/', movementLogController.createEditLog);
router.get('/', movementLogController.getAllEditLogs);

module.exports = router;