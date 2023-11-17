import fetch from 'node-fetch';
const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
const handler = async (m, {args, usedPrefix, command}) => {
  if (!args[0]) throw `*[ ℹ️ ] Ingrese un enlace de GitHub.*\n\n*[ ℹ️ ] Ejemplo:* _${usedPrefix + command} https://github.com/BrunoSobrino/TheMystic-Bot-MD _`;
  if (!regex.test(args[0])) throw '*[ ℹ️ ] El enlace que proporcionó es incorrecto.*';
  let [_, user, repo] = args[0].match(regex) || [];
  repo = repo.replace(/.git$/, '');
  const url = `https://api.github.com/repos/${user}/${repo}/zipball`;
  const filename = (await fetch(url, {method: 'HEAD'})).headers.get('content-disposition').match(/attachment; filename=(.*)/)[1];
  m.reply(`*[ ℹ️ ] Se está enviando el archivo. espere...*\n\n*[ ℹ️ ] Si no se envía, podría ser porque supera el límite de tamaño.*`);
  conn.sendFile(m.chat, url, filename, null, m);
};
handler.help = ['gitclone <url>'];
handler.tags = ['descargas'];
handler.command = /gitclone/i;
export default handler;
