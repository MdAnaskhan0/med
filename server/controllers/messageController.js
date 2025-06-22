const db = require('../config/db');

exports.getAllMessages = (req, res) => {
  db.query('SELECT * FROM team_messages ORDER BY created_at ASC', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
};

exports.getMessagesByTeam = (req, res) => {
  const { teamId } = req.params;
  db.query(
    'SELECT * FROM team_messages WHERE team_id = ? ORDER BY created_at ASC',
    [teamId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json(results);
    }
  );
};

exports.createMessage = (req, res) => {
  const { team_id, sender_name, message } = req.body;
  db.query(
    'INSERT INTO team_messages (team_id, sender_name, message) VALUES (?, ?, ?)',
    [team_id, sender_name, message],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to insert message' });
      res.status(201).json({ id: result.insertId, team_id, sender_name, message });
    }
  );
};