const db = require('../config/db');

const teamController = {
  createTeam: (req, res) => {
    const { team_leader_id, team_member_ids, team_name } = req.body;

    if (!team_leader_id || !Array.isArray(team_member_ids)) {
      return res.status(400).json({ status: 'error', message: 'Invalid data' });
    }

    const getMaxTeamIdQuery = 'SELECT MAX(team_id) AS max_id FROM team_assignments';
    db.query(getMaxTeamIdQuery, (err, maxResult) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });

      const nextTeamId = (maxResult[0].max_id || 0) + 1;
      const insertQuery = 'INSERT INTO team_assignments (team_id, team_name, team_leader_id, team_member_id) VALUES ?';
      const values = team_member_ids.map(memberId => [nextTeamId, team_name, team_leader_id, memberId]);

      db.query(insertQuery, [values], (err) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        res.json({ status: 'ok', message: 'Team created successfully' });
      });
    });
  },

  getAllTeams: (req, res) => {
    const sql = `
      SELECT 
        ta.team_id,
        MAX(ta.team_name) AS team_name,
        l.Name AS team_leader_name,
        GROUP_CONCAT(m.Name) AS team_members,
        GROUP_CONCAT(m.userID) AS team_member_ids
      FROM team_assignments ta
      JOIN users l ON ta.team_leader_id = l.userID
      JOIN users m ON ta.team_member_id = m.userID
      JOIN (
        SELECT team_id, team_leader_id FROM team_assignments GROUP BY team_id
      ) t ON ta.team_id = t.team_id
      GROUP BY ta.team_id, l.Name
    `;

    db.query(sql, (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });
      res.json({ status: 'ok', data: result });
    });
  },

  getTeamById: (req, res) => {
    const teamId = req.params.id;
    const sql = `
      SELECT 
        ta.team_id,
        MAX(ta.team_name) AS team_name,
        l.userID AS leader_id,
        l.Name AS team_leader_name,
        u.userID AS member_id,
        u.Name AS member_name
      FROM team_assignments ta
      JOIN users l ON ta.team_leader_id = l.userID
      JOIN users u ON ta.team_member_id = u.userID
      WHERE ta.team_id = ?
      GROUP BY ta.team_id, l.userID, u.userID
    `;

    db.query(sql, [teamId], (err, results) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });
      if (results.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Team not found' });
      }

      const team = {
        team_id: results[0].team_id,
        team_name: results[0].team_name,
        team_leader: {
          userID: results[0].leader_id,
          name: results[0].team_leader_name
        },
        team_members: results.map(row => ({
          userID: row.member_id,
          name: row.member_name
        }))
      };

      res.json({ status: 'ok', data: team });
    });
  },

  updateTeam: (req, res) => {
    const teamId = req.params.id;
    const { team_leader_id, team_member_ids } = req.body;

    if (!team_leader_id || !Array.isArray(team_member_ids)) {
      return res.status(400).json({ status: 'error', message: 'Invalid data' });
    }

    const deleteQuery = 'DELETE FROM team_assignments WHERE team_id = ?';
    db.query(deleteQuery, [teamId], (err) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });

      const insertQuery = 'INSERT INTO team_assignments (team_id, team_leader_id, team_member_id) VALUES ?';
      const values = team_member_ids.map(memberId => [teamId, team_leader_id, memberId]);

      db.query(insertQuery, [values], (err) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        res.json({ status: 'ok', message: 'Team updated successfully' });
      });
    });
  },

  deleteTeam: (req, res) => {
    const teamId = req.params.id;
    const deleteQuery = 'DELETE FROM team_assignments WHERE team_id = ?';

    db.query(deleteQuery, [teamId], (err, result) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: 'error', message: 'Team not found' });
      }
      res.json({ status: 'ok', message: 'Team deleted successfully' });
    });
  },

  // addTeamMember: (req, res) => {
  //   const teamId = req.params.id;
  //   const { member_id } = req.body;

  //   const query = 'INSERT INTO team_assignments (team_id, team_leader_id, team_member_id) SELECT ?, team_leader_id, ? FROM team_assignments WHERE team_id = ? LIMIT 1';
  //   db.query(query, [teamId, member_id, teamId], (err) => {
  //     if (err) return res.status(500).json({ status: 'error', message: err.message });
  //     res.json({ status: 'ok', message: 'Member added' });
  //   });
  // },

  addTeamMember: (req, res) => {
    const teamId = req.params.id;
    const { member_id } = req.body;

    const query = `
    INSERT INTO team_assignments (team_id, team_leader_id, team_member_id, team_name)
    SELECT team_id, team_leader_id, ?, team_name 
    FROM team_assignments 
    WHERE team_id = ? 
    LIMIT 1
  `;

    db.query(query, [member_id, teamId], (err) => {
      if (err) {
        console.error("SQL Error: ", err); // For debugging in backend logs
        return res.status(500).json({ status: 'error', message: err.message });
      }
      res.json({ status: 'ok', message: 'Member added successfully!' });
    });
  },



  removeTeamMember: (req, res) => {
    const { id: teamID } = req.params;
    const { member_id } = req.body;

    if (!member_id) {
      return res.status(400).json({ status: 'error', message: 'member_id is required' });
    }

    const checkQuery = 'SELECT * FROM team_assignments WHERE team_id = ? AND team_member_id = ?';
    db.query(checkQuery, [teamID, member_id], (err, results) => {
      if (err) return res.status(500).json({ status: 'error', message: err.message });
      if (results.length === 0) {
        return res.status(404).json({ status: 'error', message: 'Member not found in team' });
      }

      const isLeader = results[0].team_leader_id === member_id;
      if (isLeader) {
        return res.status(400).json({ status: 'error', message: 'Cannot remove the team leader' });
      }

      const countQuery = 'SELECT COUNT(*) AS memberCount FROM team_assignments WHERE team_id = ?';
      db.query(countQuery, [teamID], (err, countResults) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });

        if (countResults[0].memberCount <= 1) {
          return res.status(400).json({ status: 'error', message: 'Cannot remove the last member of the team' });
        }

        const deleteQuery = 'DELETE FROM team_assignments WHERE team_id = ? AND team_member_id = ?';
        db.query(deleteQuery, [teamID, member_id], (err) => {
          if (err) return res.status(500).json({ status: 'error', message: err.message });
          res.json({ status: 'ok', message: 'Member removed successfully' });
        });
      });
    });
  }
};

module.exports = teamController;