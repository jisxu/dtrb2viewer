#!/bin/bash

echo "========================================"
echo "  DTRB2 Viewer Build Script"
echo "========================================"
cd "$(dirname "$0")/.."

# 创建输出目录
mkdir -p build

echo ""
echo "[1/2] Building Linux version..."
GOOS=linux GOARCH=amd64 go build -o build/dtrb2-viewer-linux .
if [ $? -eq 0 ]; then
    echo "      Success: build/dtrb2-viewer-linux"
else
    echo "      Failed to build Linux version!"
    exit 1
fi

echo ""
echo "[2/2] Building Windows version..."
GOOS=windows GOARCH=amd64 go build -o build/dtrb2-viewer.exe .
if [ $? -eq 0 ]; then
    echo "      Success: build/dtrb2-viewer.exe"
else
    echo "      Failed to build Windows version!"
    exit 1
fi

echo ""
echo "========================================"
echo "  Build Complete!"
echo "========================================"
echo "  Linux:   build/dtrb2-viewer-linux"
echo "  Windows: build/dtrb2-viewer.exe"
echo "========================================"