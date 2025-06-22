const db = require('../config/db');

const partyController = {
  getAllParties: (req, res) => {
    db.query('SELECT * FROM partynames', (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    });
  },

  getPartyById: (req, res) => {
    db.query('SELECT * FROM partynames WHERE partynameID = ?', [req.params.id], (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length === 0) return res.status(404).send({ message: 'Partyname not found' });
      res.json(results[0]);
    });
  },

  createParty: (req, res) => {
    const { partyname, partyaddress } = req.body;

    if (!partyname || !partyaddress) {
      return res.status(400).send({ message: 'Missing fields' });
    }

    const checkSql = 'SELECT 1 FROM partynames WHERE partyname = ? LIMIT 1';
    db.query(checkSql, [partyname], (checkErr, checkResult) => {
      if (checkErr) {
        console.error('Error checking party name:', checkErr);
        return res.status(500).send({ message: 'Database error' });
      }

      if (checkResult.length > 0) {
        return res.status(409).send({ message: 'Party name already exists' });
      }

      const insertSql = 'INSERT INTO partynames (partyname, partyaddress) VALUES (?, ?)';
      db.query(insertSql, [partyname, partyaddress], (insertErr, result) => {
        if (insertErr) {
          console.error('Error inserting party name:', insertErr);
          return res.status(500).send({ message: 'Database error' });
        }

        res.status(201).send({ id: result.insertId, partyname, partyaddress });
      });
    });
  },

  updateParty: (req, res) => {
    const { partyname, partyaddress } = req.body;
    db.query(
      'UPDATE partynames SET partyname = ?, partyaddress = ? WHERE partynameID = ?',
      [partyname, partyaddress, req.params.id],
      (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send({ message: 'Partyname not found' });
        res.send({ message: 'Updated successfully' });
      }
    );
  },

  deleteParty: (req, res) => {
    db.query('DELETE FROM partynames WHERE partynameID = ?', [req.params.id], (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).send({ message: 'Partyname not found' });
      res.send({ message: 'Deleted successfully' });
    });
  }
};

module.exports = partyController;