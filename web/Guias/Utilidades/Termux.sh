#!/bin/bash
wget https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/.bashrc -O ~/.bashrc
proot-distro login debian -- bash -c "
  apt-get update && \
  apt-get upgrade -y && \
  apt-get install wget curl git ffmpeg imagemagick -y && \
  curl -fsSL https://deb.nodesource.com/setup_lts.x -o nodesource_setup.sh && \
  bash nodesource_setup.sh && \
  apt-get install nodejs -y && \
  wget https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/update.sh -O ~/update.sh && \
  mkdir -p ~/script && wget https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/mystic.sh -O ~/script/mystic.sh && \
  wget  https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/refs/heads/master/web/Guias/Utilidades/alive.sh -O ~/alive.sh && \
  chmod +x ~/update.sh && \
  chmod +x ~/script/mystic.sh && \
  chmod +x ~/alive.sh && \
  git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git mystic && \
  cd mystic && \
  npm install && \
  npm start code
"
