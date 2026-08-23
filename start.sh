#!/bin/bash
# AI 自学提分平台 · 一键启动脚本
# 用法：./start.sh  （同时启动后端 + 前端，日志写入 logs/）
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
NODE="/Users/lzx/.workbuddy/binaries/node/versions/22.22.2/bin/node"
mkdir -p "$ROOT/logs"

echo "=========================================="
echo "  AI 自学提分平台 · 启动中"
echo "=========================================="

# 1. 检查依赖
if [ ! -d "$ROOT/backend/node_modules" ]; then
  echo "[1/4] 后端依赖缺失，正在安装..."
  cd "$ROOT/backend" && /Users/lzx/.workbuddy/binaries/node/versions/22.22.2/bin/npm install
  echo "      后端依赖安装完成"
fi
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "[2/4] 前端依赖缺失，正在安装..."
  cd "$ROOT/frontend" && /Users/lzx/.workbuddy/binaries/node/versions/22.22.2/bin/npm install
  echo "      前端依赖安装完成"
fi

# 2. 停止旧进程
pkill -f "node src/server.js" 2>/dev/null && echo "[旧后端已停止]" || true
pkill -f "node_modules/.bin/vite" 2>/dev/null && echo "[旧前端已停止]" || true
sleep 1

# 3. 启动后端
echo "[3/4] 启动后端 (localhost:3001)..."
cd "$ROOT/backend"
nohup "$NODE" src/server.js > "$ROOT/logs/backend.log" 2>&1 &
echo "      后端 PID: $!"

# 4. 启动前端
echo "[4/4] 启动前端 (localhost:5173)..."
cd "$ROOT/frontend"
nohup ./node_modules/.bin/vite --host > "$ROOT/logs/frontend.log" 2>&1 &
echo "      前端 PID: $!"

sleep 2

echo ""
echo "=========================================="
echo "  ✅ 启动完成！"
echo "  前端访问地址：http://localhost:5173/"
echo "  后端 API：    http://localhost:3001/api/health"
echo "  日志目录：    $ROOT/logs/"
echo ""
echo "  停止服务：    ./stop.sh"
echo "=========================================="
