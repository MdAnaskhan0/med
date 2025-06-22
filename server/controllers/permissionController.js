const db = require('../config/db');

const permissionController = {
  getUserPermissions: (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT permission_name, has_access FROM user_permissions WHERE user_id = ?';
    
    db.query(sql, [id], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const permissions = {};
      results.forEach(row => {
        permissions[row.permission_name] = row.has_access;
      });
      
      res.json({ data: permissions });
    });
  },

  updateUserPermissions: (req, res) => {
    const { id } = req.params;
    const permissions = req.body.permissions;
    
    db.beginTransaction(err => {
      if (err) return res.status(500).json({ error: err.message });

      db.query('DELETE FROM user_permissions WHERE user_id = ?', [id], (err) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        const values = Object.entries(permissions).map(([name, hasAccess]) => 
          [id, name, hasAccess]
        );

        if (values.length > 0) {
          db.query(
            'INSERT INTO user_permissions (user_id, permission_name, has_access) VALUES ?',
            [values],
            (err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: err.message });
                });
              }
              
              db.commit(err => {
                if (err) {
                  return db.rollback(() => {
                    res.status(500).json({ error: err.message });
                  });
                }
                res.json({ message: 'Permissions updated successfully' });
              });
            }
          );
        } else {
          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: err.message });
              });
            }
            res.json({ message: 'All permissions removed' });
          });
        }
      });
    });
  }
};

module.exports = permissionController;