const {downloadContentFromMessage} = (await import("baileys"));

export async function before(m, {isAdmin, isBotAdmin}) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins._antiviewonce
  
  const chat = db.data.chats[m.chat];
  if (/^[.~#/\$,](read)?viewonce/.test(m.text)) return;
  if (!chat?.antiviewonce || chat?.isBanned) return;
  if (m.viewOnce) {
    const msg = m;
    const type = msg.mtype;
    const media = await downloadContentFromMessage(msg, type == 'imageMessage' ? 'image' : type == 'videoMessage' ? 'video' : 'audio');
    let buffer = Buffer.from([]);
    for await (const chunk of media) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    const cap = tradutor.texto1
    if (/video/.test(type)) {
      return mconn.conn.sendFile(m.chat, buffer, 'error.mp4', `${msg?.caption ? msg?.caption + '\n\n' + cap : cap}`, m);
    } else if (/image/.test(type)) {
      return mconn.conn.sendFile(m.chat, buffer, 'error.jpg', `${msg?.caption ? msg?.caption + '\n\n' + cap : cap}`, m);
    } else if (/audio/.test(type)) {
      return mconn.conn.sendFile(m.chat, buffer, 'error.mp3', `${msg?.caption ? msg?.caption + '\n\n' + cap : cap}`, m);
    }
  }
}
