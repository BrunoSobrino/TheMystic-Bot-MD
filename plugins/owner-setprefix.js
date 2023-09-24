const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*[❗] No se encontro ningun prefijo, por favor ingrese el prefijo que quiera establecer. Ejemplo:* ${usedPrefix + command} /`;
  global.prefix = new RegExp('^[' + (text || global.opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
  await m.reply(`*[❗] El prefijo actual del Bot se establecio a ${text}*`);
};
handler.help = ['setprefix'].map((v) => v + ' [prefix]');
handler.tags = ['owner'];
handler.command = /^(setprefix)$/i;
handler.rowner = true;
export default handler;
