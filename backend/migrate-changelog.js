const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./blog.db');

// 读取 changelog.json
const changelogData = JSON.parse(fs.readFileSync('/home/admin/.openclaw/workspace/blog-project/data/changelog.json', 'utf8'));

console.log('开始导入更新日志数据...');

db.serialize(() => {
  // 创建表
  db.run(`CREATE TABLE IF NOT EXISTS changelog (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    date TEXT NOT NULL,
    changes TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 清空旧数据
  db.run('DELETE FROM changelog', (err) => {
    if (err) console.error('清空失败:', err);
  });

  // 插入新数据
  const stmt = db.prepare('INSERT INTO changelog (version, date, changes) VALUES (?, ?, ?)');
  
  changelogData.changelog.forEach((entry) => {
    stmt.run(entry.version, entry.date, JSON.stringify(entry.changes), (err) => {
      if (err) {
        console.error(`导入 ${entry.version} 失败:`, err);
      } else {
        console.log(`✓ 导入版本 ${entry.version}`);
      }
    });
  });

  stmt.finalize(() => {
    console.log('数据导入完成！');
    db.close();
  });
});
