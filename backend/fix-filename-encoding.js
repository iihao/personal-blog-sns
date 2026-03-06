const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./blog.db');

console.log('开始修复文件名编码...');

// 获取所有媒体文件
db.all('SELECT id, original_name FROM media', (err, rows) => {
  if (err) {
    console.error('查询失败:', err);
    return;
  }
  
  let fixed = 0;
  
  rows.forEach(row => {
    try {
      // 尝试修复编码
      const fixedName = Buffer.from(row.original_name, 'latin1').toString('utf8');
      
      // 检查修复后是否合理（包含中文字符）
      if (/[\u4e00-\u9fa5]/.test(fixedName)) {
        db.run('UPDATE media SET original_name = ? WHERE id = ?', [fixedName, row.id], (err) => {
          if (!err) {
            console.log(`修复 ID ${row.id}: ${row.original_name} → ${fixedName}`);
            fixed++;
          }
        });
      }
    } catch (e) {
      // 跳过无法修复的
    }
  });
  
  setTimeout(() => {
    console.log(`\n修复完成，共修复 ${fixed} 个文件`);
    db.close();
  }, 1000);
});
