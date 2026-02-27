const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Get all media files - requires auth
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM media ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Add url field to each media item
    const media = (rows || []).map(row => ({
      ...row,
      url: row.file_path?.startsWith('/') ? row.file_path : `/uploads/${row.filename}`
    }));
    res.json({ media });
  });
});

// Upload media file - requires auth
router.post('/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = `/uploads/${req.file.filename}`;
  const uploadedBy = req.user ? req.user.id : null;
  const stmt = db.prepare('INSERT INTO media (filename, original_name, file_path, file_size, mime_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)');
  
  stmt.run(
    req.file.filename,
    req.file.originalname,
    filePath,
    req.file.size,
    req.file.mimetype,
    uploadedBy,
    function(err) {
      if (err) {
        // Clean up uploaded file on error
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        id: this.lastID,
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_path: filePath,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        url: filePath
      });
    }
  );
  stmt.finalize();
});

// Delete media file - requires auth
router.delete('/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM media WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Media not found' });
    }
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, '../public', row.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Delete from database
    const stmt = db.prepare('DELETE FROM media WHERE id = ?');
    stmt.run(req.params.id, function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Media deleted successfully' });
    });
    stmt.finalize();
  });
});

// Serve media files
router.get('/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../public/uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

module.exports = router;