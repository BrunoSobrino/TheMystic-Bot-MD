#!/bin/bash
pacman -Syu --noconfirm
cd $HOME/mystic/ || echo Falla. Mystic no Existe.
npm install @whiskeysockets/baileys@latest --force || echo "#########Error al instalar en mystic"
#npm install --force
npm start .
