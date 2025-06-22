const db = require('../config/db');

const designationController = {
  getAllDesignations: (req, res) => {
    db.query('SELECT * FROM designations', (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  },

  getDesignationById: (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM designations WHERE designationID = ?', [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0) return res.status(404).json({ message: 'Designation not found' });
      res.json(results[0]);
    });
  },

  createDesignation: (req, res) => {
    const { designationName } = req.body;
    if (!designationName) {
      return res.status(400).json({ error: 'designationName is required' });
    }

    const checkSql = 'SELECT 1 FROM designations WHERE designationName = ? LIMIT 1';
    db.query(checkSql, [designationName], (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Error checking designation name:', checkErr);
        return res.status(500).json({ error: 'Database error' });
      }

      if (checkResult.length > 0) {
        return res.status(409).json({ error: 'Designation name already exists' });
      }

      const insertSql = 'INSERT INTO designations (designationName) VALUES (?)';
      db.query(insertSql, [designationName], (insertErr, result) => {
        if (insertErr) {
          console.error('Error inserting designation:', insertErr);
          return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({ message: 'Designation created', id: result.insertId });
      });
    });
  },

  updateDesignation: (req, res) => {
    const { id } = req.params;
    const { designationName } = req.body;
    if (!designationName) return res.status(400).json({ error: 'designationName is required' });

    db.query('UPDATE designations SET designationName = ? WHERE designationID = ?', 
      [designationName, id], 
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Designation not found' });
        res.json({ message: 'Designation updated' });
      });
  },

  deleteDesignation: (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM designations WHERE designationID = ?', [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Designation not found' });
      res.json({ message: 'Designation deleted' });
    });
  }
};

module.exports = designationController;