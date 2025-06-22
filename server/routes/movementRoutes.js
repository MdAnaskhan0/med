const express = require('express');
const router = express.Router();
const movementController = require('../controllers/movementController');

// Movement data endpoints
router.post('/', movementController.createMovement);
router.get('/get_all_movement', movementController.getAllMovements);
router.get('/:userID', movementController.getMovementsByUser);
router.put('/:id', movementController.updateMovement);
router.delete('/:id', movementController.deleteMovement);

module.exports = router;