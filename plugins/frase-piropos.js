/* By https://github.com/DIEGO-OFC/DORRAT-BOT-MD */
import _translate from "./_translate.js"
const tradutor = _translate.plugins.frase_piropos

const handler = async (m, {conn, text}) => {
  m.reply(`*╔═══════════════════════════*\n➢ *"${pickRandom(global.piropo)}"*\n*╚═══════════════════════════*`);
};
handler.tags = ['frases'];
handler.command = ['piropo'];
export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}

global.piropo = tradutor.texto1