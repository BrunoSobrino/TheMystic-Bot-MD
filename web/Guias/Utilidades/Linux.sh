#!/bin/bash
# Instalación automática de TheMystic-Bot-MD en Linux.
# Detecta la distro (Debian/Arch/Fedora) e instala las dependencias con su
# gestor de paquetes, luego clona el repositorio e inicia el bot.
# Uso: bash <(curl -fsSL https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/web/Guias/Utilidades/Linux.sh)
set -e

if command -v apt >/dev/null 2>&1; then
  echo "######### Debian o basado: instalando dependencias..."
  sudo apt install wget curl nodejs nano npm git ffmpeg python3 imagemagick -y
elif command -v pacman >/dev/null 2>&1; then
  echo "######### Arch o basado: instalando dependencias..."
  sudo pacman -Syu wget curl nodejs nano npm git ffmpeg python imagemagick --noconfirm
elif command -v dnf >/dev/null 2>&1; then
  echo "######### Fedora: instalando dependencias..."
  sudo dnf install -y wget curl nodejs nano npm git ffmpeg python3 imagemagick
else
  echo "######### Distro no reconocida. Instala manualmente: wget curl nodejs nano npm git ffmpeg python3 imagemagick"
  exit 1
fi

git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git mystic && cd mystic && npm install && npm start
