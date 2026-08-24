#!/bin/bash
# AI 自学提分平台 · 一键启动
# 双击本文件启动。若出错，本窗口会暂停显示错误信息，不会闪退。
# 脚本写死了项目路径，无论本文件放在桌面还是别处都能工作。

PROJECT="/Users/lzx/WorkBuddy/自学平台/hackathon-ai-tutor"

# 清理 Gatekeeper 拦截属性（自家脚本，无需检查）
xattr -c "$PROJECT/start.sh" 2>/dev/null
xattr -c "$PROJECT/stop.sh" 2>/dev/null
xattr -c "$PROJECT/ensure-running.sh" 2>/dev/null

if [ ! -f "$PROJECT/start.sh" ]; then
  echo "❌ 找不到项目目录：$PROJECT"
  echo "按回车关闭..."
  read -r
  exit 1
fi

echo "正在启动 AI 自学提分平台..."
echo ""

cd "$PROJECT" && ./start.sh

echo ""
echo "=========================================="
echo "  ✅ 服务已启动！"
echo "  浏览器打开：http://localhost:5173/"
echo "  如果页面打不开，等 3 秒后刷新一次。"
echo "  本窗口可以关闭，服务会继续在后台运行。"
echo "=========================================="
echo ""
echo "按回车关闭本窗口..."
read -r
