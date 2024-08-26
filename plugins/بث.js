let handler = async (m, { conn, text }) => {
  let totalreg = Object.keys(global.db.data.users).length;
  let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered === true).length;
  
  const contactInfo = {
    key: {
      participants: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Halo'
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  };

  const readMore = String.fromCharCode(8206).repeat(850);
  
  const d = new Date(new Date().toLocaleString("en-US", {timeZone: "Africa/Cairo"}));
  
  const locale = 'ar';
  const week = d.toLocaleDateString(locale, { weekday: 'long' });
  const day = d.toLocaleDateString('en', { day: '2-digit' });
  const month = d.toLocaleDateString(locale, { month: 'long' });
  const year = d.toLocaleDateString('en', { year: 'numeric' });
  
  const time = d.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  const uptime = clockString(process.uptime() * 1000); 
  
  const pesan = m.quoted && m.quoted.text ? m.quoted.text : text;
  
  if (!pesan) return conn.sendMessage(m.chat, {text: 'ادخل نص الرساله اولا'}, { quoted: m });
  
  let formattedPesan = pesan.replace(/\n/g, '*\n*│');
  
  let counter = 1; 
  
  for (let [id, user] of Object.entries(global.db.data.users)) {
    if (id.endsWith('s.whatsapp.net')) {
    
      let name = '@' + id.split('@')[0];
      
      let whatsappLink = `https://wa.me/${id.split('@')[0]}`;
      
      const list = `
*≡      ◈─┄┄┄┄〘 إعلام من المطور 〙┄┄┄┄─◈*
*╭────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄────╮*
*├───┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄───┤*
*│✑ مرحبا 「 ${name} 」*
*│✑ اسمي 「 ${wm} 」*
*│✑ المطور 「 @${m.sender.split('@')[0]} 」*
*│✑ التاريخ 「 ${week} ${day}/${month}/${year} 」*
*│✑ الوقت 「 ${time} 」*
*│✑ التشغيل 「 ${uptime} 」*
*┤┄┄⋗  لا تنسي اضافه . قبل الأمر  ┄┄─◈*
*├───┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄───┤*
*╰────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄────╯*
${readMore}

*≡      ◈─┄┄┄┄┄┄┄〘 الإعلام 〙┄┄┄┄┄┄┄─◈*
*╭────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄────╮*
*├───┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄───┤*
*│${formattedPesan}*
*├───┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄───┤*
*╰────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄───╯*
`.trim();

      conn.sendMessage(id, { text: list, mentions: [m.sender, id] }, { quoted: contactInfo });
      
      counter++; 
    }
  }
  
  let txt = `*تم ارسال الرسالة الي ${counter} مستخدم 🧞*`;
  
  conn.sendMessage(m.chat, { text: txt }, { quoted: m });
};

handler.help = ['database', 'user'];
handler.tags = ['info'];
handler.command = /^(bc-c|بث)$/i;
handler.owner = true;

export default handler;

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
