const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');

router.get('/users/:id/permissions', permissionController.getUserPermissions);
router.put('/users/:id/permissions', permissionController.updateUserPermissions);

module.exports = router;