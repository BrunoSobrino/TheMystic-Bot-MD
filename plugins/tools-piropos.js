/* By https://github.com/DIEGO-OFC/DORRAT-BOT-MD */

const handler = async (m, {conn, text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.frase_piropos
  
  global.piropo = tradutor.texto1

  m.reply(`*╔═══════════════════════════*\n➢ *"${pickRandom(global.piropo)}"*\n*╚═══════════════════════════*`);
};
handler.help = ['piropo'];
handler.tags = ['tools'];
handler.command = ['piropo'];
export default handler;

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())];
}
