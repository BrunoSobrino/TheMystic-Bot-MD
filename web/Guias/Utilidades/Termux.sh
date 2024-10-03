#!/bin/bash
proot-distro install debian
wget https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/.bashrc -O ~/.bashrc
proot-distro login debian -- bash -c "
  apt-get update && \
  apt-get install wget curl git ffmpeg imagemagick -y && \
  curl -fsSL https://deb.nodesource.com/setup_lts.x -o nodesource_setup.sh && \
  bash nodesource_setup.sh && \
  apt-get install -y nodejs && \
  wget https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/update.sh -O ~/update.sh && \
  chmod +x ~/update.sh && \
  git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git mystic && \
  cd mystic && \
  npm install && \
  npm start code
"
