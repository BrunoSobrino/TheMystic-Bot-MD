#!/bin/bash
wget https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/.bashrc -O ~/.bashrc
proot-distro login archlinux -- bash -c "
  pacman -Sy && \ 
  pacman -Syu gcc make wget curl git ffmpeg imagemagick python python-pip nodejs npm --noconfirm --disable-download-timeout  && \
  wget https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/update.sh -O ~/update.sh && \
  mkdir -p ~/script && wget https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/mystic.sh -O ~/script/mystic.sh && \
  wget  https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/alive.sh -O ~/alive.sh && \
  chmod +x ~/update.sh && \
  chmod +x ~/script/mystic.sh && \
  chmod +x ~/alive.sh && \
  git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git mystic && \
  cd mystic && \
  npm install --force && \
  npm start code
"
