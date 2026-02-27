#!/bin/bash
# 博客前端部署脚本
# 使用方法：sudo bash deploy-frontend.sh

set -e

echo "🚀 开始部署博客前端..."

# 1. 构建前端
echo "📦 构建前端..."
cd /home/admin/.openclaw/workspace/blog-project/frontend
npm run build

# 2. 备份旧版本
echo "💾 备份旧版本..."
BACKUP_DIR="/var/www/blog-frontend.backup.$(date +%Y%m%d%H%M%S)"
cp -r /var/www/blog-frontend "$BACKUP_DIR"
echo "备份已保存至：$BACKUP_DIR"

# 3. 部署新版本
echo "📤 部署新版本..."
rm -rf /var/www/blog-frontend/*
cp -r /home/admin/.openclaw/workspace/blog-project/frontend/dist/* /var/www/blog-frontend/

# 4. 设置权限
echo "🔐 设置权限..."
chown -R nginx:nginx /var/www/blog-frontend/
chmod -R 755 /var/www/blog-frontend/

# 5. 验证 nginx 配置
echo "✅ 验证 nginx 配置..."
nginx -t

# 6. 重载 nginx
echo "🔄 重载 nginx..."
systemctl reload nginx

# 7. 验证部署
echo "🧪 验证部署..."
echo "检查首页..."
curl -sI https://sqlboy.top/ | head -1

echo "检查分类页..."
curl -sI "https://sqlboy.top/categories/技术分享" | head -1

echo "检查标签页..."
curl -sI "https://sqlboy.top/tags/Vue3" | head -1

echo ""
echo "✅ 部署完成！"
echo "备份位置：$BACKUP_DIR"
echo ""
echo "如有问题，可恢复备份："
echo "  sudo rm -rf /var/www/blog-frontend/*"
echo "  sudo cp -r $BACKUP_DIR/* /var/www/blog-frontend/"
