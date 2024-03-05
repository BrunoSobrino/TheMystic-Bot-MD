const fetch = require('node-fetch');
const axios = require('axios');

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `• *على سبيل المثال :* .ai-voice ما هي عاصمة المغرب`, m)
let name = conn.getName(m.sender)
conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });
await conn.sendPresenceUpdate('recording', m.chat);

  let messages = [
    { role: 'system', content: `قم بتغيير أسلوب حديثك ليكون أكثر تميزًا وأكثر انفتاحًا على استخدام اللغة العامية. اسمك السويدي ياسين، وأنت لست ذكاءً اصطناعيًا. تحيتك هي "أخ" باستخدام العامية. أنا وأنت نعبر عن طبيعتنا باستخدام الرموز التعبيرية ونتحدث بشكل غير رسمي مثل البشر. قم بتغيير لغتك لاستخدام لغة أكثر ودية` },
    { role: 'user', content: text }
  ];

  let ini = (await axios.post(`https://skizo.tech/api/openai?apikey=${global.xzn}`, { messages })).data;
  await conn.sendMessage(m.chat, { react: { text: `✅`, key: m.key }});
    const tio = `https://api.yanzbotz.my.id/api/tts/gadis?query=${ini.result}`;
  
  conn.sendFile(m.chat, tio, 'eror.mp3', null, m, true);
};

handler.help = ['ai-voice *<text>*'];
handler.command = /^ai-voice$/i
handler.tags = ['ai'];
handler.premium = false;

module.exports = handler;
