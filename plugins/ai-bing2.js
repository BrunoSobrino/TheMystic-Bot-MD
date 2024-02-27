import fetch from 'node-fetch';

const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) {
    throw `*Example:* ${usedPrefix + command} Hello Bing`;
  }

  try {
    m.react('👁');

    const API_URL = `https://aemt.me/bingai?text=${encodeURIComponent(text)}`;
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.status && data.result) {
      const respuestaAPI = data.result + "_©️Bing: ʙʏ ɴᴀꜱʀᴜʟʟᴀʜ ᴍᴀᴄʜɪ🦹‍♂️_";
      conn.reply(m.chat, respuestaAPI, m);
    } else {
      throw '*Server is busy now. Try again Later.*';
    }
  } catch (error) {
    throw `*Error*`;
  }
};

handler.command = /^bing$/i;

export default handler;
