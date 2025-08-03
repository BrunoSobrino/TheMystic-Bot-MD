import uploadImage from '../src/libraries/uploadImage.js';
import fetch from 'node-fetch';
import FormData from 'form-data';

const handler = async (m, {conn, text, args, usedPrefix, command}) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.convertidor_toanime;

  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';
  
  if (!/image/g.test(mime)) throw `*${tradutor.texto1}*`;
  
  m.reply(`*${tradutor.texto2}*`);
  const data = await q.download?.();
  
  try {
    const imageUrl = await uploadImage(data);
    
    const formData = new FormData();
    formData.append('url', imageUrl);
    formData.append('style', 'face2paint'); 
    
    const options = {
      method: 'POST',
      headers: {
        'X-RapidAPI-Key': 'a9cd57bfb2msh6b049d004bf6e44p1dd089jsn737528d11dcd',
        'X-RapidAPI-Host': 'phototoanime1.p.rapidapi.com',
        ...formData.getHeaders()
      },
      body: formData
    };
    
    const response = await fetch('https://phototoanime1.p.rapidapi.com/photo-to-anime', options);
    const json = await response.json();
    
    if (!response.ok) throw new Error(json.message || 'Error al convertir la imagen');
    
    await conn.sendFile(m.chat, json.body.imageUrl, 'anime.jpg', null, m);
    
  } catch (error) {
    console.error(error);
    throw `*${tradutor.texto3}*`;
  }
};

handler.help = ['toanime'];
handler.tags = ['converter'];
handler.command = ['jadianime', 'toanime'];
export default handler;
