const db = require('../config/db');
const query = require('util').promisify(db.query).bind(db);

exports.createEditLog = async (req, res) => {
  const { movementID, userID, originalData, updatedData } = req.body;

  if (!movementID || !userID || !originalData || !updatedData) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const sql = `
      INSERT INTO movement_edit_logs (movementID, userID, originalData, updatedData)
      VALUES (?, ?, ?, ?)
    `;

    await query(sql, [
      movementID,
      userID,
      JSON.stringify(originalData),
      JSON.stringify(updatedData),
    ]);

    res.status(201).json({ message: 'Edit log saved' });
  } catch (err) {
    console.error('Error saving edit log:', err);
    res.status(500).json({ error: 'Failed to save edit log' });
  }
};

exports.getAllEditLogs = async (req, res) => {
  try {
    const sql = `SELECT * FROM movement_edit_logs ORDER BY editTime DESC`;
    const results = await query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error fetching edit logs:', err);
    res.status(500).json({ error: 'Failed to fetch edit logs' });
  }
};