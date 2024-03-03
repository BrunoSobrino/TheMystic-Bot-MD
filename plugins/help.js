export default {
   names: ['Main Menu'],
   tags: ['menu'],
   command: ['menu', 'help', 'allmenu', 'command', 'm', 'all'],
   start: async (m, {
      conn,
      prefix,
      command,
      User,
      Format
   }) => {
      let sosmed = `${setting.sosmed}`;
      let jembut = ` ꒦ ͝ ꒷ ͝ ꒦ ͝ ꒷ ͝ ꒦ ͝ ꒷ ͝ ꒦ ͝ ꒷ ͝ ꒦ ͝ ꒷ ͝ ꒦ ͝ ꒷ ͝ ꒦ `; // hiasan atas
      let { Upload, Download } = await Format.statistic();
      let title = `${setting.botName}\n${setting.footer}`;
      let music = setting.music;
      let header = '┌────✦'
      let middle = '│'
      let pointer = '⭓'
      let bottom = '└────────✦'
      let num = conn.decodeJid(setting.owner);
      let info = `Selamat ${waktu.suasana} Bangsat\n@${m.sender.split('@')[0]} 🐽\n`
      info += `${star} Simple WhatsApp Bot \nBy ${setting.footer}\n`
      info += `📚 Library : baileys-wa@latest\n`
      info += `👤 Owner : wa.me/${num.split('@')[0]}\n`
      info += ` 📸 Instagram: ${sosmed}\n\n`
      info += ` Network Bot Usage :\n📥 Download: ${Download}\n📤 Upload: ${Upload}\n\n${jembut}`
      m.react('🐽', m.chat)
      let { menu } = await Format.Plugins(header, middle, pointer, bottom, prefix);
      let picture = await User.profilePicture(conn, m)
      m.adsReply(`${info}\n\n${menu}`, picture, m.chat)
      //conn.sendFile(m.chat, music, { ptt : true, quoted : m })
   }
};
