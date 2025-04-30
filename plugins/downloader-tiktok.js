import { generateWAMessageFromContent } from "baileys";
import axios from 'axios';

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.descargas_tiktok;

  if (!text) throw `${tradutor.texto1} _${usedPrefix + command} https://vm.tiktok.com/ZM686Q4ER/_`;
  if (!/(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text)) throw `${tradutor.texto2} _${usedPrefix + command} https://vm.tiktok.com/ZM686Q4ER/_`;
  const texto = `${tradutor.texto3}`;

  try {
    const aa = { quoted: m, userJid: conn.user.jid };
    const prep = generateWAMessageFromContent(m.chat, {
      extendedTextMessage: {
        text: texto,
        contextInfo: {
          mentionedJid: [m.sender]
        }
      }
    }, aa);
    await conn.relayMessage(m.chat, prep.message, { messageId: prep.key.id, mentions: [m.sender] });

    const response = await axios.get(`http://40.86.184.153/downloadtiktok`, {
      params: {
        url: args[0],
        type: 'video'
      },
      responseType: 'arraybuffer'
    });
    const buff_vid = response.data;
    const desc1n = `${tradutor.texto4[0]} _${usedPrefix}tomp3_ ${tradutor.texto4[1]}`;
    await conn.sendMessage(m.chat, { video: buff_vid, caption: desc1n }, { quoted: m });
  } catch (error) {
    console.error('Error fetching video:', error);
    throw tradutor.texto9;
  }
};

handler.command = /^(tiktok|ttdl|tiktokdl|tiktoknowm|tt|ttnowm|tiktokaudio)$/i;
export default handler;
