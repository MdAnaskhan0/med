const db = require('../config/db');

exports.getUnassignedUsers = (req, res) => {
  const query = `
    SELECT * FROM users 
    WHERE role = 'user' AND userID NOT IN (
      SELECT team_member_id FROM team_assignments
    )
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });
    res.json({ status: 'ok', data: results });
  });
};

exports.getUnassignedTeamLeaders = (req, res) => {
  const query = `
    SELECT * FROM users 
    WHERE role = 'team leader' AND userID NOT IN (
      SELECT team_leader_id FROM team_assignments
    )
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ status: 'error', message: err.message });
    res.json({ status: 'ok', data: results });
  });
};