![image](https://github.com/weskerty/TheMysticMOD/assets/82781997/7160fd2b-1bdf-4e4a-b907-9b1868a0b440)

## <a href="https://www.debian.org/index.es.html"><img src="https://github.com/weskerty/TheMysticMOD/assets/82781997/17826d71-3d7f-4416-b27e-43ea48b27cdf" width="30" height="30" alt="Debian"/> </a> Linux Debian y Derivados (APT)
Abre la Terminal y pega cada linea.

```sh
sudo apt install git wget ffmpeg imagemagick -y
```

```sh
curl -fsSL https://deb.nodesource.com/setup_22.x -o nodesource_setup.sh
sudo -E bash nodesource_setup.sh
sudo apt-get install -y nodejs
```

## <a href="https://archlinux.org/"><img src="https://github.com/weskerty/TheMysticMOD/assets/82781997/3802b31d-230b-41df-b60c-450f12d4d7f7" width="30" height="30" alt="Debian"/> </a> Arch 
```sh
sudo pacman -Syu git wget ffmpeg imagemagick -y
```

## ⬇️ Instalar el Bot

```sh
git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git mystic
cd mystic
npm install
```

## ⚙️ Preferencias del Bot
Debes ajustar el `config.js` para agregar el numero del bot, tus administradores del bot, el pais de la fecha y clima y el nombre del paquete de stickers etc.

## 🟢 Iniciar Bot
Una vez que hayas ajustado todo, inicia el bot con:
```sh
npm start .
```
![Captura de pantalla_20240710_092057](https://github.com/weskerty/TheMysticMOD/assets/82781997/025b927b-fa26-4a08-8539-051408f8d13c)


## 🔌 Mantener Abierto la Terminal.
El bot funcionara mientras este abierto el shell y con Conexion a Internet.
Puedes ajustar para que se inicie automaticamente al encender Linux (varia por distro)
KDE Plasma ir a AutoInicio y agregar el Script cd mystic && npm start 
LXDE ir a Menu > System > AutoRun y agregar el Script cd mystic && npm start 

## ↪️ Volver a iniciar en caso de Cierre
	
    ```sh
    cd mystic
	npm start 
    ```
