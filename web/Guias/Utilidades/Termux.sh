#!/bin/bash
wget https://raw.githubusercontent.com/weskerty/test/main/Termux/.bashrc -O ~/.bashrc
proot-distro login archlinux -- bash -c "pacman -Syu wget curl nodejs nano npm git ffmpeg python --noconfirm && \
wget https://raw.githubusercontent.com/weskerty/test/main/Termux/update.sh -O ~/update.sh && \
chmod 777 ~/update.sh && \
git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git mystic && \
cd mystic && \
npm install && \
npm start ."

