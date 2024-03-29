import fetch from 'node-fetch';


const handler = async (m, {conn, text, usedPrefix, command}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.ia_bard

  if (!text) {
    throw `${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]}`;
  }

  try {
    conn.sendPresenceUpdate('composing', m.chat);

    const API_URL = `https://vihangayt.me/tools/bard?q=${encodeURIComponent(text)}`;
    const response = await fetch(API_URL);
    const data = await response.json();

    if (data.status && data.data) {
      const respuestaAPI = data.data;
      conn.reply(m.chat, respuestaAPI, m);
    } else {
      throw tradutor.texto3;
    }
  } catch (error) {
    throw tradutor.texto4;
  }
};

handler.command = /^(bard)$/i;

// Este Código pertenece a Azami.js Editado Por By @Alba070503
/*import fetch from 'node-fetch'

var handler = async (m, { text,  usedPrefix, command }) => {

if (!text) throw `*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝚄𝙽𝙰 𝙿𝙴𝚃𝙸𝙲𝙸𝙾𝙽 𝙾 𝚄𝙽𝙰 𝙾𝚁𝙳𝙴𝙽 𝙿𝙰𝚁𝙰 𝚄𝚂𝙰𝚁 𝙻𝙰 𝙵𝚄𝙽𝙲𝙸𝙾𝙽 𝙳𝙴 𝙲𝙷𝙰𝚃𝙶𝙿𝚃*\n\n*—◉ 𝙴𝙹𝙴𝙼𝙿𝙻𝙾𝚂 𝙳𝙴 𝙿𝙴𝚃𝙸𝙲𝙸𝙾𝙽𝙴𝚂 𝚈 𝙾𝚁𝙳𝙴𝙽𝙴𝚂*\n*◉ ${usedPrefix + command} Reflexion sobre la serie Merlina 2022 de netflix*\n*◉ ${usedPrefix + command} Codigo en JS para un juego de cartas* `

try {

//await m.reply('*🚀 C A R G A N D O*')
conn.sendPresenceUpdate('composing', m.chat)
var apii = await fetch(`https://aemt.me/gemini?text=${text}`)
var res = await apii.json()
await m.reply(res.result)

} catch (error) {
console.error(error)
throw '*[❗] 𝙴𝚁𝚁𝙾𝚁, 𝚅𝚄𝙴𝙻𝚅𝙰 𝙰 𝙸𝙽𝚃𝙴𝙽𝚃𝙰𝚁𝙻𝙾*'
}

}
handler.command = ['bard']
handler.help = ['bard']*/
handler.tags = ['ai']

handler.premium = false

export default handler
