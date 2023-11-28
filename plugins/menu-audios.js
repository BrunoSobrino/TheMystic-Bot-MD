import fetch from 'node-fetch';
const handler = async (m, {conn, usedPrefix, usedPrefix: _p, __dirname, text, isPrems}) => {
  try {
    const pp = imagen4;
    // let vn = './media/menu.mp3'
    const img = './shadow.png;
    const d = new Date(new Date + 3600000);
    const locale = 'es';
    const week = d.toLocaleDateString(locale, {weekday: 'long'});
    const date = d.toLocaleDateString(locale, {day: 'numeric', month: 'long', year: 'numeric'});
    const _uptime = process.uptime() * 1000;
    const uptime = clockString(_uptime);
    const user = global.db.data.users[m.sender];
    const {money, joincount} = global.db.data.users[m.sender];
    const {exp, limit, level, role} = global.db.data.users[m.sender];
    const rtotalreg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
    const more = String.fromCharCode(8206);
    const readMore = more.repeat(850);
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    const doc = ['pdf', 'zip', 'vnd.openxmlformats-officedocument.presentationml.presentation', 'vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const document = doc[Math.floor(Math.random() * doc.length)];
    const str = `        @LxShadow ~ Bot 🥀

        
   Hola, ${taguser}


𝐒𝐢 𝐃𝐞𝐬𝐞𝐚𝐬 𝐀𝐝𝐪𝐮𝐢𝐫𝐢𝐫 𝐄𝐥 𝐁𝐨𝐭, 𝐏𝐥𝐚𝐭𝐚𝐟𝐨𝐫𝐦𝐚𝐬 𝐃𝐞 𝐒𝐭𝐫𝐞𝐚𝐦𝐢𝐧𝐠,
𝐃𝐢𝐚𝐦𝐚𝐧𝐭𝐞𝐬 𝐀 𝐁𝐚𝐣𝐨 𝐏𝐫𝐞𝐜𝐢𝐨 𝐔 𝐒𝐞𝐠𝐮𝐢𝐝𝐨𝐫𝐞𝐬.

𝐂𝐨𝐧𝐭𝐚𝐜𝐭𝐚𝐫𝐦𝐞 𝐀𝐥 𝐒𝐢𝐠𝐮𝐢𝐞𝐧𝐭𝐞 𝐍𝐮𝐦𝐞𝐫𝐨:
LxShadow: Wa.me/+5215541081250

𝐌𝐞𝐭𝐨𝐝𝐨𝐬 𝐃𝐞 𝐏𝐚𝐠𝐨:

Transferencia, Deposito Y PayPal.


      *☁️   𝐌𝐞𝐧𝐮 𝐃𝐞 𝐏𝐫𝐞𝐜𝐢𝐨𝐬   ☁️*

     
        *☁️ 𝐏𝐫𝐞𝐜𝐢𝐨 𝐃𝐞𝐥 𝐁𝐨𝐭 ☁️*
        
          30.00 Mx Por Grupo

      *☁️ 𝐂𝐫𝐞𝐚𝐜𝐢𝐨𝐧 𝐃𝐞 𝐓𝐮 𝐏𝐫𝐨𝐩𝐢𝐨 𝐁𝐨𝐭 ☁️*

               300.00 Mx

       (Tiempo De Entrega De 12 a 24 hrs)

___________________________________________

       *☁️ 𝐏𝐥𝐚𝐭𝐚𝐟𝐨𝐫𝐦𝐚𝐬 𝐃𝐞 𝐒𝐭𝐫𝐞𝐚𝐦𝐢𝐧𝐠 ☁️*
         
         ( 𝐏𝐞𝐫𝐟𝐢𝐥𝐞𝐬 ~ 𝟏 𝐃𝐢𝐬𝐩𝐨𝐬𝐢𝐭𝐢𝐯𝐨 )

💦- HBO Max 1 Mes 10.00 Mx

💦- Claro video 1 Mes 15.00 Mx
(Incluye Paramount,HBO Max,Foxsport)


         *☁️ 𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐚𝐬 ☁️*


💦- HBO Max 1 Mes 20.00 Mx

💦- Claro video 1 Mes 35.00 Mx
(Incluye Paramount,HBO Max,Foxsport)

_________________________________________
        
     *💎 𝐏𝐫𝐞𝐜𝐢𝐨 𝐃𝐢𝐚𝐦𝐚𝐧𝐭𝐞𝐬 𝐘 𝐑𝐞𝐠𝐚𝐥𝐨𝐬. 💎*

   💎520 x 65.00 Mx
   💎1,040 x 130.00 Mx
   💎1,560 x 190.00 Mx
   💎2,080 x 240.00 Mx
   💎2,600 x 300.00 Mx
   💎3,120 x 360.00 Mx
   💎3,640 x 420.00 Mx
   💎4,120 x 480.00 Mx
   💎4,680 x 540.00 Mx
   💎5,200 x 600.00 Mx

      *🎀  Regalos  🎀*

          Pase Booyah

  1 x 40.00 Mx   2 x 70.00 Mx


        *🎀  Salas  🎀*

   5 x 70.00 Mx  10 x 120.00 Mx


@LxShadow ~ Bot 🥀`.trim();
    if (m.isGroup) {
      // await conn.sendFile(m.chat, vn, 'menu.mp3', null, m, true, { type: 'audioMessage', ptt: true})
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: fkontak2});
    } else {
      // await conn.sendFile(m.chat, vn, 'menu.mp3', null, m, true, { type: 'audioMessage', ptt: true})
      const fkontak2 = {'key': {'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo'}, 'message': {'contactMessage': {'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`}}, 'participant': '0@s.whatsapp.net'};
      conn.sendMessage(m.chat, {image: pp, caption: str.trim(), mentions: [...str.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net')}, {quoted: fkontak2});
    }
  } catch {
    conn.reply(m.chat, '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝙼𝙴𝙽𝚄 𝚃𝙸𝙴𝙽𝙴 𝚄𝙽 𝙴𝚁𝚁𝙾𝚁 𝚈 𝙽𝙾 𝙵𝚄𝙴 𝙿𝙾𝚂𝙸𝙱𝙻𝙴 𝙴𝙽𝚅𝙸𝙰𝚁𝙻𝙾, 𝚁𝙴𝙿𝙾𝚁𝚃𝙴𝙻𝙾 𝙰𝙻 𝙿𝚁𝙾𝙿𝙸𝙴𝚃𝙰𝚁𝙸𝙾 𝙳𝙴𝙻 𝙱𝙾𝚃*', m);
  }
};
handler.command = /^(menu2|audios|menú2|memu2|menuaudio|menuaudios|memuaudios|memuaudio|audios|keyaudio|keyaudios)$/i;
handler.exp = 50;
handler.fail = null;
export default handler;
function clockString(ms) {
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':');
}
