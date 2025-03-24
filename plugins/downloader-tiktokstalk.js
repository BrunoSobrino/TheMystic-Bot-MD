import axios from 'axios';
import fs from 'fs';

const handler = async (m, { conn, text }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.downloader_tiktokstalk;

  if (!text) return conn.reply(m.chat, tradutor.texto1, m);  

  try {
    const response = await axios.get("https://delirius-apiofc.vercel.app/tools/tiktokstalk", {
      params: { q: text }
    });

    const data = response.data;

    if (data.status && data.result) {
      const user = data.result.users;
      const stats = data.result.stats;

      const Mystic = `
${tradutor.texto2[0]} ${user.username || 'Sin Información'}   
${tradutor.texto2[1]} ${user.nickname || 'Sin Información'}   
${tradutor.texto2[2]} ${stats.followerCount || 'Sin Información'}    
${tradutor.texto2[3]} ${stats.followingCount || 'Sin Información'}   
${tradutor.texto2[4]} ${stats.likeCount || 'Sin Información'}    
${tradutor.texto2[5]} ${stats.videoCount || 'Sin Información'}
${tradutor.texto2[6]} ${user.signature || 'Sin Información'}   
`.trim();

      const imageUrl = user.avatarLarger;
      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(imageResponse.data, "binary");

      await conn.sendFile(m.chat, imageBuffer, 'profile.jpg', Mystic, m);
    } else {
      throw tradutor.texto3; 
    }
  } catch (e) {
    throw tradutor.texto3;  
  }
};

handler.help = ['tiktokstalk'].map((v) => v + ' <username>');
handler.tags = ['stalk'];
handler.command = /^(tiktokstalk|ttstalk)$/i;
export default handler;
