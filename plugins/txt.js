// UTILIZA MUCHOS RECURSOS, AJUSTES DE PRIORIDAD DE PROCESO EN /plugins/transcribe.py para Evitar que el plugin acapare todo el rendimiento. Si tienes una grafica Nvidia puede usar los nucleos CUDA, en Windows se instala con: python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118 y en Linux debes tener los paquetes Privativos de NvidiaDriver y CUDA


import fs from 'fs';
import { exec } from 'child_process';

let activeDownloads = 0;
const maxDownloads = 1; // Máximo operaciones.(aumentar esto no funcionara ya que el archivo de audio se guarda con un solo nombre, agregue esto para que no se sature el sistema ni se bugee usando el mismo audio.)
const queue = [];

const processQueue = () => {
  if (queue.length === 0 || activeDownloads >= maxDownloads) return;

  const { m, resolve, reject } = queue.shift();
  activeDownloads++;

  handleTranscription(m)
    .then(resolve)
    .catch(reject)
    .finally(() => {
      activeDownloads--;
      processQueue();
    });
};

const handleTranscription = async (m) => {
  if (!m.quoted || !m.quoted.download) return;

  let media = await m.quoted.download();
  const path = `tmp/audio.ogg`;
  await fs.writeFileSync(path, media);
  await m.reply(`⏳ Transcribiendo`);

  // Ejecuta script Python mystic/plugins/transcribe.py
  return new Promise((resolve, reject) => {
    exec(`python3 plugins/transcribe.py ${path}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌Error ejecutando el script: ${error.message}`);
        m.reply(`❌Error ejecutando el script: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        console.error(`❌Error en el script de Python: ${stderr}`);
        m.reply(`❌Error en el script de Python: ${stderr}`);
        reject(new Error(stderr));
        return;
      }

      // Envía el resultado del script de Python a wasap
      m.reply(`🗣️ ${stdout.trim()}`);

      // Elimina el archivo de audio (para que no se llene de audios)
      fs.unlink(path, (err) => {
        if (err) {
          console.error(`Error eliminando el archivo: ${err.message}`);
        }
        resolve();
      });
    });
  });
};

let handler = (m) => {
  return new Promise((resolve, reject) => {
    queue.push({ m, resolve, reject });
    if (activeDownloads < maxDownloads) {
      processQueue();
    }
  });
};

// Esto lo agrege pensando que puede aparecer en el menu, no estoy seguro si funcione, no lo probe.
handler.help = ['transcripcion'];
handler.tags = ['tools'];
handler.command = /^(txt)$/i;
handler.owner = false; //Si esta funcion esta en .true solo solo los global.owner de /config.js pueden usarlo. 

export default handler;
