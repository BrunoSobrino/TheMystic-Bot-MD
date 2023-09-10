import fs from 'fs';
import acrcloud from 'acrcloud';
const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu',
});

const handler = async (m) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (/audio|video/.test(mime)) {
    if ((q.msg || q).seconds > 20) return m.reply('[❗𝐈𝐍𝐅𝐎❗]\n\nEl archivo que carga es demasiado grande, le sugerimos que corte el archivo grande a un archivo más pequeño, 10-20 segundos Los datos de audio son suficientes para identificar');
    const media = await q.download();
    const ext = mime.split('/')[1];
    fs.writeFileSync(`./tmp/${m.sender}.${ext}`, media);
    const res = await acr.identify(fs.readFileSync(`./tmp/${m.sender}.${ext}`));
    const {code, msg} = res.status;
    if (code !== 0) throw msg;
    const {title, artists, album, genres, release_date} = res.metadata.music[0];
    const txt = `
𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 𝙳𝙴 𝙻𝙰 𝙱𝚄𝚂𝚀𝚄𝙴𝙳𝙰

• 📌 𝚃𝙸𝚃𝚄𝙻𝙾: ${title}
• 👨‍🎤 𝙰𝚁𝚃𝙸𝚂𝚃𝙰: ${artists !== undefined ? artists.map((v) => v.name).join(', ') : 'No encontrado'}
• 💾 𝙰𝙻𝙱𝚄𝙼: ${album.name || 'No encontrado'}
• 🌐 𝙶𝙴𝙽𝙴𝚁𝙾: ${genres !== undefined ? genres.map((v) => v.name).join(', ') : 'No encontrado'}
• 📆 𝙵𝙴𝙲𝙷𝙰 𝙳𝙴 𝙻𝙰𝙽𝚉𝙰𝙼𝙸𝙴𝙽𝚃𝙾: ${release_date || 'No encontrado'}
`.trim();
    fs.unlinkSync(`./tmp/${m.sender}.${ext}`);
    m.reply(txt);
  } else throw '*[❗𝐈𝐍𝐅𝐎❗] 𝚁𝙴𝚂𝙿𝙾𝙽𝙳𝙰 𝙰 𝚄𝙽 𝙰𝚄𝙳𝙸𝙾*';
};
handler.command = /^quemusica|quemusicaes|whatmusic$/i;
export default handler;
