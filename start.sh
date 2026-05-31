#!/bin/bash

echo "========================================"
echo "  DTRB2 数码兽进化路线查看器"
echo "========================================"
cd "$(dirname "$0")"

# 检查是否需要编译
if [ ! -f "build/dtrb2-viewer-linux" ]; then
    echo "[提示] 首次运行，正在编译程序..."
    ./build.sh
    if [ $? -ne 0 ]; then
        echo "[错误] 编译失败，请检查Go环境是否安装"
        exit 1
    fi
fi

echo "[启动] 正在启动程序..."
echo "[提示] 浏览器将自动打开，如未打开请访问 http://localhost:8080"
echo "[提示] 按 Ctrl+C 可停止程序"
echo ""

# 检查是否指定了端口
if [ -z "$1" ]; then
    ./build/dtrb2-viewer-linux
else
    ./build/dtrb2-viewer-linux -port "$1"
fi