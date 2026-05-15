@echo off
setlocal

echo ============================================
echo   NeteaseMusicAPI - EXE Build Tool
echo   Using PyInstaller
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.7+ and add to PATH.
    pause
    exit /b 1
)

:: Check PyInstaller
python -c "import PyInstaller" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing PyInstaller...
    pip install pyinstaller
    if errorlevel 1 (
        echo [ERROR] Failed to install PyInstaller. Run: pip install pyinstaller
        pause
        exit /b 1
    )
)

:: Install dependencies
echo [1/4] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [WARN] Some dependencies failed, trying to continue...
)

:: Clean old PyInstaller build artifacts
echo [2/4] Cleaning old build artifacts...
if exist "pybuild" rmdir /s /q pybuild
if exist "dist" rmdir /s /q dist

:: Build with PyInstaller
:: NOTE: --specpath must be set to current dir (.), NOT dist,
::       otherwise PyInstaller looks for templates relative to spec path and fails.
echo [3/4] Building (onedir mode)...
echo.
pyinstaller --noconfirm --onedir --console --icon "%~dp0icon.ico" --workpath pybuild --distpath dist --specpath . --name "NeteaseMusicAPI" --add-data "%~dp0templates;templates" --hidden-import music_api --hidden-import cookie_manager --hidden-import music_downloader --hidden-import qr_login --hidden-import cryptography --hidden-import cryptography.hazmat.primitives --hidden-import cryptography.hazmat.primitives.ciphers --hidden-import cryptography.hazmat.primitives.padding --hidden-import cryptography.hazmat.backends --hidden-import cffi --hidden-import _cffi_backend --hidden-import mutagen --hidden-import mutagen.flac --hidden-import mutagen.mp3 --hidden-import mutagen.id3 --hidden-import mutagen.mp4 --hidden-import aiohttp --hidden-import aiofiles --hidden-import qrcode --hidden-import requests --hidden-import flask --collect-all cryptography --collect-all mutagen main.py

if errorlevel 1 (
    echo.
    echo [ERROR] Build failed! Check the error messages above.
    pause
    exit /b 1
)

:: Copy cookie.txt and create downloads dir
echo [4/4] Finalizing output...
if not exist "dist\NeteaseMusicAPI\cookie.txt" (
    copy cookie.txt dist\NeteaseMusicAPI\cookie.txt >nul 2>&1
)
if not exist "dist\NeteaseMusicAPI\downloads" mkdir "dist\NeteaseMusicAPI\downloads"

:: Clean up temp build dir and spec file
if exist "pybuild" rmdir /s /q pybuild
if exist "NeteaseMusicAPI.spec" del /q "NeteaseMusicAPI.spec"

echo.
echo ============================================
echo   Build SUCCESS!
echo ============================================
echo.
echo   Output  : dist\NeteaseMusicAPI\
echo   Run     : dist\NeteaseMusicAPI\NeteaseMusicAPI.exe
echo   URL     : http://localhost:5000
echo.
echo   Before use:
echo   1. Put your cookie.txt in dist\NeteaseMusicAPI\
echo   2. Double-click NeteaseMusicAPI.exe
echo   3. Open http://localhost:5000 in browser
echo.
echo ============================================
pause
