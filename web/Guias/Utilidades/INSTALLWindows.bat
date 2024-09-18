@echo off
@powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [System.Net.ServicePointManager]::Expect100Continue = $false; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1')) } -NoNewWindow -Wait"
bitsadmin /transfer IniciadorMystic /download /priority high /DYNAMIC https://raw.githubusercontent.com/weskerty/test/main/Windows/UpdateAndStart.bat C:\IniciarMystic.bat
:: Instalar Dependencias, Se pueden agregar mas que esten en Chocolatey
choco install python nodejs pm2 ffmpeg-full git -y

::Mystic
git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git mystic
cd mystic
npm install
npm start .
