const handler = async (m, { conn, args, participants }) => {
 const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
 const tradutor = _translate.plugins.rpg_leaderboard;

 const users = Object.entries(global.db.data.users).map(([key, value]) => ({ ...value, jid: key })).filter(user => !user.jid.includes("@lid") && !user.jid.includes("@newsletter") && !user.jid.endsWith("@g.us"));
 const sortedExp = users.sort((a, b) => b.exp - a.exp);
 const sortedLim = users.sort((a, b) => b.limit - a.limit);
 const sortedLevel = users.sort((a, b) => b.level - a.level);
 const len = Math.min(args[0] && !isNaN(args[0]) ? Math.max(parseInt(args[0]), 10) : 10, 100);
 const adventurePhrases = tradutor.texto1;
 const randomPhrase = adventurePhrases[Math.floor(Math.random() * adventurePhrases.length)]; 
 const getText = (list, prop, unit) => list.slice(0, len).map(({ jid, [prop]: val }, i) => `i + 1. @${jid.split('@s.whatsapp.net')[0]}\n□ wa.me/${jid.split('@s.whatsapp.net')[0]}\n□ *${val} ${unit}`).join('\n\n');
 const body = `${tradutor.texto2[0]}\n□ ${randomPhrase}\n\n${tradutor.texto2[1]} ${len} ${tradutor.texto2[8]}\n${tradutor.texto2[2]} ${sortedExp.findIndex(u => u.jid === m.sender) + 1} ${tradutor.texto2[3]} ${users.length}\n${getText(sortedExp, 'exp', tradutor.texto2[5])}\n\n${tradutor.texto2[1]} ${len} ${tradutor.texto2[9]}\n${tradutor.texto2[2]} ${sortedLim.findIndex(u => u.jid === m.sender) + 1} ${tradutor.texto2[3]} ${users.length}\n${getText(sortedLim, 'limit', tradutor.texto2[6])}\n\n${tradutor.texto2[1]} ${len} ${tradutor.texto2[9]}\n\n${tradutor.texto2[2]} ${sortedLevel.findIndex(u => u.jid === m.sender) + 1} ${tradutor.texto2[3]} ${users.length}\n${getText(sortedLevel, 'level', tradutor.texto2[10])}`.trim();
 await conn.sendMessage(m.chat, { text: body, mentions: conn.parseMention(body) }, { quoted: m });
};

handler.help = ['leaderboard'];
handler.tags = ['xp'];
handler.command = ['leaderboard', 'lb'];
export default handler;
