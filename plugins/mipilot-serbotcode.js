import fs from 'fs';


async function handler(m, {usedPrefix}) {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.mipilot_serbotcode;

  const user = m.sender.split('@')[0];
  if (fs.existsSync('./jadibts/' + user + '/creds.json')) {
    const token = Buffer.from(fs.readFileSync('./jadibts/' + user + '/creds.json'), 'utf-8').toString('base64');
    await m.reply(tradutor.texto1);
    await m.reply(token);
  } else {
    await m.reply(`${tradutor.texto2[0]} ${usedPrefix}jadibot ${tradutor.texto2[1]}`);
  }
}
handler.command = handler.help = ['token', 'gettoken', 'serbottoken'];
handler.tags = ['jadibot'];
handler.private = true;
export default handler;

