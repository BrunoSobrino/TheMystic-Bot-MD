

const handler = async (m, {conn, args, participants}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.rpg_leaderboard

  const users = Object.entries(global.db.data.users).map(([key, value]) => {
    return {...value, jid: key};
  });
  const sortedExp = users.map(toNumber('exp')).sort(sort('exp'));
  const sortedLim = users.map(toNumber('limit')).sort(sort('limit'));
  const sortedLevel = users.map(toNumber('level')).sort(sort('level'));
  const usersExp = sortedExp.map(enumGetKey);
  const usersLim = sortedLim.map(enumGetKey);
  const usersLevel = sortedLevel.map(enumGetKey);
  const len = args[0] && args[0].length > 0 ? Math.min(100, Math.max(parseInt(args[0]), 10)) : Math.min(10, sortedExp.length);
  const adventurePhrases = tradutor.texto1;
  const randomAdventurePhrase = adventurePhrases[Math.floor(Math.random() * adventurePhrases.length)];
  const texto = `
${tradutor.texto2[0]}
    
${tradutor.texto2[1]} ${len} ${tradutor.texto2[2]}
${tradutor.texto2[3]} ${usersExp.indexOf(m.sender) + 1} ${tradutor.texto2[4]} ${usersExp.length}

${sortedExp.slice(0, len).map(({jid, exp}, i) => `${i + 1}. ${participants.some((p) => jid === p.jid) ? `(${conn.getName(jid)}) wa.me/` : '@'}${jid.split`@`[0]} *${exp}  ${tradutor.texto2[6]}`).join`\n`}

${tradutor.texto2[9]}
${tradutor.texto2[3]} ${usersLim.indexOf(m.sender) + 1} ${tradutor.texto2[5]} ${usersLim.length}

${sortedLim.slice(0, len).map(({jid, limit}, i) => `${i + 1}. ${participants.some((p) => jid === p.jid) ? `(${conn.getName(jid)}) wa.me/` : '@'}${jid.split`@`[0]} *${limit}  ${tradutor.texto2[7]}`).join`\n`}

${tradutor.texto2[10]}
${tradutor.texto2[3]} ${usersLevel.indexOf(m.sender) + 1} ${tradutor.texto2[6]} ${usersLevel.length}

${sortedLevel.slice(0, len).map(({jid, level}, i) => `${i + 1}. ${participants.some((p) => jid === p.jid) ? `(${conn.getName(jid)}) wa.me/` : '@'}${jid.split`@`[0]}  ${tradutor.texto2[8]} ${level}*`).join`\n`}

*⚔️ ${randomAdventurePhrase} ⚔️*`.trim();
  conn.sendMessage(m.chat, {text: texto, mentions: conn.parseMention(texto)}, {quoted: m})
};
handler.help = ['top'];
handler.tags = ['xp'];
handler.command = ['leaderboard', 'lb'];
handler.fail = null;
export default handler;

function sort(property, ascending = true) {
  if (property) return (...args) => args[ascending & 1][property] - args[!ascending & 1][property];
  else return (...args) => args[ascending & 1] - args[!ascending & 1];
}

function toNumber(property, _default = 0) {
  if (property) {
    return (a, i, b) => {
      return {...b[i], [property]: a[property] === undefined ? _default : a[property]};
    };
  } else return (a) => a === undefined ? _default : a;
}

function enumGetKey(a) {
  return a.jid;
}
