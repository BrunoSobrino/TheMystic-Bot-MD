import fetch from 'node-fetch';

const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
const handler = async (m, {args, usedPrefix, command}) => {
  const idioma = global.db.data.users[m.sender].language || 'es';
  const _translate = global.translate[idioma];
  const tradutor = _translate.plugins.descargas_gitclone;

  if (!args[0]) throw `${tradutor.texto1} _${usedPrefix + command} https://github.com/BrunoSobrino/TheMystic-Bot-MD_`;
  if (!regex.test(args[0])) throw tradutor.texto2;
  let [_, user, repo] = args[0].match(regex) || [];
  repo = repo.replace(/.git$/, '');
  const url = `https://api.github.com/repos/${user}/${repo}/zipball`;
  const filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1];
  m.reply(tradutor.texto3);
  conn.sendFile(m.chat, url, filename, null, m);
};
handler.command = /^(gitclone)$/i;
export default handler;
