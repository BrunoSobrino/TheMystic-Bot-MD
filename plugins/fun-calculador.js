
const handler = async (m, { conn, command, text, usedPrefix }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.fun_calculador

  if (!text) throw `${tradutor.texto26}`;
  const percentages = (500).getRandom();
  let emoji = '';
  let description = '';
  switch (command) {
    case 'gay2':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `${tradutor.texto1[0]} ${text.toUpperCase()} ${tradutor.texto1[1]} ${percentages}% Gay. ${emoji}*\n${tradutor.texto1[2]}`;
      } else if (percentages > 100) {
        description = `${tradutor.texto2[0]} ${text.toUpperCase()} ${tradutor.texto2[1]} ${percentages}% Gay. ${emoji}*\n${tradutor.texto2[2]}`;
      } else {
        description = `${tradutor.texto3[0]} ${text.toUpperCase()} ${tradutor.texto3[1]} ${percentages}% Gay. ${emoji}*\n${tradutor.texto3[2]}`;
      }
      break;
    case 'lesbiana':
      emoji = '🏳️‍🌈';
      if (percentages < 50) {
        description = `${tradutor.texto4[0]} ${text.toUpperCase()} ${tradutor.texto4[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto4[2]}`;
      } else if (percentages > 100) {
        description = `${tradutor.texto5[0]} ${text.toUpperCase()} ${tradutor.texto5[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto5[2]}`;
      } else {
        description = `${tradutor.texto6[0]} ${text.toUpperCase()} ${tradutor.texto6[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto6[2]}`;
      }
      break;
    case 'pajero':
    case 'pajera':
      emoji = '😏💦';
      if (percentages < 50) {
        description = `${tradutor.texto7[0]} ${text.toUpperCase()} ${tradutor.texto7[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto7[2]}`;
      } else if (percentages > 100) {
        description = `${tradutor.texto8[0]} ${text.toUpperCase()} ${tradutor.texto8[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto8[2]}`;
      } else {
        description = `${tradutor.texto9[0]} ${text.toUpperCase()} ${tradutor.texto9[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto9[2]}`;
      }
      break;
    case 'puto':
    case 'puta':
      emoji = '🔥🥵';
      if (percentages < 50) {
        description = `${tradutor.texto10[0]} ${text.toUpperCase()} ${tradutor.texto10[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto10[2]}`;
      } else if (percentages > 100) {
        description = `${tradutor.texto11[0]} ${text.toUpperCase()} ${tradutor.texto11[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto11[2]}`;
      } else {
        description = `${tradutor.texto12[0]} ${text.toUpperCase()} ${tradutor.texto12[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto12[2]}`;
      }
      break;
    case 'manco':
    case 'manca':
      emoji = '💩';
      if (percentages < 50) {
        description = `${tradutor.texto13[0]} ${text.toUpperCase()} ${tradutor.texto13[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto13[2]}`;
      } else if (percentages > 100) {
        description = `${tradutor.texto14[0]} ${text.toUpperCase()} ${tradutor.texto14[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto14[2]}`;
      } else {
        description = `${tradutor.texto15[0]} ${text.toUpperCase()} ${tradutor.texto15[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto15[2]}`;
      }
      break;
    case 'rata':
      emoji = '🐁';
      if (percentages < 50) {
        description = `${tradutor.texto16[0]} ${text.toUpperCase()} ${tradutor.texto16[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto16[2]}`;
      } else if (percentages > 100) {
        description = `${tradutor.texto17[0]} ${text.toUpperCase()} ${tradutor.texto17[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto17[2]}`;
      } else {
        description = `${tradutor.texto18[0]} ${text.toUpperCase()} ${tradutor.texto18[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto18[2]}`;
      }
      break;
    case 'prostituto':
    case 'prostituta':
      emoji = '🫦👅';
      if (percentages < 50) {
        description = `${tradutor.texto19[0]} ${text.toUpperCase()} ${tradutor.texto19[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto19[2]}`;
      } else if (percentages > 100) {
        description = `${tradutor.texto20[0]} ${text.toUpperCase()} ${tradutor.texto20[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto20[2]}`;
      } else {
        description = `${tradutor.texto21[0]} ${text.toUpperCase()} ${tradutor.texto21[1]} ${percentages}% ${command}. ${emoji}*\n${tradutor.texto21[2]}`;
      }
      break;
      default:
      throw `${tradutor.texto22}`;
  }
  const responses = tradutor.texto23;
  const response = responses[Math.floor(Math.random() * responses.length)];
  const cal = `━━━━⬣ ${tradutor.texto24} ⬣━━━━

—◉ ${description}

*"${response}"*

━━━━⬣ ${tradutor.texto24} ⬣━━━━`.trim()  
  async function loading() {
var hawemod = [
"《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
"《 ████▒▒▒▒▒▒▒▒》30%",
"《 ███████▒▒▒▒▒》50%",
"《 ██████████▒▒》80%",
"《 ████████████》100%"
]
   let { key } = await conn.sendMessage(m.chat, {text: `${tradutor.texto25}`, mentions: conn.parseMention(cal)}, {quoted: m})
 for (let i = 0; i < hawemod.length; i++) {
   await new Promise(resolve => setTimeout(resolve, 1000)); 
   await conn.sendMessage(m.chat, {text: hawemod[i], edit: key, mentions: conn.parseMention(cal)}, {quoted: m}); 
  }
  await conn.sendMessage(m.chat, {text: cal, edit: key, mentions: conn.parseMention(cal)}, {quoted: m});         
 }
loading()    
};
handler.help = ['gay2', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituta', 'prostituto'].map((v) => v + ' @tag | nombre');
handler.tags = ['calculator'];
handler.command = /^(gay2|lesbiana|pajero|pajera|puto|puta|manco|manca|rata|prostituta|prostituto)$/i;
export default handler;
