const handler = async (m, {text}) => {
 const datas = global
 const idioma = datas.db.data.users[await m.sender].language || global.defaultLenguaje
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
 const tradutor = _translate.plugins.afk_afk

 const user = global.db.data.users[await m.sender];
 user.afk = + new Date;
 user.afkReason = text;
 m.reply(`${tradutor.texto1[0]} ${conn.getName(await m.sender)} ${tradutor.texto1[1]} ${text ? ': ' + text : ''}*
`);
};
handler.help = ['afk'];
handler.tags = ['xp'];
handler.command = ['afk']

export default handler;
