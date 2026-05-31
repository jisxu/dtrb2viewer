@echo off
chcp 65001 >nul
title DTRB2 数码兽进化路线查看器
cd /d "%~dp0"

if not exist "build\dtrb2-viewer.exe" (
    echo [提示] 首次运行，正在编译程序...
    call build.bat
    if errorlevel 1 (
        echo [错误] 编译失败，请检查Go环境是否安装
        pause
        exit /b 1
    )
)

echo [启动] 正在启动程序...
echo [提示] 浏览器将自动打开，如未打开请访问 http://localhost:8080
echo [提示] 按 Ctrl+C 可停止程序
echo.

if "%~1"=="" (
    build\dtrb2-viewer.exe
) else (
    build\dtrb2-viewer.exe -port %~1
)