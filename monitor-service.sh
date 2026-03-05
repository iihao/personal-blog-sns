#!/bin/bash

# 博客后端服务监控脚本
# 每分钟检查一次，如果服务停止则自动重启

LOG_FILE="/home/admin/.openclaw/workspace/blog-project/monitor.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

check_and_restart() {
    # 检查 PM2 进程状态
    status=$(pm2 status blog-backend --no-color 2>/dev/null | grep -o "online\|stopped\|errored")
    
    if [ "$status" != "online" ]; then
        log "⚠️  检测到服务异常 (状态：$status)，正在重启..."
        pm2 restart blog-backend --update-env
        sleep 3
        
        # 验证重启是否成功
        new_status=$(pm2 status blog-backend --no-color 2>/dev/null | grep -o "online\|stopped\|errored")
        if [ "$new_status" = "online" ]; then
            log "✅ 服务重启成功"
        else
            log "❌ 服务重启失败，当前状态：$new_status"
        fi
    else
        log "✓ 服务运行正常"
    fi
}

# 主循环
log "🚀 启动监控脚本..."

while true; do
    check_and_restart
    sleep 60
done
