let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const tags = Object.values(global.plugins)
      .flatMap(p => p.help ? p.tags : [])
      .filter(tag => tag != undefined && tag.trim() !== '');

    const counts = tags.reduce((c, tag) => {
      c[tag] = (c[tag] || 0) + 1;
      return c;
    }, {});

    const tagList = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => `⭔ ${(tag.charAt(0).toUpperCase() + tag.slice(1)).padEnd(13)} - ${count.toString().padStart(3)}`)
      .join('\n');

    const totalCommands = Object.values(counts).reduce((a, b) => a + b, 0);
    const responseText = "```" + `${tagList}\n` + "```";

    await conn.reply(m.chat, `*[ BOBIZA BOT FEATURES LIST ]*\n\n${responseText}\n\n*Total feature: ${totalCommands} Commands*`, m);
  } catch (error) {
    console.error(error);
    await conn.reply(m.chat, 'error.', m, adReply);
  }
}

handler.help = ['feature']
handler.tags = ['infobot']
handler.command = /^(feature|totalfitur)$/i
export default handler
