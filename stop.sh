#!/bin/bash
# AI 自学提分平台 · 停止服务
pkill -f "node src/server.js" 2>/dev/null && echo "✅ 后端已停止" || echo "后端未在运行"
pkill -f "node_modules/.bin/vite" 2>/dev/null && echo "✅ 前端已停止" || echo "前端未在运行"
