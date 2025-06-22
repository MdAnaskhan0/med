const db = require('../config/db');
const upload = require('../config/multer');

const companyController = {
  // Create a new company
  createCompany: (req, res) => {
    const { companyname, companyDescription } = req.body;
    const companyLogo = req.file ? req.file.buffer : null;
    const companyLogoType = req.file ? req.file.mimetype : null;

    if (!companyname) {
      return res.status(400).send({ status: 'error', message: 'companyname is required' });
    }

    const sql = `
      INSERT INTO companynames (companyname, companyDescription, companyLogo, companyLogoType)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [companyname, companyDescription, companyLogo, companyLogoType], (err, result) => {
      if (err) {
        console.error('Error adding company:', err);
        return res.status(500).send({ status: 'error', message: 'Database error' });
      }

      res.send({ status: 'ok', message: 'Company added successfully', insertId: result.insertId });
    });
  },

  // Get company logo
  getCompanyLogo: (req, res) => {
    const companyId = req.params.id;
    const sql = 'SELECT companyLogo, companyLogoType FROM companynames WHERE companynameID = ?';

    db.query(sql, [companyId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).send({ status: 'error', message: 'Logo not found' });
      }

      const { companyLogo, companyLogoType } = results[0];

      if (!companyLogo) {
        return res.status(404).send({ status: 'error', message: 'Logo not stored' });
      }

      res.set('Content-Type', companyLogoType || 'image/png');
      res.send(companyLogo);
    });
  },

  // Get all companies
  getAllCompanies: (req, res) => {
    const sql = 'SELECT companynameID, companyname, companyDescription FROM companynames';
    db.query(sql, (err, results) => {
      if (err) {
        console.error('Error fetching company names:', err);
        return res.status(500).send({ status: 'error', message: 'Database error' });
      }
      res.send({ status: 'ok', data: results });
    });
  },

  // Get single company by ID
  getCompanyById: (req, res) => {
    const companyId = req.params.id;
    const sql = 'SELECT companynameID, companyname, companyDescription FROM companynames WHERE companynameID = ?';
    db.query(sql, [companyId], (err, results) => {
      if (err) {
        console.error('Error fetching company:', err);
        return res.status(500).send({ status: 'error', message: 'Database error' });
      }
      if (results.length === 0) {
        return res.status(404).send({ status: 'error', message: 'Company not found' });
      }
      res.send({ status: 'ok', data: results[0] });
    });
  },

  // Update company
  updateCompany: (req, res) => {
    const companyId = req.params.id;
    const { companyname, companyDescription } = req.body;
    const companyLogo = req.file ? req.file.buffer : null;
    const companyLogoType = req.file ? req.file.mimetype : null;

    if (!companyname) {
      return res.status(400).send({ status: 'error', message: 'companyname is required' });
    }

    const updateFields = [];
    const values = [];

    updateFields.push('companyname = ?');
    values.push(companyname);

    updateFields.push('companyDescription = ?');
    values.push(companyDescription);

    if (companyLogo) {
      updateFields.push('companyLogo = ?');
      updateFields.push('companyLogoType = ?');
      values.push(companyLogo, companyLogoType);
    }

    values.push(companyId);

    const sql = `UPDATE companynames SET ${updateFields.join(', ')} WHERE companynameID = ?`;
    db.query(sql, values, (err, result) => {
      if (err) {
        console.error('Error updating company:', err);
        return res.status(500).send({ status: 'error', message: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).send({ status: 'error', message: 'Company not found' });
      }
      res.send({ status: 'ok', message: 'Company updated successfully' });
    });
  },

  // Delete company
  deleteCompany: (req, res) => {
    const companyId = req.params.id;
    const sql = 'DELETE FROM companynames WHERE companynameID = ?';
    db.query(sql, [companyId], (err, result) => {
      if (err) {
        console.error('Error deleting company:', err);
        return res.status(500).send({ status: 'error', message: 'Database error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).send({ status: 'error', message: 'Company not found' });
      }
      res.send({ status: 'ok', message: 'Company deleted successfully' });
    });
  }
};

module.exports = companyController;