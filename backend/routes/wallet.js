const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

// 初始化钱包表
function initWalletTable(db) {
  // 钱包表
  db.run(`CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    balance REAL DEFAULT 0,
    points REAL DEFAULT 0,
    frozen_balance REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // 钱包流水表
  db.run(`CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    balance_before REAL NOT NULL,
    balance_after REAL NOT NULL,
    points_before REAL NOT NULL,
    points_after REAL NOT NULL,
    description TEXT,
    reference_type TEXT,
    reference_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // 充值订单表
  db.run(`CREATE TABLE IF NOT EXISTS recharge_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_no TEXT UNIQUE NOT NULL,
    amount REAL NOT NULL,
    points REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // 钱包配置表
  db.run(`CREATE TABLE IF NOT EXISTS wallet_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 初始化默认配置
  const defaultConfigs = [
    ['recharge_enabled', 'true', '是否启用充值'],
    ['withdraw_enabled', 'false', '是否启用提现'],
    ['min_recharge', '1', '最低充值金额'],
    ['max_recharge', '10000', '最高充值金额'],
    ['points_rate', '1', '积分兑换比例（1 元=多少积分）'],
    ['recharge_bonus_rate', '0', '充值赠送比例（0.1=10%）']
  ];

  defaultConfigs.forEach(([key, value, description]) => {
    db.run(`INSERT OR IGNORE INTO wallet_config (key, value, description) VALUES (?, ?, ?)`, 
      [key, value, description]);
  });
}

// 获取或创建用户钱包
function getOrCreateWallet(db, userId, callback) {
  db.get('SELECT * FROM wallets WHERE user_id = ?', [userId], (err, wallet) => {
    if (err) return callback(err);
    
    if (!wallet) {
      db.run(`INSERT INTO wallets (user_id, balance, points) VALUES (?, 0, 0)`, [userId], function(err) {
        if (err) return callback(err);
        db.get('SELECT * FROM wallets WHERE user_id = ?', [userId], callback);
      });
    } else {
      callback(null, wallet);
    }
  });
}

// 记录交易流水
function recordTransaction(db, userId, type, amount, description, referenceType, referenceId, callback) {
  getOrCreateWallet(db, userId, (err, wallet) => {
    if (err) return callback(err);
    
    const balanceBefore = wallet.balance;
    const pointsBefore = wallet.points;
    let balanceAfter = balanceBefore;
    let pointsAfter = pointsBefore;
    
    if (type === 'recharge' || type === 'bonus' || type === 'refund') {
      balanceAfter += amount;
    } else if (type === 'consume' || type === 'withdraw') {
      balanceAfter -= amount;
    }
    
    if (type === 'points_earn' || type === 'checkin' || type === 'bonus') {
      pointsAfter += amount;
    } else if (type === 'points_use') {
      pointsAfter -= amount;
    }
    
    db.run(`UPDATE wallets SET balance = ?, points = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [balanceAfter, pointsAfter, userId], function(err) {
        if (err) return callback(err);
        
        db.run(`INSERT INTO wallet_transactions 
          (user_id, type, amount, balance_before, balance_after, points_before, points_after, description, reference_type, reference_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, type, amount, balanceBefore, balanceAfter, pointsBefore, pointsAfter, description, referenceType, referenceId],
          function(err) {
            if (err) return callback(err);
            callback(null, { transactionId: this.lastID, balanceAfter, pointsAfter });
          });
      });
  });
}

// 获取钱包配置
router.get('/config', async (req, res) => {
  const db = req.app.get('db');
  
  db.all('SELECT * FROM wallet_config', (err, configs) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    
    const config = {};
    configs.forEach(c => {
      config[c.key] = c.value;
    });
    
    res.json({ success: true, data: config });
  });
});

// 获取用户钱包信息
router.get('/balance', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  
  getOrCreateWallet(db, userId, (err, wallet) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    
    // 获取最近交易记录
    db.all(`SELECT * FROM wallet_transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 20`, 
            [userId], 
            (err, transactions) => {
              if (err) {
                return res.status(500).json({ error: '数据库错误' });
              }
              
              res.json({
                success: true,
                data: {
                  balance: wallet.balance,
                  points: wallet.points,
                  frozenBalance: wallet.frozen_balance,
                  transactions: transactions || []
                }
              });
            });
  });
});

