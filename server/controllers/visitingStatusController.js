const db = require('../config/db');

const visitingStatusController = {
  createVisitingStatus: (req, res) => {
    const { visitingstatusname } = req.body;

    if (!visitingstatusname) {
      return res.status(400).json({ error: 'visitingstatusname is required' });
    }

    const checkSql = 'SELECT 1 FROM visitingstatus WHERE visitingstatusname = ? LIMIT 1';
    db.query(checkSql, [visitingstatusname], (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Error checking visiting status:', checkErr);
        return res.status(500).json({ error: 'Database error' });
      }

      if (checkResult.length > 0) {
        return res.status(409).json({ error: 'Visiting status name already exists' });
      }

      const insertSql = 'INSERT INTO visitingstatus (visitingstatusname) VALUES (?)';
      db.query(insertSql, [visitingstatusname], (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error inserting visiting status:', insertErr);
          return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({ 
          id: insertResult.insertId, 
          visitingstatusname 
        });
      });
    });
  },

  getAllVisitingStatuses: (req, res) => {
    db.query('SELECT * FROM visitingstatus', (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  },

  getVisitingStatusById: (req, res) => {
    const { id } = req.params;
    db.query(
      'SELECT * FROM visitingstatus WHERE visitingstatusID = ?', 
      [id], 
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
      }
    );
  },

  updateVisitingStatus: (req, res) => {
    const { id } = req.params;
    const { visitingstatusname } = req.body;
    
    db.query(
      'UPDATE visitingstatus SET visitingstatusname = ? WHERE visitingstatusID = ?',
      [visitingstatusname, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ id, visitingstatusname });
      }
    );
  },

  deleteVisitingStatus: (req, res) => {
    const { id } = req.params;
    db.query(
      'DELETE FROM visitingstatus WHERE visitingstatusID = ?',
      [id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });
        res.json({ message: 'Deleted successfully' });
      }
    );
  }
};

module.exports = visitingStatusController;