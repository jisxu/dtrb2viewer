@echo off
echo ========================================
echo   DTRB2 Viewer Build Script
echo ========================================
cd /d "%~dp0\.."

:: 创建输出目录
if not exist "build" mkdir build

echo.
echo [1/2] Building Windows version...
set GOOS=windows
set GOARCH=amd64
go build -o build/dtrb2-viewer.exe .
if %errorlevel% equ 0 (
    echo       Success: build/dtrb2-viewer.exe
) else (
    echo       Failed to build Windows version!
    goto :error
)

echo.
echo [2/2] Building Linux version...
set GOOS=linux
set GOARCH=amd64
go build -o build/dtrb2-viewer-linux .
if %errorlevel% equ 0 (
    echo       Success: build/dtrb2-viewer-linux
) else (
    echo       Failed to build Linux version!
    goto :error
)

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo   Windows: build/dtrb2-viewer.exe
echo   Linux:   build/dtrb2-viewer-linux
echo ========================================
pause
exit /b 0

:error
echo.
echo Build failed!
pause
exit /b 1