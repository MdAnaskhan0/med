const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.post('/assign-team', teamController.createTeam);
router.get('/teams', teamController.getAllTeams);
router.get('/teams/:id', teamController.getTeamById);
router.put('/teams/:id', teamController.updateTeam);
router.delete('/teams/:id', teamController.deleteTeam);

router.patch('/teams/:id/add-member', teamController.addTeamMember);
router.patch('/teams/:id/remove-member', teamController.removeTeamMember);

module.exports = router;