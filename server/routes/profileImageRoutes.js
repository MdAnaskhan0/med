const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const profileImageController = require('../controllers/profileImageController');

router.post('/:userID', upload.single('image'), profileImageController.uploadImage);
router.get('/:userID', profileImageController.getImage);
router.delete('/:userID', profileImageController.deleteImage);

module.exports = router;