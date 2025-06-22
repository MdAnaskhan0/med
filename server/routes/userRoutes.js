const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.put('/change-password/:userID', userController.changePassword);
// router.get('/users/:id/status', userController.getUserStatus);
// router.put('/users/:id/status', userController.updateUserStatus);


module.exports = router;