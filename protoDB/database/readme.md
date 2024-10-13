### Database Proto - The Mystic Bot MD

Instalación
Primero, instala protobufjs globalmente ejecutando el siguiente comando:
npm install -g protobufjs


Para generar el archivo js a partir del archivo db.proto, usa el siguiente comando:
pbjs -t static-module -w commonjs -o index.js db.proto

Este comando creará un archivo llamado index.js el cual contendra los datos de la db



La base de datos generada con db.proto está diseñada específicamente para The Mystic Bot MD, optimizando la database
