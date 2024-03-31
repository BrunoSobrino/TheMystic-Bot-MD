import uploadImage from '../lib/uploadImage.js';

const handler = async (m, {conn, text, args, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.convertidor_toanime
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || '';
  if (!/image/g.test(mime)) throw `*${tradutor.texto1}*`;
  m.reply(`*${tradutor.texto2}*`);
  const data = await q.download?.();
  const image = await uploadImage(data);
  try {
    const img = await conn.getFile(image);  
    const tuanime = await jadianime(img.data);
    await conn.sendFile(m.chat, 'https://www.drawever.com' + tuanime.urls[1] ? tuanime.urls[1] : tuanime.urls[0], 'error.jpg', null, m);
  } catch {
  try {
    const anime = `https://api.lolhuman.xyz/api/imagetoanime?apikey=${lolkeysapi}&img=${image}`;
    await conn.sendFile(m.chat, anime, 'error.jpg', null, m);
  } catch (i) {
    try {
      const anime2 = `https://api.zahwazein.xyz/photoeditor/jadianime?url=${image}&apikey=${keysxxx}`;
      await conn.sendFile(m.chat, anime2, 'error.jpg', null, m);
    } catch (a) {
      try {
        const anime3 = `https://api.caliph.biz.id/api/animeai?img=${image}&apikey=caliphkey`;
        await conn.sendFile(m.chat, anime3, 'error.jpg', null, m);
      } catch (e) {
        throw `*${tradutor.texto3}*`;
      }
     }
    }
  }
};
handler.help = ['toanime'];
handler.tags = ['tools'];
handler.command = /^(jadianime|toanime)$/i;
export default handler;

async function jadianime(image) {
	return new Promise(async(resolve, reject) => {
        axios("https://www.drawever.com/api/photo-to-anime", {
            headers: {
                "content-type": "application/json"
            },
            "data": { "data": "data:image/jpeg;base64," + image.toString('base64') },
            "method": "POST"
        }).then(res => { 
            let yanz = res.data
            resolve(yanz)
        })})
}

/*async function tozombie(input) {
  const image = await Jimp.read(input);
  const buffer = await new Promise((resolve, reject) => {
    image.getBuffer(Jimp.MIME_JPEG, (err, buf) => {
      if (err) {
        reject('Terjadi Error Saat Mengambil Data......');
      } else {
        resolve(buf);
      }
    });
  });
  const form = new FormData();
  form.append('image', buffer, { filename: 'toanime.jpg' });
  try {
    const { data } = await axios.post(`https://tools.betabotz.eu.org/ai/tozombie`, form, {
      headers: {
        ...form.getHeaders(),
        'accept': 'application/json',
      },
    });
    var res = {
      image_data: data.result,
      image_size: data.size
    };
    return res;
  } catch (error) {
    console.error('Identifikasi Gagal:', error);
    return 'Identifikasi Gagal';
  }
}*/
