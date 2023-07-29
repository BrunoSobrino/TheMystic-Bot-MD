const handler = async (m, {conn, text}) => {
  const id = m.chat;
  conn.math = conn.math ? conn.math : {};
  if (id in conn.math) {
    clearTimeout(conn.math[id][3]);
    delete conn.math[id];
    m.reply('𝙷𝙴𝚈!! 𝙴𝚂𝚃𝙰𝚂 𝙷𝙰𝙲𝙸𝙴𝙽𝙳𝙾 𝚃𝚁𝙰𝙼𝙿𝙰');
  }
  const val = text
      .replace(/[^0-9\-\/+*×÷πEe()piPI/]/g, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π|pi/gi, 'Math.PI')
      .replace(/e/gi, 'Math.E')
      .replace(/\/+/g, '/')
      .replace(/\++/g, '+')
      .replace(/-+/g, '-');
  const format = val
      .replace(/Math\.PI/g, 'π')
      .replace(/Math\.E/g, 'e')
      .replace(/\//g, '÷')
      .replace(/\*×/g, '×');
  try {
    console.log(val);
    const result = (new Function('return ' + val))();
    if (!result) throw result;
    m.reply(`*${format}* = _${result}_`);
  } catch (e) {
    if (e == undefined) throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙻𝙰 𝙾𝙿𝙴𝚁𝙰𝙲𝙸𝙾𝙽 𝙼𝙰𝚃𝙴𝙼𝙰𝚃𝙸𝙲𝙰 𝚀𝚄𝙴 𝙳𝙴𝚂𝙴𝙴 𝙲𝙰𝙻𝙲𝚄𝙻𝙰𝚁*';
    throw '*[❗𝐈𝐍𝐅𝐎❗] 𝙵𝙾𝚁𝙼𝙰𝚃𝙾 𝙽𝙾 𝙰𝙳𝙼𝙸𝚃𝙸𝙳𝙾, 𝚂𝙾𝙻𝙾 𝚂𝙴 𝙰𝙳𝙼𝙸𝚃𝙴𝙽 𝙽𝚄𝙼𝙴𝚁𝙾𝚂 𝚈 𝙻𝙾𝚂 𝚂𝙸𝙼𝙱𝙾𝙻𝙾𝚂 -, +, *, /, ×, ÷, π, e, (, )*';
  }
};
handler.help = ['calc <expression>'];
handler.tags = ['tools'];
handler.command = /^(calc(ulat(e|or))?|kalk(ulator)?)$/i;
handler.exp = 5;
export default handler;
