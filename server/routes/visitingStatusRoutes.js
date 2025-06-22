const express = require('express');
const router = express.Router();
const visitingStatusController = require('../controllers/visitingStatusController');

router.post('/', visitingStatusController.createVisitingStatus);
router.get('/', visitingStatusController.getAllVisitingStatuses);
router.get('/:id', visitingStatusController.getVisitingStatusById);
router.put('/:id', visitingStatusController.updateVisitingStatus);
router.delete('/:id', visitingStatusController.deleteVisitingStatus);

module.exports = router;