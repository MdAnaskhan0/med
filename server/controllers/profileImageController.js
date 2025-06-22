const db = require('../config/db');
const fs = require('fs');
const path = require('path');

exports.uploadImage = (req, res) => {
  const { userID } = req.params;
  if (!req.file) {
    return res.status(400).send({ error: 'No file uploaded' });
  }

  // First check if user exists
  db.query('SELECT 1 FROM users WHERE userID = ?', [userID], (err, userResult) => {
    if (err) return res.status(500).send({ error: err.message });
    if (userResult.length === 0) return res.status(404).send({ error: 'User not found' });

    // Check if user already has a profile image
    db.query('SELECT imagePath FROM profile_images WHERE userID = ?', [userID], (err, result) => {
      if (err) return res.status(500).send({ error: err.message });

      const imagePath = req.file.path;
      
      if (result.length > 0) {
        // Update existing image
        const oldImagePath = result[0].imagePath;
        // Delete old file
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error('Error deleting old image:', err);
        });

        db.query(
          'UPDATE profile_images SET imagePath = ? WHERE userID = ?',
          [imagePath, userID],
          (err) => {
            if (err) return res.status(500).send({ error: err.message });
            res.send({ message: 'Profile image updated successfully', imagePath });
          }
        );
      } else {
        // Insert new image
        db.query(
          'INSERT INTO profile_images (userID, imagePath) VALUES (?, ?)',
          [userID, imagePath],
          (err) => {
            if (err) return res.status(500).send({ error: err.message });
            res.send({ message: 'Profile image uploaded successfully', imagePath });
          }
        );
      }
    });
  });
};

exports.getImage = (req, res) => {
  const { userID } = req.params;
  
  db.query(
    'SELECT imagePath FROM profile_images WHERE userID = ?',
    [userID],
    (err, result) => {
      if (err) return res.status(500).send({ error: err.message });
      if (result.length === 0) return res.status(404).send({ error: 'No profile image found' });

      const imagePath = result[0].imagePath;
      res.sendFile(path.join(__dirname, '../', imagePath));
    }
  );
};

exports.deleteImage = (req, res) => {
  const { userID } = req.params;
  
  db.query(
    'SELECT imagePath FROM profile_images WHERE userID = ?',
    [userID],
    (err, result) => {
      if (err) return res.status(500).send({ error: err.message });
      if (result.length === 0) return res.status(404).send({ error: 'No profile image found' });

      const imagePath = result[0].imagePath;
      
      // Delete file from filesystem
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image file:', err);
        
        // Delete record from database
        db.query(
          'DELETE FROM profile_images WHERE userID = ?',
          [userID],
          (err) => {
            if (err) return res.status(500).send({ error: err.message });
            res.send({ message: 'Profile image deleted successfully' });
          }
        );
      });
    }
  );
};