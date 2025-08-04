import {unlinkSync, readFileSync, existsSync} from 'fs';
import {join} from 'path';
import {exec} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);

const handler = async (m, {conn, args, __dirname, usedPrefix, command}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.audio_efectos;
  try {
    const q = m.quoted ? m.quoted : m;
    const mime = ((m.quoted ? m.quoted : m.msg).mimetype || '');
    let set;
    if (/bass/.test(command)) set = '-af equalizer=f=94:width_type=o:width=2:g=30';
    if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log';
    if (/deep/.test(command)) set = '-af atempo=4/4,asetrate=44500*2/3';
    if (/earrape/.test(command)) set = '-af volume=12';
    if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"';
    if (/fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"';
    if (/nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25';
    if (/reverse/.test(command)) set = '-filter_complex "areverse"';
    if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
    if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"';
    if (/smooth/.test(command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
    if (/tupai|squirrel|chipmunk/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"';
    if (/echo/.test(command)) set = '-af aecho=0.8:0.9:1000:0.3';
    if (/chorus/.test(command)) set = '-af chorus=0.5:0.9:50|60|40:0.4|0.32|0.3:0.25|0.4|0.3:2|2.3|1.3';
    if (/flanger/.test(command)) set = '-af flanger';
    if (/vibrato/.test(command)) set = '-af vibrato=f=5:d=0.5';
    if (/tremolo/.test(command)) set = '-af tremolo=f=3:d=0.9';
    if (/phaser/.test(command)) set = '-af aphaser=in_gain=0.4';
    if (/compressor/.test(command)) set = '-af acompressor';
    if (/distortion/.test(command)) set = '-af overdrive=20:20';
    if (/underwater/.test(command)) set = '-af lowpass=f=300,highpass=f=50';
    if (/telephone/.test(command)) set = '-af lowpass=f=3000,highpass=f=300';
    if (/radio/.test(command)) set = '-af equalizer=f=3000:width_type=o:width=2:g=15,highpass=f=300';
    if (/cave/.test(command)) set = '-af aecho=0.8:0.88:60:0.4';
    if (/whisper/.test(command)) set = '-af volume=0.3,highpass=f=1000';
    if (/demon/.test(command)) set = '-af asetrate=22050,atempo=0.8,volume=2';
    if (/audio/.test(mime)) {
      const ran = getRandom('.mp3');
      const filename = join(__dirname, '../src/tmp/' + ran);
      let media;
      try {
        media = await q.download(true);
        if (!media) throw new Error('No se pudo descargar el archivo de audio');
        const command_ffmpeg = `ffmpeg -i "${media}" ${set} "${filename}"`;
        await execAsync(command_ffmpeg);
        if (!existsSync(filename)) throw new Error('El archivo procesado no se generó correctamente');
        const buff = await readFileSync(filename);
        if (!buff || buff.length === 0) throw new Error('El archivo procesado está vacío');
        await conn.sendMessage(m.chat, { audio: buff, mimetype: 'audio/mpeg', fileName: ran, ptt: false }, {quoted: m});
      } catch (error) {
        console.error('Error en el procesamiento:', error);
        throw `_*Error al procesar el audio:*_ ${error.message}`;
      } finally {
        try {
          if (media && existsSync(media)) {
            await unlinkSync(media);
          }
          if (existsSync(filename)) {
            await unlinkSync(filename);
          }
        } catch (cleanupError) {
          console.error('Error al limpiar archivos temporales:', cleanupError);
        }
      }
    } else {
      throw `${tradutor.texto1} ${usedPrefix + command}*`;
    }
  } catch (e) {
    console.error('Error general:', e);
    throw e;
  }
};

handler.help = ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'smooth', 'tupai', 'echo', 'chorus', 'flanger', 'vibrato', 'tremolo', 'phaser', 'compressor', 'distortion', 'underwater', 'telephone', 'radio', 'cave', 'whisper', 'demon'];
handler.tags = ['effects'];
handler.command = /^(bass|blown|deep|earrape|fas?t|nightcore|reverse|robot|slow|smooth|tupai|squirrel|chipmunk|echo|chorus|flanger|vibrato|tremolo|phaser|compressor|distortion|underwater|telephone|radio|cave|whisper|demon)$/i;
export default handler;

const getRandom = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
};
