const db = require('../config/db');

const roleController = {
  createRole: (req, res) => {
    const { rolename } = req.body;
    if (!rolename) {
      return res.status(400).json({ error: 'rolename is required' });
    }

    const checkSql = 'SELECT 1 FROM roles WHERE rolename = ? LIMIT 1';
    db.query(checkSql, [rolename], (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Error checking role name:', checkErr);
        return res.status(500).json({ error: 'Database error' });
      }

      if (checkResult.length > 0) {
        return res.status(409).json({ error: 'Role name already exists' });
      }

      const insertSql = 'INSERT INTO roles (rolename) VALUES (?)';
      db.query(insertSql, [rolename], (insertErr, results) => {
        if (insertErr) {
          console.error('Error inserting role:', insertErr);
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ 
          roleID: results.insertId, 
          rolename 
        });
      });
    });
  },

  getAllRoles: (req, res) => {
    const sql = 'SELECT * FROM roles';
    db.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  },

  getRoleById: (req, res) => {
    const { roleID } = req.params;
    const sql = 'SELECT * FROM roles WHERE roleID = ?';
    db.query(sql, [roleID], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'Role not found' });
      }
      res.json(results[0]);
    });
  },

  updateRole: (req, res) => {
    const { roleID } = req.params;
    const { rolename } = req.body;
    if (!rolename) {
      return res.status(400).json({ error: 'rolename is required' });
    }

    const sql = 'UPDATE roles SET rolename = ? WHERE roleID = ?';
    db.query(sql, [rolename, roleID], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Role not found' });
      }
      res.json({ roleID, rolename });
    });
  },

  deleteRole: (req, res) => {
    const { roleID } = req.params;
    const sql = 'DELETE FROM roles WHERE roleID = ?';
    db.query(sql, [roleID], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: 'Role not found' });
      }
      res.json({ message: 'Role deleted successfully' });
    });
  }
};

module.exports = roleController;