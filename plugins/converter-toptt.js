import fs from 'fs';
import { promises as fsPromises } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const handler = async (m, { conn, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.convertidor_toptt;

  const q = m.quoted ? m.quoted : m;
  const mime = (q || q.msg).mimetype || q.mediaType || '';

  if (!/video|audio/.test(mime)) throw `*${tradutor.texto1}*`;

  const media = await q.download?.();
  if (!media) throw `*${tradutor.texto2}*`;

  try {
    // Archivos temporales directos en la raíz para evitar problemas de rutas
    const tmpInput = `./in_${Date.now()}.mp4`;
    const tmpOutput = `./out_${Date.now()}.ogg`;

    // 1. Guardamos el buffer que descargó el bot
    await fsPromises.writeFile(tmpInput, media);

    // 2. Usamos FFmpeg puro para crear la nota de voz Opus
    await execPromise(`ffmpeg -y -i ${tmpInput} -vn -c:a libopus -b:a 128k -ar 48000 ${tmpOutput}`);

    // 3. Leemos el archivo final
    const audioBuffer = await fsPromises.readFile(tmpOutput);

    // 4. Seguro: si Termux falló y creó un archivo vacío, lo detenemos aquí
    if (audioBuffer.length === 0) throw new Error('FFmpeg generó un archivo de 0 bytes.');

    // 5. Enviamos a WhatsApp
    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }, { quoted: m });

    // 6. Limpiamos los archivos temporales
    await fsPromises.unlink(tmpInput).catch(() => {});
    await fsPromises.unlink(tmpOutput).catch(() => {});

  } catch (e) {
    // Aquí veremos el error real en tu consola
    console.error("❌ Error de FFmpeg en toptt:", e);
    await m.reply(`*Ocurrió un error interno al convertir. Revisa la consola de Termux.*`);
  }
};

handler.help = ['tovn'];
handler.tags = ['converter'];
handler.command = ['tovn', 'toptt'];

export default handler;
