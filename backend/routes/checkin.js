const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// 创建签到表
function initCheckinTable(db) {
  db.run(`CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    streak INTEGER DEFAULT 1,
    points INTEGER DEFAULT 10,
    note TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);
  
  // 添加用户总签到统计字段到 users 表（如果不存在）
  db.run(`ALTER TABLE users ADD COLUMN total_checkins INTEGER DEFAULT 0`, (err) => {
    if (err) console.log('total_checkins column may already exist');
  });
  
  db.run(`ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0`, (err) => {
    if (err) console.log('current_streak column may already exist');
  });
  
  db.run(`ALTER TABLE users ADD COLUMN last_checkin DATETIME`, (err) => {
    if (err) console.log('last_checkin column may already exist');
  });
}

// 获取用户签到状态
router.get('/status', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  
  // 获取用户信息
  db.get('SELECT id, username, total_checkins, current_streak, last_checkin FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    // 获取今日是否已签到
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = tomorrow.toISOString();
    
    db.get(`SELECT id, created_at, points FROM checkins 
            WHERE user_id = ? AND created_at >= ? AND created_at < ? 
            ORDER BY created_at DESC LIMIT 1`, 
            [userId, todayStart, tomorrowStart], 
            (err, todayCheckin) => {
              if (err) {
                return res.status(500).json({ error: '数据库错误' });
              }
              
              // 获取最近 7 天签到记录
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              
              db.all(`SELECT date(created_at) as date, points, streak 
                      FROM checkins 
                      WHERE user_id = ? AND created_at >= ? 
                      ORDER BY created_at DESC`, 
                      [userId, weekAgo.toISOString()], 
                      (err, recentCheckins) => {
                        if (err) {
                          return res.status(500).json({ error: '数据库错误' });
                        }
                        
                        res.json({
                          success: true,
                          data: {
                            username: user.username,
                            totalCheckins: user.total_checkins || 0,
                            currentStreak: user.current_streak || 0,
                            lastCheckin: user.last_checkin,
                            checkedInToday: !!todayCheckin,
                            todayPoints: todayCheckin?.points || 0,
                            recentCheckins: recentCheckins || []
                          }
                        });
                      });
            });
  });
});

// 执行签到
router.post('/do', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const note = req.body.note || '';
  
  // 检查今日是否已签到
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.toISOString();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStart = tomorrow.toISOString();
  
  db.get(`SELECT id FROM checkins 
          WHERE user_id = ? AND created_at >= ? AND created_at < ?`, 
          [userId, todayStart, tomorrowStart], 
          (err, todayCheckin) => {
            if (err) {
              return res.status(500).json({ error: '数据库错误' });
            }
            
            if (todayCheckin) {
              return res.status(400).json({ 
                error: '今日已签到',
                message: '明天再来吧！'
              });
            }
            
            // 获取用户当前连续签到天数
            db.get('SELECT current_streak, last_checkin FROM users WHERE id = ?', [userId], (err, user) => {
              if (err) {
                return res.status(500).json({ error: '数据库错误' });
              }
              
              let newStreak = 1;
              let points = 10;
              
              if (user && user.last_checkin) {
                const lastCheckin = new Date(user.last_checkin);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                
                // 如果上次签到是昨天或今天之前不久，连续签到 +1
                if (lastCheckin >= yesterday) {
                  newStreak = (user.current_streak || 0) + 1;
                }
              }
              
              // 连续签到奖励：每连续 7 天额外奖励 5 分
              const bonusPoints = Math.floor(newStreak / 7) * 5;
              points += bonusPoints;
              
              // 插入签到记录
              db.run(`INSERT INTO checkins (user_id, streak, points, note) VALUES (?, ?, ?, ?)`, 
                      [userId, newStreak, points, note], 
                      function(err) {
                        if (err) {
                          return res.status(500).json({ error: '数据库错误' });
                        }
                        
                        const checkinId = this.lastID;
                        
                        // 更新用户统计
                        db.run(`UPDATE users 
                                SET total_checkins = COALESCE(total_checkins, 0) + 1,
                                    current_streak = ?,
                                    last_checkin = CURRENT_TIMESTAMP 
                                WHERE id = ?`, 
                                [newStreak, userId], 
                                (err) => {
                                  if (err) {
                                    return res.status(500).json({ error: '数据库错误' });
                                  }
                                  
                                  res.json({
                                    success: true,
                                    message: '签到成功！',
                                    data: {
                                      checkinId,
                                      points,
                                      bonusPoints,
                                      streak: newStreak,
                                      totalCheckins: (user?.total_checkins || 0) + 1
                                    }
                                  });
                                });
                      });
            });
          });
});

// 获取签到排行榜
router.get('/leaderboard', (req, res) => {
  const db = req.app.get('db');
  
  db.all(`SELECT id, username, avatar, 
                 COALESCE(total_checkins, 0) as total_checkins,
                 COALESCE(current_streak, 0) as current_streak,
                 last_checkin
          FROM users 
          WHERE role != 'admin'
          ORDER BY total_checkins DESC, current_streak DESC 
          LIMIT 50`, 
          (err, users) => {
            if (err) {
              return res.status(500).json({ error: '数据库错误' });
            }
            
            res.json({
              success: true,
              data: users
            });
          });
});

// 获取我的签到日历（当月）
router.get('/calendar', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11
  
  const monthStart = new Date(year, month, 1).toISOString();
  const monthEnd = new Date(year, month + 1, 0).toISOString();
  
  db.all(`SELECT date(created_at) as date, points, streak 
          FROM checkins 
          WHERE user_id = ? AND created_at >= ? AND created_at <= ? 
          ORDER BY created_at`, 
          [userId, monthStart, monthEnd], 
          (err, checkins) => {
            if (err) {
              return res.status(500).json({ error: '数据库错误' });
            }
            
            // 生成当月日历数据
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0-6 (周日 - 周六)
            
            const calendar = [];
            for (let i = 0; i < firstDayOfMonth; i++) {
              calendar.push(null); // 空白天数
            }
            
            for (let day = 1; day <= daysInMonth; day++) {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const checkin = checkins.find(c => c.date === dateStr);
              calendar.push({
                day,
                date: dateStr,
                checkedIn: !!checkin,
                points: checkin?.points || 0,
                streak: checkin?.streak || 0
              });
            }
            
            res.json({
              success: true,
              data: {
                year,
                month: month + 1,
                calendar
              }
            });
          });
});

module.exports = { router, initCheckinTable };
