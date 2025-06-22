const db = require('../config/db');

const branchController = {
  createBranch: (req, res) => {
    const { branchname, address } = req.body;

    if (!branchname || !address) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const checkSql = 'SELECT 1 FROM branchnames WHERE branchname = ? LIMIT 1';
    db.query(checkSql, [branchname], (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Error checking branchname:', checkErr);
        return res.status(500).json({ error: 'Database error' });
      }

      if (checkResult.length > 0) {
        return res.status(409).json({ message: 'branchname already exists' });
      }

      const insertSql = 'INSERT INTO branchnames (branchname, address) VALUES (?, ?)';
      db.query(insertSql, [branchname, address], (insertErr, result) => {
        if (insertErr) {
          console.error('Error inserting branch:', insertErr);
          return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({ message: 'Branch created', id: result.insertId });
      });
    });
  },

  getAllBranches: (req, res) => {
    db.query('SELECT * FROM branchnames', (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  },

  getBranchById: (req, res) => {
    db.query('SELECT * FROM branchnames WHERE branchnameID = ?', [req.params.id], (err, results) => {
      if (err) return res.status(500).json({ error: err });
      if (results.length === 0) return res.status(404).json({ message: 'Branch not found' });
      res.json(results[0]);
    });
  },

  updateBranch: (req, res) => {
    const { branchname, address } = req.body;
    const sql = 'UPDATE branchnames SET branchname = ?, address = ? WHERE branchnameID = ?';
    db.query(sql, [branchname, address, req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Branch not found' });
      res.json({ message: 'Branch updated' });
    });
  },

  deleteBranch: (req, res) => {
    db.query('DELETE FROM branchnames WHERE branchnameID = ?', [req.params.id], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Branch not found' });
      res.json({ message: 'Branch deleted' });
    });
  }
};

module.exports = branchController;