@echo off
set GIT_PATH="C:\Program Files\Microsoft Visual Studio\18\Community\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe"
%GIT_PATH% add .
%GIT_PATH% commit -m "Optimize mobile responsiveness and PWA view for Order History and Dashboard"
%GIT_PATH% push origin main
