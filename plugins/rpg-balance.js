import _translate from "./_translate.js"
const tradutor = _translate.plugins.rpg_balance
// Para configurar o idioma, na raiz do projeto altere o arquivo config.json
// Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
// To set the language, in the root of the project, modify the config.json file.

const handler = async (m, {usedPrefix}) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
  else who = m.sender;
  const name = conn.getName(who);
  m.reply(`
${tradutor.texto1[0]}
${tradutor.texto1[1]} ${name}
${tradutor.texto1[2]} ${global.db.data.users[who].limit}💎
${tradutor.texto1[3]}
${tradutor.texto1[4]} 
${tradutor.texto1[5]}
❏ *${usedPrefix}buy ${tradutor.texto1[6]}
❏ *${usedPrefix}buyall*`);
};
handler.help = ['bal'];
handler.tags = ['xp'];
handler.command = ['bal', 'diamantes', 'diamond', 'balance'];
export default handler;
