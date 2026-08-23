#!/bin/bash
# AI 自学提分平台 · 守护脚本（crontab 每5分钟检测一次，服务挂了自动拉起）
ROOT="/Users/lzx/WorkBuddy/自学平台/hackathon-ai-tutor"
NODE="/Users/lzx/.workbuddy/binaries/node/versions/22.22.2/bin/node"

# 后端没在跑就拉起
if ! curl -s -o /dev/null -w "" http://localhost:3001/api/health 2>/dev/null; then
  if ! lsof -i :3001 -sTCP:LISTEN >/dev/null 2>&1; then
    cd "$ROOT/backend" && nohup "$NODE" src/server.js >> "$ROOT/logs/backend.log" 2>&1 &
    echo "$(date '+%F %T') 后端掉线，已重启" >> "$ROOT/logs/guard.log"
  fi
fi

# 前端没在跑就拉起
if ! curl -s -o /dev/null http://localhost:5173/ 2>/dev/null; then
  if ! lsof -i :5173 -sTCP:LISTEN >/dev/null 2>&1; then
    cd "$ROOT/frontend" && nohup ./node_modules/.bin/vite --host >> "$ROOT/logs/frontend.log" 2>&1 &
    echo "$(date '+%F %T') 前端掉线，已重启" >> "$ROOT/logs/guard.log"
  fi
fi
