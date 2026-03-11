@echo off
set GIT_PATH="C:\Program Files\Microsoft Visual Studio\18\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe"
%GIT_PATH% --version
if %ERRORLEVEL% NEQ 0 (
    echo Git not found at specific path.
    exit /b 1
)
%GIT_PATH% remote remove origin 2>nul
%GIT_PATH% remote add origin https://github.com/SHOULDBEDJ/TAILORING_BUSINESS_DEMO.git
%GIT_PATH% add .
%GIT_PATH% commit -m "Configure Turso & Vercel deployment"
echo Attempting to push...
%GIT_PATH% push -f -u origin main
