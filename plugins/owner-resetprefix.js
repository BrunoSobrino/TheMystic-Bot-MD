

const handler = async (m, {conn}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.owner_resetprefix

  global.prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
  await m.reply(tradutor.texto1);
  // conn.fakeReply(m.chat, '[❗𝐈𝐍𝐅𝐎❗] 𝙿𝚁𝙴𝙵𝙸𝙹𝙾 𝚁𝙴𝚂𝚃𝙰𝙱𝙻𝙴𝙲𝙸𝙳𝙾 𝙲𝙾𝙽 𝙴𝚇𝙸𝚃𝙾', '0@s.whatsapp.net', 'Reset Prefix')
};
handler.help = ['resetprefix'];
handler.tags = ['owner'];
handler.command = /^(resetprefix)$/i;
handler.rowner = true;


export default handler;
