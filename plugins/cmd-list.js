

const handler = async (m, {conn}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.cmd_list

  conn.reply(m.chat, `
*${tradutor.texto1}*

${Object.entries(global.db.data.sticker).map(([key, value], index) => `*${index + 1}.-*\n*KODE:* ${value.locked ? `*(terkunci)* ${key}` : key}\n*PERINTAH/TEKS* ${value.text}`).join('\n\n')}
`.trim(), null, {mentions: Object.values(global.db.data.sticker).map((x) => x.mentionedJid).reduce((a, b) => [...a, ...b], [])});
};
handler.command = ['listcmd', 'cmdlist'];
handler.rowner = true;
export default handler;
