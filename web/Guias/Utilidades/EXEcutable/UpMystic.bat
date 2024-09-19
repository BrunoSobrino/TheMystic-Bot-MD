@echo off
setlocal

echo ######### Verificando...

IF NOT EXIST "%USERPROFILE%\mystic" (
    echo ######### Instalando...

    powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [System.Net.ServicePointManager]::Expect100Continue = $false; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1')) } -NoNewWindow -Wait"

    :: Dependencias en Choco, se puede agregar más.
    choco install python nodejs ffmpeg-full git ImageMagick -y

    git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git "%USERPROFILE%\mystic"
    cd "%USERPROFILE%\mystic"
    npm install
    npm start
    exit /b
)

echo ######### Verificando Actualizaciones...

cd "%USERPROFILE%\mystic" || (
    echo ######### Error, No Existe Mystic
    exit /b
)

git pull https://github.com/BrunoSobrino/TheMystic-Bot-MD.git > git_output.txt

findstr "Already up to date" git_output.txt >nul
if %errorlevel% equ 0 (
    echo Actualizado.
) else (
    echo Actualizando...
    npm install --force || (
        echo ######### Error en NPM. Ejecutando Igualmente.
    )
)

npm start || (
    echo ######### Error al Iniciar. Contacta a los Grupos de Soporte.
)

del git_output.txt
endlocal
