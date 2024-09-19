@echo off
setlocal

::Instalacion Generica con NPM, Se Puede Cambiar las Variables para ser utilizado por otro bot.

:: Aqui las Dependencias, deben estar en Choco.
set dependencias=python nodejs ffmpeg-full git ImageMagick -y --allow-downgrade --ignore-dependencies --force-dependencies
:: Aqui la Ubicacion de Instalacion 
set botpath=%USERPROFILE%\mystic
:: Aqui el Repo 
set repo=https://github.com/BrunoSobrino/TheMystic-Bot-MD.git
:: Aqui el Nombre del bot para ser mostrado en los Mensajes de estado.
set botname=Mystic



echo ######### Verificando...
choco -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ######### Instalando Recursos Necesarios. Esto Tomara Tiempo, Relajate :)

    powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [System.Net.ServicePointManager]::Expect100Continue = $false; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1')) } -NoNewWindow -Wait"
    
    if %errorlevel% neq 0 (
        echo ######### Error en la instalacion de Chocolatey. Verifica tu Internet o Contacta con Soporte.
        pause
        exit /b
    )
)

IF NOT EXIST "%botpath%" (
    echo ######### Instalando %botname%. Esto Tomara aun mas Tiempo, Relajate :)
    choco install %dependencias% >nul 2>&1
    
    if %errorlevel% neq 0 (
        echo ######### Error en la instalacion de dependencias. Contacta con Soporte.
        pause
        exit /b
    )

    git clone %repo% "%botpath%" >nul 2>&1
    if %errorlevel% neq 0 (
        echo ######### Error al clonar. Verifica tu Internet.
        pause
        exit /b
    )
    
    cd "%botpath%"
    npm install >nul 2>&1
	cd "%botpath%" && npm start 
	
)

echo ######### Verificando Actualizaciones...

choco upgrade all -y --allow-downgrade --ignore-dependencies --force-dependencies >nul 2>&1
choco install %dependencias% >nul 2>&1
if %errorlevel% neq 0 (
    echo ######### Error al actualizar dependencias. Continuando igualmente...
)

cd "%botpath%" || (
    echo ######### Error: No existe el directorio %botname% WTF.
    pause
    exit /b
)

git pull %repo% > git_output.txt 2>&1
if %errorlevel% neq 0 (
    echo ######### Error al intentar actualizar el repositorio.
    pause
    exit /b
)

findstr "Already up to date" git_output.txt >nul
if %errorlevel% equ 0 (
    echo ######### %botname% ya actualizado.
) else (
    echo ######### %botname% actualizado.
    npm install --force >nul 2>&1 || (
        echo ######### Error en npm. Continuando igualmente...
    )
)

npm start || (
    echo ######### Error al iniciar %botname%. Contacta con Soporte.
)

if exist git_output.txt del git_output.txt

pause
exit /b
