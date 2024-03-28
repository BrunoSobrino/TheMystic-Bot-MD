import fs from 'fs';
import acrcloud from 'acrcloud';


const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu',
});

const handler = async (m) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_whatmusic

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (/audio|video/.test(mime)) {
    if ((q.msg || q).seconds > 20) return m.reply(tradutor.texto1);
    const media = await q.download();
    const ext = mime.split('/')[1];
    fs.writeFileSync(`./tmp/${m.sender}.${ext}`, media);
    const res = await acr.identify(fs.readFileSync(`./tmp/${m.sender}.${ext}`));
    const {code, msg} = res.status;
    if (code !== 0) throw msg;
    const {title, artists, album, genres, release_date} = res.metadata.music[0];
    const txt = `
${tradutor.texto3[0]}

${tradutor.texto3[1]} ${title}
${tradutor.texto3[2]} ${artists !== undefined ? artists.map((v) => v.name).join(', ') : tradutor.texto2}
${tradutor.texto3[3]} ${album.name || tradutor.texto2}
${tradutor.texto3[4]} ${genres !== undefined ? genres.map((v) => v.name).join(', ') : tradutor.texto2}
${tradutor.texto3[5]} ${release_date || tradutor.texto2}
`.trim();
    fs.unlinkSync(`./tmp/${m.sender}.${ext}`);
    m.reply(txt);
  } else throw tradutor.texto4;
};
handler.command = /^quemusica|quemusicaes|whatmusic$/i;
export default handler;
