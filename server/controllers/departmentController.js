const db = require('../config/db');

const departmentController = {
  createDepartment: (req, res) => {
    const { departmentName } = req.body;

    if (!departmentName) {
      return res.status(400).send({ message: 'Department name is required' });
    }

    const checkSql = 'SELECT 1 FROM departments WHERE departmentName = ? LIMIT 1';
    db.query(checkSql, [departmentName], (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Error checking department name:', checkErr);
        return res.status(500).send({ message: 'Database error' });
      }

      if (checkResult.length > 0) {
        return res.status(409).send({ message: 'Department name is already exist' });
      }

      const insertSql = 'INSERT INTO departments (departmentName) VALUES (?)';
      db.query(insertSql, [departmentName], (insertErr, result) => {
        if (insertErr) {
          console.error('Error inserting department:', insertErr);
          return res.status(500).send({ message: 'Database error' });
        }

        res.status(201).send({ id: result.insertId, departmentName });
      });
    });
  },

  getAllDepartments: (req, res) => {
    const sql = 'SELECT * FROM departments';
    db.query(sql, (err, results) => {
      if (err) return res.status(500).send(err);
      res.send(results);
    });
  },

  getDepartmentById: (req, res) => {
    const sql = 'SELECT * FROM departments WHERE departmentID = ?';
    db.query(sql, [req.params.id], (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length === 0) return res.status(404).send({ message: 'Department not found' });
      res.send(results[0]);
    });
  },

  updateDepartment: (req, res) => {
    const { departmentName } = req.body;
    const sql = 'UPDATE departments SET departmentName = ? WHERE departmentID = ?';
    db.query(sql, [departmentName, req.params.id], (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).send({ message: 'Department not found' });
      res.send({ message: 'Department updated' });
    });
  },

  deleteDepartment: (req, res) => {
    const sql = 'DELETE FROM departments WHERE departmentID = ?';
    db.query(sql, [req.params.id], (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).send({ message: 'Department not found' });
      res.send({ message: 'Department deleted' });
    });
  }
};

module.exports = departmentController;