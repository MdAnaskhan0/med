const db = require('../config/db');
const query = require('util').promisify(db.query).bind(db);

exports.createMovement = (req, res) => {
  const {
    userID,
    username,
    visitingStatus,
    placeName,
    partyName,
    purpose,
    remark,
    punchTime,
    punchingTime
  } = req.body;

  const sql = `INSERT INTO movementdata 
    (userID, username, visitingStatus, placeName, partyName, purpose, remark, punchTime, punchingTime) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [
    userID, username, visitingStatus,
    placeName, partyName, purpose,
    remark, punchTime, punchingTime
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Movement record added', id: result.insertId });
  });
};

exports.getAllMovements = (req, res) => {
  db.query('SELECT * FROM movementdata ORDER BY dateTime DESC', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

exports.getMovementsByUser = (req, res) => {
  const userID = req.params.userID;
  const sql = 'SELECT * FROM movementdata WHERE userID = ? ORDER BY dateTime DESC';

  db.query(sql, [userID], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No movement records found for this user.' });
    }

    res.json(result);
  });
};

exports.updateMovement = (req, res) => {
  const id = req.params.id;
  const {
    userID,
    username,
    visitingStatus,
    placeName,
    partyName,
    purpose,
    remark,
    punchTime,
    punchingTime
  } = req.body;

  const sql = `UPDATE movementdata SET 
    userID = ?, username = ?, visitingStatus = ?, placeName = ?, 
    partyName = ?, purpose = ?, remark = ?, punchTime = ?, punchingTime = ?
    WHERE movementID = ?`;

  db.query(sql, [
    userID, username, visitingStatus, placeName,
    partyName, purpose, remark, punchTime, punchingTime, id
  ], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Movement record updated' });
  });
};

exports.deleteMovement = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM movementdata WHERE movementID = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Movement record deleted' });
  });
};