// 获取交易明细
router.get('/transactions', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const type = req.query.type;
  
  let sql = `SELECT * FROM wallet_transactions WHERE user_id = ?`;
  const params = [userId];
  
  if (type) {
    sql += ` AND type = ?`;
    params.push(type);
  }
  
  sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, (page - 1) * limit);
  
  db.all(sql, params, (err, transactions) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    
    db.get(`SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ? ${type ? 'AND type = ?' : ''}`, 
      type ? [userId, type] : [userId], 
      (err, countRow) => {
        res.json({
          success: true,
          data: {
            transactions,
            pagination: {
              page,
              limit,
              total: countRow?.total || 0
            }
          }
        });
      });
  });
});

// 创建充值订单
router.post('/recharge', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const { amount, paymentMethod } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: '充值金额无效' });
  }
  
  // 获取配置
  db.get('SELECT value FROM wallet_config WHERE key = ?', ['min_recharge'], (err, minRow) => {
    const minRecharge = minRow ? parseFloat(minRow.value) : 1;
    if (amount < minRecharge) {
      return res.status(400).json({ error: `最低充值金额为 ${minRecharge} 元` });
    }
    
    db.get('SELECT value FROM wallet_config WHERE key = ?', ['max_recharge'], (err, maxRow) => {
      const maxRecharge = maxRow ? parseFloat(maxRow.value) : 10000;
      if (amount > maxRecharge) {
        return res.status(400).json({ error: `最高充值金额为 ${maxRecharge} 元` });
      }
      
      // 生成订单号
      const orderNo = 'R' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // 计算赠送积分
      db.get('SELECT value FROM wallet_config WHERE key = ?', ['points_rate'], (err, rateRow) => {
        const pointsRate = rateRow ? parseFloat(rateRow.value) : 1;
        const points = amount * pointsRate;
        
        db.run(`INSERT INTO recharge_orders (user_id, order_no, amount, points, payment_method, status) 
                VALUES (?, ?, ?, ?, ?, 'pending')`,
                [userId, orderNo, amount, points, paymentMethod || 'alipay'],
                function(err) {
                  if (err) {
                    return res.status(500).json({ error: '创建订单失败' });
                  }
                  
                  res.json({
                    success: true,
                    message: '订单创建成功',
                    data: {
                      orderId: this.lastID,
                      orderNo,
                      amount,
                      points,
                      paymentMethod: paymentMethod || 'alipay',
                      status: 'pending'
                    }
                  });
                });
      });
    });
  });
});

// 确认充值（模拟支付成功）
router.post('/recharge/confirm', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const { orderNo } = req.body;
  
  db.get('SELECT * FROM recharge_orders WHERE order_no = ? AND user_id = ?', [orderNo, userId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    
    if (!order) {
      return res.status(404).json({ error: '订单不存在' });
    }
    
    if (order.status !== 'pending') {
      return res.status(400).json({ error: '订单状态不正确' });
    }
    
    // 更新订单状态
    db.run(`UPDATE recharge_orders SET status = 'completed', payment_time = CURRENT_TIMESTAMP WHERE id = ?`, 
      [order.id], function(err) {
        if (err) {
          return res.status(500).json({ error: '更新订单失败' });
        }
        
        // 记录交易
        recordTransaction(db, userId, 'recharge', order.amount, 
          `充值成功 - 订单 ${orderNo}`, 'recharge_order', order.id,
          (err, result) => {
            if (err) {
              return res.status(500).json({ error: '更新余额失败' });
            }
            
            // 赠送积分
            if (order.points > 0) {
              recordTransaction(db, userId, 'bonus', order.points,
                `充值赠送 - 订单 ${orderNo}`, 'recharge_order', order.id,
                () => {});
            }
            
            res.json({
              success: true,
              message: '充值成功',
              data: {
                amount: order.amount,
                points: order.points,
                balance: result.balanceAfter
              }
            });
          });
      });
  });
});

// 消费（扣款）
router.post('/consume', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const { amount, description, referenceType, referenceId } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: '金额无效' });
  }
  
  getOrCreateWallet(db, userId, (err, wallet) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    
    if (wallet.balance < amount) {
      return res.status(400).json({ error: '余额不足' });
    }
    
    recordTransaction(db, userId, 'consume', amount, 
      description || '消费', referenceType || 'order', referenceId,
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: '扣款失败' });
        }
        
        res.json({
          success: true,
          message: '支付成功',
          data: {
            amount,
            balance: result.balanceAfter
          }
        });
      });
  });
});

