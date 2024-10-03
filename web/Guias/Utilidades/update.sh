#!/bin/bash
apt update -y && apt upgrade -y
cd $HOME/mystic/ || echo Falla. Mystic no Existe.
npm install @whiskeysockets/baileys@latest --force || echo "#########Error al Actualizar Baileys. Continuando Igualmente"
npm start .
