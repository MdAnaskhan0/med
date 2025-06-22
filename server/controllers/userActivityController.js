const db = require('../config/db');

exports.getUserActivities = (req, res) => {
  const { username } = req.params;

  const sql = 'SELECT * FROM user_activity_log WHERE username = ? ORDER BY timestamp DESC';

  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Failed to fetch user activities:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    res.json(results);
  });
};

exports.deleteUserActivity = (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM user_activity_log WHERE user_activity_log.id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting activity:', err);
      return res.status(500).json({ success: false, message: 'Failed to delete activity' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }

    res.status(200).json({ success: true, message: 'Activity deleted successfully' });
  });
};