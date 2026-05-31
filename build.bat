@echo off
echo Building DTRB2 Viewer...
cd /d "%~dp0"
go build -o dtrb2-viewer.exe .
if %errorlevel% equ 0 (
    echo Build successful!
    echo Output: dtrb2-viewer.exe
) else (
    echo Build failed!
)
pause
