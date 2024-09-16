![image](https://github.com/weskerty/TheMysticMOD/assets/82781997/31d8455c-9c0f-49bc-b638-322bd68e2bce)

## ⬇️ Descargargas Necesarias
Se requiere estos programas para poder ejecutar.

[NodeJS](https://nodejs.org/en/)
Descargar e Iniciar. Marcar las casillas para instalar Complementos Adicionales como Choco y Agregar a PATH

[Python](https://www.python.org/downloads/)
Descargar e Iniciar. Marcar las casillas para Agregar a PATH
Luego de la Instalacion mover [este archivo](RecursosWindows/python3.bat) a la Carpeta de Instalacion de Python "Disco local > Python3.xx"
Esto debido a que la mayoria de Plugins estan adaptados para Linux, sin esto los scripts que usan Python3 fallaran.

[Git](https://git-scm.com/downloads)
Descargar e Iniciar. Marcar las casillas para Agregar a PATH

[Make](https://gnuwin32.sourceforge.net/downlinks/make.php)
Util para usar Make en algunos Plugins

## 🐧 Ahora puedes Instalar el Bot normalmente casi con los mismos pasos que Linux

Abrimos CMD o PowerShell y Pegamos

```sh
choco install ffmpeg-full
```
(si este comando falla es por que no instalaste los complementos adicionales al instalar nodejs o agregaste a path. Busca Install Choco en menu Inicio y ejecutalo.)

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
![image](https://github.com/weskerty/TheMysticMOD/assets/82781997/90f6616d-ccf5-46a4-b498-bff5af8b41f4)

El bot Iniciara y te Pedira Login.

## 🔌 Mantener Abierto CMD
El bot funcionara mientras la consola este abierta y con Conexion a Internet.
> [!IMPORTANT]
> Windows tiene una limitacion en que detiene la ejecucion cuando se pierde el foco de la ventana, podemos resolverlo agregando una tarea de inicio automatico.

## 🔁 Agregar a Tarea de inicio Automatico.

Descarga [este archivo](RecursosWindows/mystic.xml)
Luego Busca Programador de Tareas en el Menu Inicio y Abrelo 
![image](https://github.com/weskerty/TheMysticMOD/assets/82781997/19b105f5-7d00-444b-9e03-ba6bbd52fe93)

Seleccionas Importar Tarea y Aceptar. Puede que pregunte la contraseña del Administrador ya que se debe iniciar antes de que inicie un Usuario.
Ahora si reiniciar la PC el bot se ejecutara automaticamente al iniciar Windows. Para detener el comportamiento ir a Programador de Tareas, Buscar Mystic y Deshabilitarlo para que no vuelva a Iniciar o Finalizarlo para detener la ejecucion actual.
