/*              Codigo Creado Por Bruno Sobrino
      (https://github.com/BrunoSobrino/TheMystic-Bot-MD)
*/

const handler = async (m, {conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin, isSuperAdmin}) => {
  if (!args[0]) return m.reply(`*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝙴𝙻 𝙿𝚁𝙴𝙵𝙸𝙹𝙾 𝙳𝙴 𝙰𝙻𝙶𝚄𝙽 𝙿𝙰𝙸𝚂 𝙿𝙰𝚁𝙰 𝙱𝚄𝚂𝙲𝙰𝚁 𝙽𝚄𝙼𝙴𝚁𝙾𝚂 𝙴𝙽 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾 𝙳𝙴 𝙴𝚂𝙴 𝙿𝙰𝙸𝚂, 𝙴𝙹𝙴𝙼𝙿𝙻𝙾: ${usedPrefix + command} 52*`);
  if (isNaN(args[0])) return m.reply(`*[❗] 𝙸𝙽𝙶𝚁𝙴𝚂𝙰 𝙴𝙻 𝙿𝚁𝙴𝙵𝙸𝙹𝙾 𝙳𝙴 𝙰𝙻𝙶𝚄𝙽 𝙿𝙰𝙸𝚂 𝙿𝙰𝚁𝙰 𝙱𝚄𝚂𝙲𝙰𝚁 𝙽𝚄𝙼𝙴𝚁𝙾𝚂 𝙴𝙽 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾 𝙳𝙴 𝙴𝚂𝙴 𝙿𝙰𝙸𝚂, 𝙴𝙹𝙴𝙼𝙿𝙻𝙾: ${usedPrefix + command} 52*`);
  const lol = args[0].replace(/[+]/g, '');
  const ps = participants.map((u) => u.id).filter((v) => v !== conn.user.jid && v.startsWith(lol || lol));
  const bot = global.db.data.settings[conn.user.jid] || {};
  if (ps == '') return m.reply(`*[❗] 𝙴𝙽 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾 𝙽𝙾 𝙷𝙰𝚈 𝙽𝙸𝙽𝙶𝚄𝙽 𝙽𝚄𝙼𝙴𝚁𝙾 𝙲𝙾𝙽 𝙴𝙻 𝙿𝚁𝙴𝙵𝙸𝙹𝙾 +${lol}*`);
  const numeros = ps.map((v)=> '⭔ @' + v.replace(/@.+/, ''));
  const delay = (time) => new Promise((res)=>setTimeout(res, time));
  switch (command) {
    case 'listanum': case 'listnum':
      conn.reply(m.chat, `*𝙻𝙸𝚂𝚃𝙰 𝙳𝙴 𝙽𝚄𝙼𝙴𝚁𝙾𝚂 𝙲𝙾𝙽 𝙴𝙻 𝙿𝚁𝙴𝙵𝙸𝙹𝙾 +${lol} 𝚀𝚄𝙴 𝙴𝚂𝚃𝙰𝙽 𝙴𝙽 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾:*\n\n` + numeros.join`\n`, m, {mentions: ps});
      break;
    case 'kicknum':
      if (!bot.restrict) return m.reply('*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝙿𝚁𝙾𝙿𝙸𝙴𝚃𝙰𝚁𝙸𝙾 𝙳𝙴𝙻 𝙱𝙾𝚃 𝙽𝙾 𝚃𝙸𝙴𝙽𝙴 𝙷𝙰𝙱𝙸𝙻𝙸𝚃𝙰𝙳𝙾 𝙻𝙰𝚂 𝚁𝙴𝚂𝚃𝚁𝙸𝙲𝙲𝙸𝙾𝙽𝙴𝚂 (#𝚎𝚗𝚊𝚋𝚕𝚎 𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝) 𝙲𝙾𝙽𝚃𝙰𝙲𝚃𝙴 𝙲𝙾𝙽 𝙴𝙻 𝙿𝙰𝚁𝙰 𝚀𝚄𝙴 𝙻𝙾 𝙷𝙰𝙱𝙸𝙻𝙸𝚃𝙴*');
      if (!isBotAdmin) return m.reply('*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝙱𝙾𝚃 𝙽𝙾 𝙴𝚂 𝙰𝙳𝙼𝙸𝙽, 𝙽𝙾 𝙿𝚄𝙴𝙳𝙴 𝙴𝚇𝚃𝙴𝚁𝙼𝙸𝙽𝙰𝚁 𝙰 𝙻𝙰𝚂 𝙿𝙴𝚁𝚂𝙾𝙽𝙰𝚂*');
      conn.reply(m.chat, `*[❗] 𝙸𝙽𝙸𝙲𝙸𝙰𝙽𝙳𝙾 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝙲𝙸𝙾𝙽 𝙳𝙴 𝙽𝚄𝙼𝙴𝚁𝙾𝚂 𝙲𝙾𝙽 𝙴𝙻 𝙿𝚁𝙴𝙵𝙸𝙹𝙾 +${lol}, 𝙲𝙰𝙳𝙰 𝟷0 𝚂𝙴𝙶𝚄𝙽𝙳𝙾𝚂 𝚂𝙴 𝙴𝙻𝙸𝙼𝙸𝙽𝙰𝚁𝙰 𝙰 𝚄𝙽 𝚄𝚂𝚄𝙰𝚁𝙸𝙾*`, m);
      const ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net';
      const users = participants.map((u) => u.id).filter((v) => v !== conn.user.jid && v.startsWith(lol || lol));
      for (const user of users) {
        const error = `@${user.split('@')[0]} ʏᴀ ʜᴀ sɪᴅᴏ ᴇʟɪᴍɪɴᴀᴅᴏ ᴏ ʜᴀ ᴀʙᴀɴᴅᴏɴᴀᴅᴏ ᴇʟ ɢʀᴜᴘᴏ*`;
        if (user !== ownerGroup + '@s.whatsapp.net' && user !== global.conn.user.jid && user !== global.owner + '@s.whatsapp.net' && user.startsWith(lol || lol) && user !== isSuperAdmin && isBotAdmin && bot.restrict) {
          await delay(2000);
          const responseb = await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
          if (responseb[0].status === '404') m.reply(error, m.chat, {mentions: conn.parseMention(error)});
          await delay(10000);
        } else return m.reply('*[❗] 𝙴𝚁𝚁𝙾𝚁*');
      }
      break;
  }
};
handler.command = /^(listanum|kicknum|listnum)$/i;
handler.group = handler.botAdmin = handler.admin = true;
handler.fail = null;
export default handler;
