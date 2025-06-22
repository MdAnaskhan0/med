const db = require('../config/db');
const crypto = require('crypto');

// Helper function to hash password using MD5
const md5Hash = (password) => crypto.createHash('md5').update(password).digest('hex');

// ======================== GET ALL USERS ========================
exports.getAllUsers = (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }
    res.send({ status: 'ok', data: results });
  });
};

// ======================== CREATE USER ========================
exports.createUser = (req, res) => {
  const {
    username,
    password,
    eid,
    name,
    designation,
    department,
    company,
    phone,
    email,
    role
  } = req.body;

  const checkSql = 'SELECT * FROM users WHERE username = ? OR E_ID = ?';
  db.query(checkSql, [username, eid], (checkErr, checkResult) => {
    if (checkErr) {
      console.error(checkErr);
      return res.status(500).send({ status: 'error', message: 'Database error during uniqueness check' });
    }

    if (checkResult.length > 0) {
      const duplicateFields = checkResult.map(user => {
        let fields = [];
        if (user.username === username) fields.push('username');
        if (user.E_ID === eid) fields.push('E_ID');
        return fields;
      }).flat();

      return res.status(400).send({
        status: 'error',
        message: `The following already exist: ${[...new Set(duplicateFields)].join(', ')}`
      });
    }

    const hashedPassword = md5Hash(password);
    const insertSql = `
      INSERT INTO users 
      (username, password, E_ID, Name, Designation, Department, Company_name, Phone, email, Role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      username,
      hashedPassword,
      eid,
      name,
      designation,
      department,
      company,
      phone,
      email,
      role
    ];

    db.query(insertSql, values, (insertErr, insertResult) => {
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).send({ status: 'error', message: 'Error creating user' });
      }
      res.send({ status: 'ok', message: 'User created successfully' });
    });
  });
};

// ======================== GET USER BY ID ========================
exports.getUserById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM users WHERE userID = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).send({ error: err.message });
    if (!result.length) return res.status(404).send({ message: 'User not found' });
    res.send({ data: result[0] });
  });
};

// ======================== UPDATE USER ========================
exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;

  const sql = 'UPDATE users SET ? WHERE userID = ?';

  db.query(sql, [updatedData, userId], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ status: 'error', message: 'User not found' });
    }

    res.send({ status: 'ok', message: 'User updated successfully' });
  });
};

// ======================== DELETE USER ========================
exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  const sql = 'DELETE FROM users WHERE userID = ?';

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ status: 'error', message: 'User not found' });
    }

    res.send({ status: 'ok', message: 'User deleted successfully' });
  });
};

// ======================== CHANGE PASSWORD ========================
exports.changePassword = (req, res) => {
  const { userID } = req.params;
  const { newPassword } = req.body;
  
  if (!newPassword) {
    return res.status(400).json({
      success: false,
      message: 'New password is required'
    });
  }

  const checkUserSql = 'SELECT * FROM users WHERE userID = ?';
  db.query(checkUserSql, [userID], (err, results) => {
    if (err) {
      console.error('Error checking user:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hashedNewPassword = md5Hash(newPassword);
    const updateSql = 'UPDATE users SET password = ? WHERE userID = ?';

    db.query(updateSql, [hashedNewPassword, userID], (err, result) => {
      if (err) {
        console.error('Error updating password:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to update password'
        });
      }

      res.json({
        success: true,
        message: 'Password updated successfully'
      });
    });
  });
};
