const handler = async (m, { conn, participants }) => {
    const who = m.mentionedJid && m.mentionedJid[0] 
        ? m.mentionedJid[0] 
        : m.fromMe 
        ? conn.user.jid 
        : m.sender;

    const username = conn.getName(who);
    const user = who.split('@')[0];
    const userid = user + '@s.whatsapp.net';
    const senderid = m.sender.split('@')[0] + '@s.whatsapp.net';

//'status@broadcast'


    const contactInfo = {
    key: {
      participants: `${senderid}`,
      remoteJid: 'status@broadcast',
      fromMe: false,
      id: 'Halo'
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${user}:${user}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: `${userid}`
  };

    let pp;
    try {
        pp = await conn.profilePictureUrl(who, 'image');
    } catch (e) {
        pp = 'https://telegra.ph/file/c0f8bb917592f4684820b.jpg';
    }

    const cap = `
*╭────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄────╮*
*├───┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄───┤*
*│✑ مرحبا 「 @${user} 」*
*│✑ هل هذه صورتك؟*
*├───┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄───┤*
*╰────┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄────╯*
`.trim();

   // await conn.sendMessage(m.chat, { image: { url: pp }, caption: cap, mentions: [who] }, { quoted: m });
    
    
   await conn.sendMessage(m.chat, { image: { url: pp }, caption: cap, contextInfo: {externalAdReply: {title: wm, body: username, thumbnail: imagen1, sourceUrl: 'https://www.atom.bio/shawaza-2000/'}, mentionedJid: [who]}}, { quoted: contactInfo});
};

handler.help = ['profile [@user]'];
handler.tags = ['xp'];
handler.command = /^صورته|صورتة?$/i;

export default handler;
