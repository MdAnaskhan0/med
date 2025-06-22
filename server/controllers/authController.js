const db = require('../config/db');
const crypto = require('crypto');

// Hash password with MD5
const md5Hash = (password) => crypto.createHash('md5').update(password).digest('hex');

// ======================= LOGIN =======================
// exports.login = (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ status: 'error', message: 'Username and password required' });
//   }

//   const hashedPassword = md5Hash(password);

//   const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

//   db.query(sql, [username, hashedPassword], (err, results) => {
//     if (err) {
//       console.error('Login query error:', err);
//       return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
//     }

//     if (results.length === 0) {
//       return res.status(401).json({ status: 'error', message: 'Invalid credentials' });
//     }

//     const user = results[0];
//     const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

//     // Log login activity
//     const logSql = 'INSERT INTO user_activity_log (username, role, action, ip_address) VALUES (?, ?, ?, ?)';
//     db.query(logSql, [user.username, user.Role, 'login', ip], (logErr) => {
//       if (logErr) {
//         console.error('Failed to log login activity:', logErr);
//       }
//     });

//     res.json({
//       status: 'success',
//       user: {
//         userID: user.userID,
//         username: user.username,
//         name: user.Name,
//         role: user.Role,
//       },
//     });
//   });
// };


exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'error', message: 'Username and password required' });
  }

  const hashedPassword = md5Hash(password);

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(sql, [username, hashedPassword], (err, results) => {
    if (err) {
      console.error('Login query error:', err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(401).json({ status: 'error', message: 'Username or password is incorrect' });
    }

    const user = results[0];

    if (user.userStatus !== 'active') {
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated. Please contact admin.',
      });
    }

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

    const logSql = 'INSERT INTO user_activity_log (username, role, action, ip_address) VALUES (?, ?, ?, ?)';
    db.query(logSql, [user.username, user.Role, 'login', ip], (logErr) => {
      if (logErr) {
        console.error('Failed to log login activity:', logErr);
      }
    });

    res.json({
      status: 'success',
      user: {
        userID: user.userID,
        username: user.username,
        name: user.Name,
        role: user.Role,
      },
    });
  });
};


// ======================= LOGOUT =======================
exports.logout = (req, res) => {
  const { username, role } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  const logSql = 'INSERT INTO user_activity_log (username, role, action, ip_address) VALUES (?, ?, ?, ?)';
  db.query(logSql, [username, role, 'logout', ip], (logErr) => {
    if (logErr) {
      console.error('Failed to log logout activity:', logErr);
      return res.status(500).json({ status: 'error', message: 'Logout logging failed' });
    }

    res.json({ status: 'success', message: 'Logout logged' });
  });
};
