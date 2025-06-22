const express = require('express');
const router = express.Router();
const userAssignmentController = require('../controllers/userAssignmentController');

router.get('/unassigned-users', userAssignmentController.getUnassignedUsers);
router.get('/unassigned-team-leaders', userAssignmentController.getUnassignedTeamLeaders);

module.exports = router;