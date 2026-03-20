const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const db = new sqlite3.Database('./blog.db');

// Ensure uploads directory exists (same as server.js static path)
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory:', uploadDir);
}

/**
 * 支持的文件类型配置
 */
const ALLOWED_TYPES = {
  // 图片
  image: {
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/x-icon', 'image/tiff'],
    prefix: 'img'
  },
  // 视频
  video: {
    extensions: ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'm4v', 'mpeg', 'mpg', '3gp'],
    mimeTypes: ['video/mp4', 'video/webm', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska', 'video/x-flv', 'video/x-ms-wmv', 'video/x-m4v', 'video/mpeg'],
    prefix: 'vid'
  },
  // 音频
  audio: {
    extensions: ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus', 'webma'],
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/mp4', 'audio/x-ms-wma', 'audio/opus'],
    prefix: 'aud'
  },
  // 文档
  document: {
    extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp', 'csv', 'md'],
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'text/rtf', 'application/rtf', 'application/vnd.oasis.opendocument.text', 'text/csv', 'text/markdown'],
    prefix: 'doc'
  },
  // 压缩包
  archive: {
    extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'],
    mimeTypes: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/x-tar', 'application/gzip', 'application/x-bzip2', 'application/x-xz'],
    prefix: 'arc'
  },
  // 代码文件
  code: {
    extensions: ['html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx', 'vue', 'json', 'xml', 'yaml', 'yml', 'sql', 'py', 'java', 'cpp', 'c', 'h', 'php', 'rb', 'go', 'rs', 'sh'],
    mimeTypes: ['text/html', 'text/css', 'application/javascript', 'application/json', 'text/xml', 'application/x-sh', 'text/x-python', 'text/x-java-source', 'text/x-c', 'text/x-c++', 'application/x-php', 'text/x-ruby', 'text/x-go', 'text/x-rust'],
    prefix: 'cod'
  },
  // 其他文件
  other: {
    extensions: ['bin', 'exe', 'dmg', 'pkg', 'apk', 'ipa'],
    mimeTypes: ['application/octet-stream', 'application/x-msdownload', 'application/x-apple-diskimage', 'application/vnd.android.package-archive'],
    prefix: 'file'
  }
};

/**
 * 获取文件类型信息
 */
function getFileTypeInfo(ext, mimeType) {
  ext = ext.toLowerCase();
  
  for (const [type, config] of Object.entries(ALLOWED_TYPES)) {
    if (config.extensions.includes(ext)) {
      return { type, prefix: config.prefix, category: type };
    }
    if (mimeType && config.mimeTypes.includes(mimeType)) {
      return { type, prefix: config.prefix, category: type };
    }
  }
  
  // 默认归类为其他文件
  return { type: 'other', prefix: 'file', category: 'other' };
}

/**
 * 生成规范化的文件名
 * 格式：{type}_{timestamp}_{random}.{ext}
 * 示例：img_20260304174520_a3f8b2c1.png
 */
function generateFilename(file) {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:T.]/g, '').slice(0, 14); // 14 位时间戳
  const random = Math.random().toString(36).substring(2, 10); // 8 位随机字符串
  
  // 获取文件扩展名
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  
  // 获取文件类型信息
  const typeInfo = getFileTypeInfo(ext, file.mimetype);
  
  // 确保扩展名安全（只允许字母和数字）
  const safeExt = ext.replace(/[^a-z0-9]/g, '') || 'bin';
  
  return `${typeInfo.prefix}_${timestamp}_${random}.${safeExt}`;
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    try {
      const filename = generateFilename(file);
      cb(null, filename);
    } catch (error) {
      console.error('Error generating filename:', error);
      // 回退到简单命名
      const safeName = Date.now() + '-' + Math.random().toString(36).substring(2, 10);
      cb(null, safeName + path.extname(file.originalname).toLowerCase());
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (增加限制以支持视频)
    files: 1 // 限制单次上传文件数
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const mimeType = file.mimetype;
    
    // 检查是否支持的文件类型
    let isAllowed = false;
    
    for (const config of Object.values(ALLOWED_TYPES)) {
      if (config.extensions.includes(ext) || (mimeType && config.mimeTypes.includes(mimeType))) {
        isAllowed = true;
        break;
      }
    }
    
    if (isAllowed) {
      console.log(`允许上传：${ext} (${mimeType})`);
      cb(null, true);
    } else {
      const errorMsg = `不支持的文件格式。支持的格式：图片 (${ALLOWED_TYPES.image.extensions.join(', ')}), 视频 (${ALLOWED_TYPES.video.extensions.join(', ')}), 音频 (${ALLOWED_TYPES.audio.extensions.join(', ')}), 文档 (${ALLOWED_TYPES.document.extensions.join(', ')}) 等`;
      console.error(`拒绝上传：${ext} (${mimeType})`);
      cb(new Error(errorMsg), false);
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
  
  // 修复中文文件名编码问题
  let originalName = req.file.originalname;
  try {
    // 确保文件名是 UTF-8 编码
    if (Buffer.isBuffer(originalName)) {
      originalName = originalName.toString('utf8');
    } else if (typeof originalName === 'string') {
      // 尝试修复可能的编码问题
      originalName = Buffer.from(originalName, 'latin1').toString('utf8');
    }
  } catch (e) {
    console.error('文件名编码转换失败:', e);
    originalName = req.file.originalname;
  }
  
  const stmt = db.prepare('INSERT INTO media (filename, original_name, file_path, file_size, mime_type, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)');
  
  stmt.run(
    req.file.filename,
    originalName,
    filePath,
    req.file.size,
    req.file.mimetype,
    uploadedBy,
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      res.json({
        success: true,
        message: '文件上传成功',
        data: {
          id: this.lastID,
          filename: req.file.filename,
          original_name: originalName,
          file_path: filePath,
          file_size: req.file.size,
          mime_type: req.file.mimetype,
          url: filePath
        }
      });
    }
  );
});

// Delete media file - requires auth
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // Get file info from database
  db.get('SELECT * FROM media WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Delete file from disk
    const filePath = path.join(uploadDir, row.filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting file:', err);
      }
      
      // Delete from database
      db.run('DELETE FROM media WHERE id = ?', [id], (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: '文件已删除' });
      });
    });
  });
});

// Get media stats - public read (consistent with posts/stats and comments/stats)
router.get('/stats', (req, res) => {
  const stats = {};
  
  db.get('SELECT COUNT(*) as total, SUM(file_size) as total_size FROM media', (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    stats.total = row.total || 0;
    stats.total_size = row.total_size || 0;
    
    // Get type breakdown
    db.all('SELECT mime_type, COUNT(*) as count FROM media GROUP BY mime_type', (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      stats.by_type = rows || [];
      
      res.json({ stats });
    });
  });
});

// Get supported file types info
router.get('/supported-types', (req, res) => {
  res.json({
    supported_types: ALLOWED_TYPES,
    max_file_size: '50MB'
  });
});

module.exports = router;
