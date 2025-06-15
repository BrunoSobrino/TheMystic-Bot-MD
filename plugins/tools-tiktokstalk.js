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
 const body = `${tradutor.texto2[0]} ${user.username || '-'}\n${tradutor.texto2[1]} ${user.nickname || '-'}\n${tradutor.texto2[2]} ${stats.followerCount || '-'}\n${tradutor.texto2[3]} ${stats.followingCount || '-'}\n${tradutor.texto2[4]} ${stats.likeCount || '-'}\n${tradutor.texto2[5]} ${stats.videoCount || '-'}\n${tradutor.texto2[6]} ${user.signature || '-'}`.trim();
 const imageUrl = user.avatarLarger;
 const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
 const imageBuffer = Buffer.from(imageResponse.data, "binary");

 await conn.sendFile(m.chat, imageBuffer, 'profile.jpg', body, m);
 } else {
 throw tradutor.texto3; 
  }
 } catch (e) {
 throw tradutor.texto3;  
 }
};

handler.help = ['tiktokstalk'];
handler.tags = ['tools'];
handler.command = ['ttstalk', 'tiktokstalk'];

export default handler;
