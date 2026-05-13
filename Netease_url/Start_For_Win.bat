@echo off
setlocal enabledelayedexpansion
title Python & Requirements Check & Main Launcher

echo Checking Python installation...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Python is not installed. Opening download page...
    start https://www.python.org/ftp/python/
    echo [INFO] Please download and install Python, then run this script again.
    goto end
)

echo [INFO] Python is installed.

rem Clear input variables
set "INSTALL_DEPS="
set "RUN_MAIN="

rem Check for requirements.txt
if exist requirements.txt (
    set /p "INSTALL_DEPS=requirements.txt found. Install dependencies? (y/n): "
    if /i "!INSTALL_DEPS!"=="y" (
        echo [INFO] Installing dependencies...
        python -m pip install -r requirements.txt
        if errorlevel 1 (
            echo [ERROR] Dependency installation failed. Please check the output above.
        ) else (
            echo [INFO] Dependencies installed successfully.
        )
    ) else (
        echo [INFO] Skipped dependency installation.
    )
) else (
    echo [INFO] requirements.txt not found in current directory. Nothing to install.
)

rem Check for main.py
if exist main.py (
    set /p "RUN_MAIN=main.py found. Launch it? (y/n): "
    if /i "!RUN_MAIN!"=="y" (
        echo [INFO] Launching main.py...
        python main.py
    ) else (
        echo [INFO] Skipped launching main.py.
    )
) else (
    echo [INFO] main.py not found in current directory.
)

:end
pause
endlocal