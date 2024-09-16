@echo off
@powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [System.Net.ServicePointManager]::Expect100Continue = $false; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1')) } -NoNewWindow -Wait"

:: Instalar Dependencias, Se pueden agregar mas que esten en Chocolatey
choco install python nodejs pm2 ffmpeg-full git -y

::Mystic
git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git mystic
cd mystic
npm install
start .

echo Listo, ahora configura config.js para agregar el numero del bot, admins y demas. Mas info en la Pagina. Para Ayuda ve a los Grupos de Ayuda.
echo Done, now configure config.js to add the bot number, admins, and more. For more info, check the page. For help, go to the Help Groups.
pause
