import FormData from "form-data";
import Jimp from "jimp";
import axios from "axios";

const handler = async (m, {conn, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.herramientas_hd

 try {    
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || "";
  if (!mime) throw `${tradutor.texto1} ${usedPrefix + command}*`;
  if (!/image\/(jpe?g|png)/.test(mime)) throw `${tradutor.texto2[0]} (${mime}) ${tradutor.texto2[1]}`;
  m.reply(tradutor.texto3);
  let img = await q.download?.();
  let pr = await ihancer(img, { method: 1, size: 'high' });
  conn.sendMessage(m.chat, {image: pr}, {quoted: m});
 } catch {
  throw tradutor.texto4;
 }
};
handler.help = ["remini", "hd", "enhance"];
handler.tags = ["ai", "tools"];
handler.command = ["remini", "hd", "enhance"];
export default handler;

async function ihancer(buffer, { method = 1, size = 'high' } = {}) {
  try {
    const _size = ['low', 'medium', 'high'];
    
    if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('Image buffer is required');
    if (method < 1 || method > 4) throw new Error('Available methods: 1, 2, 3, 4');
    if (!_size.includes(size)) throw new Error(`Available sizes: ${_size.join(', ')}`);
    
    const form = new FormData();
    form.append('method', method.toString());
    form.append('is_pro_version', 'false');
    form.append('is_enhancing_more', 'false');
    form.append('max_image_size', size);
    form.append('file', buffer, `enhance_${Date.now()}.jpg`);
    
    const { data } = await axios.post('https://ihancer.com/api/enhance', form, {
      headers: {
        ...form.getHeaders(),
        'accept-encoding': 'gzip',
        host: 'ihancer.com',
        'user-agent': 'Dart/3.5 (dart:io)'
      },
      responseType: 'arraybuffer'
    });
    
    return Buffer.from(data);
  } catch (error) {
    throw new Error(error.message);
  }
}