// 积分兑换余额
router.post('/points/exchange', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const { points } = req.body;
  
  if (!points || points <= 0) {
    return res.status(400).json({ error: '积分数量无效' });
  }
  
  getOrCreateWallet(db, userId, (err, wallet) => {
    if (err) {
      return res.status(500).json({ error: '数据库错误' });
    }
    
    if (wallet.points < points) {
      return res.status(400).json({ error: '积分不足' });
    }
    
    // 获取兑换比例
    db.get('SELECT value FROM wallet_config WHERE key = ?', ['points_rate'], (err, rateRow) => {
      const pointsRate = rateRow ? parseFloat(rateRow.value) : 1;
      const amount = points / pointsRate;
      
      // 扣除积分
      db.run(`UPDATE wallets SET points = points - ? WHERE user_id = ?`, [points, userId], function(err) {
        if (err) {
          return res.status(500).json({ error: '兑换失败' });
        }
        
        // 记录交易
        recordTransaction(db, userId, 'points_use', points,
          `积分兑换余额`, 'points_exchange', null,
          (err) => {
            if (err) {
              return res.status(500).json({ error: '记录失败' });
            }
            
            // 增加余额
            recordTransaction(db, userId, 'exchange', amount,
              `积分兑换 - ${points} 积分`, 'points_exchange', null,
              (err, result) => {
                if (err) {
                  return res.status(500).json({ error: '兑换失败' });
                }
                
                res.json({
                  success: true,
                  message: '兑换成功',
                  data: {
                    points,
                    amount,
                    balance: result.balanceAfter
                  }
                });
              });
          });
      });
    });
  });
});

// ============ 管理员接口 ============

// 获取所有钱包统计
router.get('/admin/stats', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  
  // 检查管理员权限
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || user?.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    db.get(`SELECT 
              COUNT(DISTINCT user_id) as totalUsers,
              SUM(balance) as totalBalance,
              SUM(points) as totalPoints,
              SUM(frozen_balance) as totalFrozen
            FROM wallets`, 
            (err, stats) => {
              if (err) {
                return res.status(500).json({ error: '数据库错误' });
              }
              
              db.get(`SELECT COUNT(*) as totalTransactions FROM wallet_transactions`, (err, txStats) => {
                res.json({
                  success: true,
                  data: {
                    totalUsers: stats?.totalUsers || 0,
                    totalBalance: stats?.totalBalance || 0,
                    totalPoints: stats?.totalPoints || 0,
                    totalFrozen: stats?.totalFrozen || 0,
                    totalTransactions: txStats?.total || 0
                  }
                });
              });
            });
  });
});

// 获取所有钱包列表
router.get('/admin/wallets', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || user?.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    db.all(`SELECT w.*, u.username, u.email 
            FROM wallets w 
            LEFT JOIN users u ON w.user_id = u.id 
            ORDER BY w.updated_at DESC 
            LIMIT ? OFFSET ?`, 
            [limit, (page - 1) * limit], 
            (err, wallets) => {
              if (err) {
                return res.status(500).json({ error: '数据库错误' });
              }
              
              db.get('SELECT COUNT(*) as total FROM wallets', (err, countRow) => {
                res.json({
                  success: true,
                  data: {
                    wallets,
                    pagination: {
                      page,
                      limit,
                      total: countRow?.total || 0
                    }
                  }
                });
              });
            });
  });
});

// 更新钱包配置
router.put('/admin/config', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const configs = req.body;
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || user?.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    const updates = Object.entries(configs).map(([key, value]) => {
      return new Promise((resolve, reject) => {
        db.run(`UPDATE wallet_config SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?`, 
          [value, key], function(err) {
            if (err) reject(err);
            else resolve();
          });
      });
    });
    
    Promise.all(updates)
      .then(() => {
        res.json({ success: true, message: '配置更新成功' });
      })
      .catch(err => {
        res.status(500).json({ error: '更新配置失败' });
      });
  });
});

// 手动调整用户余额（管理员）
router.post('/admin/adjust', authenticateToken, (req, res) => {
  const db = req.app.get('db');
  const { userId, type, amount, description } = req.body;
  
  db.get('SELECT role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || user?.role !== 'admin') {
      return res.status(403).json({ error: '无权限' });
    }
    
    if (!userId || !amount) {
      return res.status(400).json({ error: '参数不完整' });
    }
    
    recordTransaction(db, userId, type || 'adjust', amount, 
      description || '管理员调整', 'admin_adjust', null,
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: '调整失败' });
        }
        
        res.json({
          success: true,
          message: '调整成功',
          data: {
            balance: result.balanceAfter,
            points: result.pointsAfter
          }
        });
      });
  });
});

module.exports = { router, initWalletTable };
