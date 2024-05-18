import { Shazam } from 'node-shazam';
import fetch from 'node-fetch';
const shazam = new Shazam();

const handler = async (m) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language;
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`));
  const traductor = _translate.plugins.herramientas_whatmusic;

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || '';
  if (/audio|video/.test(mime)) {
    //if ((q.msg || q).seconds > 20) return m.reply(traductor.texto1);
    const media = await q.download();
    const ext = mime.split('/')[1];
    fs.writeFileSync(`./tmp/${m.sender}.${ext}`, media);

    let recognise;
    if (/audio/.test(mime)) {
      recognise = await shazam.fromFilePath(`./tmp/${m.sender}.${ext}`, false, 'en');
    } else if (/video/.test(mime)) {
      recognise = await shazam.fromVideoFile(`./tmp/${m.sender}.${ext}`, false, 'en');
    }
      
    const { title, subtitle, artists, genres, images } = recognise.track;
    const imagen = await (await fetch(`${images.coverart}`)).buffer();    
    const texto = `${traductor.texto3[0]}\n\n${traductor.texto3[1]} ${title || traductor.texto2}\n${traductor.texto3[2]} ${subtitle || traductor.texto2}\n${traductor.texto3[4]} ${genres.primary || traductor.texto2}`;

    const apiTitle = `${title} - ${subtitle || ''}`;

    let url = 'https://github.com/BrunoSobrino'; 
    try {
      const response = await fetch(`${global.MyApiRestBaseUrl}/api/ytplay?text=${apiTitle}&apikey=${global.MyApiRestApikey}`);
      const data = await response.json();
      url = data.resultado.url;
    } catch (error) {
      console.error('Error al obtener la URL del video:', error);
    }
    
    const audiolink = `${global.MyApiRestBaseUrl}/api/v1/ytmp3?url=${url}&apikey=${global.MyApiRestApikey}`;  
    const audiobuff = await conn.getFile(audiolink)  

    await conn.sendMessage(m.chat, { text: texto.trim(), contextInfo: { forwardingScore: 9999999, isForwarded: true, "externalAdReply": { "showAdAttribution": true, "containsAutoReply": true, "renderLargerThumbnail": true, "title": apiTitle, "containsAutoReply": true, "mediaType": 1, "thumbnail": imagen, "thumbnailUrl": imagen, "mediaUrl": url, "sourceUrl": url } } }, { quoted: m });

    await conn.sendMessage(m.chat, { audio: audiobuff.data, fileName: `${title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m });

    fs.unlinkSync(`./tmp/${m.sender}.${ext}`);
  } else {
    throw traductor.texto4;
  }
};

handler.command = /^(quemusica|quemusicaes|whatmusic|shazam)$/i;
export default handler;
