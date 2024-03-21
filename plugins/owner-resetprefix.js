import _translate from "./_translate.js"
const tradutor = _translate.plugins.owner_resetprefix
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {conn}) => {
  global.prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
  await m.reply(tradutor.texto1);
  // conn.fakeReply(m.chat, '[❗𝐈𝐍𝐅𝐎❗] 𝙿𝚁𝙴𝙵𝙸𝙹𝙾 𝚁𝙴𝚂𝚃𝙰𝙱𝙻𝙴𝙲𝙸𝙳𝙾 𝙲𝙾𝙽 𝙴𝚇𝙸𝚃𝙾', '0@s.whatsapp.net', 'Reset Prefix')
};
handler.help = ['resetprefix'];
handler.tags = ['owner'];
handler.command = /^(resetprefix)$/i;
handler.rowner = true;


export default handler;
