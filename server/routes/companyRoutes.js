const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const upload = require('../config/multer');

router.post('/', upload.single('companyLogo'), companyController.createCompany);
router.get('/logos/:id', companyController.getCompanyLogo);
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);
router.put('/:id', upload.single('companyLogo'), companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);

module.exports = router;