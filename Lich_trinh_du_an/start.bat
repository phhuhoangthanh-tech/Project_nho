@echo off
setlocal
cd /d "%~dp0"
title Lich trinh cho ban

where node >nul 2>nul
if not errorlevel 1 goto use_node

where py >nul 2>nul
if not errorlevel 1 goto use_py

where python >nul 2>nul
if not errorlevel 1 goto use_python

echo.
echo  Khong tim thay Node.js hoac Python.
echo  Hay cai Node.js tai https://nodejs.org, sau do chay lai start.bat.
echo.
pause
exit /b 1

:use_node
echo.
echo  Dang khoi dong bang Node.js...
echo.
node server.js
if errorlevel 1 pause
exit /b 0

:use_py
start "Lich trinh cho ban" /min cmd /c "timeout /t 2 >nul & start http://localhost:8080"
echo.
echo  Dang khoi dong bang Python tai http://localhost:8080
echo  Giu cua so nay mo. Nhan Ctrl + C de dung.
echo.
py -3 -m http.server 8080 --bind 127.0.0.1
exit /b 0

:use_python
start "Lich trinh cho ban" /min cmd /c "timeout /t 2 >nul & start http://localhost:8080"
echo.
echo  Dang khoi dong bang Python tai http://localhost:8080
echo  Giu cua so nay mo. Nhan Ctrl + C de dung.
echo.
python -m http.server 8080 --bind 127.0.0.1
exit /b 0
