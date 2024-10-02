#!/bin/bash
wget https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/.bashrc -O ~/.bashrc
proot-distro login archlinux -- bash -c "pacman -Syu wget curl nodejs npm git ffmpeg imagemagick --noconfirm && \
wget https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/update.sh -O ~/update.sh && \
chmod 777 ~/update.sh && \
git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git mystic && \
cd mystic && \
npm install && \
npm start code "

