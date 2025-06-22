const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.post('/', roleController.createRole);
router.get('/', roleController.getAllRoles);
router.get('/:roleID', roleController.getRoleById);
router.put('/:roleID', roleController.updateRole);
router.delete('/:roleID', roleController.deleteRole);

module.exports = router;