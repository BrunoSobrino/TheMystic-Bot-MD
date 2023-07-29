import {unlinkSync, readFileSync} from 'fs';
import {join} from 'path';
import {exec} from 'child_process';

const handler = async (m, {conn, args, __dirname, usedPrefix, command}) => {
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
    if (/audio/.test(mime)) {
      const ran = getRandom('.mp3');
      const filename = join(__dirname, '../tmp/' + ran);
      const media = await q.download(true);
      exec(`ffmpeg -i ${media} ${set} ${filename}`, async (err, stderr, stdout) => {
        await unlinkSync(media);
        if (err) throw `_*Error!*_`;
        const buff = await readFileSync(filename);
        conn.sendFile(m.chat, buff, ran, null, m, true, {
          type: 'audioMessage',
          ptt: true,
        });
      });
    } else throw `*[❗𝐈𝐍𝐅𝐎❗] 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰𝙻 𝙰𝚄𝙳𝙸𝙾 𝙾 𝙽𝙾𝚃𝙰 𝙳𝙴 𝚅𝙾𝚉 𝙴𝙻 𝙲𝚄𝙰𝙻 𝚂𝙴𝚁𝙰 𝙼𝙾𝙳𝙸𝙵𝙸𝙲𝙰𝙳𝙾, 𝚄𝚂𝙰𝙳𝙾 𝙴𝙻 𝙲𝙾𝙰𝙼𝙰𝙽𝙳𝙾 ${usedPrefix + command}*`;
  } catch (e) {
    throw e;
  }
};
handler.help = ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'smooth', 'tupai'].map((v) => v + ' [vn]');
handler.tags = ['audio'];
handler.command = /^(bass|blown|deep|earrape|fas?t|nightcore|reverse|robot|slow|smooth|tupai|squirrel|chipmunk)$/i;
export default handler;

const getRandom = (ext) => {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
};
