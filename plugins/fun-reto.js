import _translate from "./_translate.js"
const tradutor = _translate.plugins.fun_reto

const handler = async (m, {conn}) => {
  conn.reply(m.chat, `*┌────「 𝚁𝙴𝚃𝙾 」─*\n*“${pickRandom(global.bucin)}”*\n*└────「 𝙼𝚈𝚂𝚃𝙸𝙲 」─*`, m);
};
handler.help = ['reto'];
handler.tags = ['fun'];
handler.command = /^reto/i;
export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}

global.bucin = tradutor.texto1;
