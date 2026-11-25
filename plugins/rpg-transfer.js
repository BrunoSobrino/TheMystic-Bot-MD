const items = ['limit', 'exp'];
const confirmation = {};

async function handler(m, { conn, args, usedPrefix, command }) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.rpg_transfer

  if (confirmation[m.sender]) return conn.sendMessage(m.chat, {text: tradutor.texto1, mentions: [m.sender]}, {quoted: m});
  const user = global.db.data.users[m.sender];
  const item = items.filter((v) => v in user && typeof user[v] == 'number');
  const lol = `${tradutor.texto2[0]}
  ${tradutor.texto2[1]} ${usedPrefix + command}*  ${tradutor.texto2[2]} ${tradutor.texto2[3]} [@user]
  ${tradutor.texto2[4]} ${usedPrefix + command} ${tradutor.texto2[5]} @${m.sender.split('@')[0]}

  ${tradutor.texto2[6]}
  ${tradutor.texto2[7]}
  ${tradutor.texto2[8]}
`.trim();
  const type = (args[0] || '').toLowerCase();
  if (!item.includes(type)) return conn.sendMessage(m.chat, {text: lol, mentions: [m.sender]}, {quoted: m});
  const count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, (isNumber(args[1]) ? parseInt(args[1]) : 1))) * 1;
  const _mentioned = await m.mentionedJid;
  const who = _mentioned[0] || (args[2] ? (args[2].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : '');
  if (!who) return conn.sendMessage(m.chat, {text: tradutor.texto3, mentions: [m.sender]}, {quoted: m});
  if (!(who in global.db.data.users)) return conn.sendMessage(m.chat, {text: `${tradutor.texto4[0]} ${who} ${tradutor.texto4[1]}`, mentions: [m.sender]}, {quoted: m});
  if (user[type] * 1 < count) return conn.sendMessage(m.chat, {text: `${tradutor.texto5[0]} ${type} ${tradutor.texto5[1]}`, mentions: [m.sender]}, {quoted: m});
const confirm = `${tradutor.texto6[0]} ${count} ${type} a @${(who || '').replace(/@s\.whatsapp\.net/g, '')}?* 
${tradutor.texto6[1]}

${tradutor.texto6[2]}* 
${tradutor.texto6[3]}
${tradutor.texto6[4]}`.trim();
  await conn.sendMessage(m.chat, {text: confirm, mentions: [who]}, {quoted: m});
  confirmation[m.sender] = { sender: m.sender, to: who, message: m, type, count, timeout: setTimeout(() => (conn.sendMessage(m.chat, {text: tradutor.texto10, mentions: [m.sender]}, {quoted: m}), delete confirmation[m.sender]), 60 * 1000)};
}

handler.before = async (m, { conn }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.rpg_transfer
  
  if (m.isBaileys) return;
  if (!(m.sender in confirmation)) return;
  if (!m.text) return;
  const { timeout, sender, message, to, type, count } = confirmation[m.sender];
  if (m.id === message.id) return;
  const user = global.db.data.users[sender];
  const _user = global.db.data.users[to];
  // La confirmación se muestra traducida ((sim), (oui), (да), (yes), (نعم)),
  // así que se aceptan las palabras de sí/no del idioma del usuario.
  // Se mantiene el español como alternativa para no romper a nadie.
  const yesWords = { es: ['si', 'sí'], en: ['yes'], 'pt-br': ['sim'], fr: ['oui'], ru: ['да'], ar: ['نعم'] };
  const noWords = { es: ['no'], en: ['no'], 'pt-br': ['não', 'nao'], fr: ['non'], ru: ['нет'], ar: ['لا'] };
  const answer = (m.text || '').trim().toLowerCase();
  const yes = [...(yesWords[idioma] || []), ...yesWords.es];
  const no = [...(noWords[idioma] || []), ...noWords.es];
  if (no.includes(answer)) {
    clearTimeout(timeout);
    delete confirmation[sender];
    return conn.sendMessage(m.chat, {text: tradutor.texto7, mentions: [m.sender]}, {quoted: m});
  }
  if (yes.includes(answer)) {
    const previous = user[type] * 1;
    const _previous = _user[type] * 1;
    user[type] -= count * 1;
    _user[type] += count * 1;
    if (previous > user[type] * 1 && _previous < _user[type] * 1) {
      conn.sendMessage(m.chat, {text: `${tradutor.texto8} ${count} ${type} a @${(to || '').replace(/@s\.whatsapp\.net/g, '')}*`, mentions: [to]}, {quoted: m});
    } else {
      user[type] = previous;
      _user[type] = _previous;
      conn.sendMessage(m.chat, {text: `${tradutor.texto9} ${count} ${type} a @${(to || '').replace(/@s\.whatsapp\.net/g, '')}*`, mentions: [to]}, {quoted: m});
    }
    clearTimeout(timeout);
    delete confirmation[sender];
  }
};
handler.help = ['transfer'].map((v) => v + ' [tipo] [cantidad] [@tag]');
handler.tags = ['xp'];
handler.command = ['payxp', 'transfer', 'darxp', 'transferir'];
handler.disabled = false;
export default handler;

function special(type) {
  const b = type.toLowerCase();
  const special = (['common', 'uncommon', 'mythic', 'legendary', 'pet'].includes(b) ? ' Crate' : '');
  return special;
}
function isNumber(x) {
  return !isNaN(x);
}
