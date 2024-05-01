

async function handler(m, {usedPrefix, command}) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.anonymous_chat

  command = command.toLowerCase();
  this.anonymous = this.anonymous ? this.anonymous : {};
  switch (command) {
    case 'next':
    case 'leave': {
      const room = Object.values(this.anonymous).find((room) => room.check(m.sender));
      if (!room) return this.sendMessage(other, {text: `${tradutor.texto1} ${usedPrefix}start`}, {quoted: m});
      // this.sendButton(m.chat, '*[❗𝐈𝐍𝐅𝐎❗] 𝙽𝙾 𝙴𝚂𝚃𝙰𝚂 𝙴𝙽 𝚄𝙽 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾*\n\n*¿𝚀𝚄𝙸𝙴𝚁𝙴𝚂 𝙸𝙽𝙸𝙲𝙸𝙰𝚁 𝚄𝙽𝙾?*\n_𝙳𝙰 𝙲𝙻𝙸𝙲𝙺 𝙴𝙽 𝙴𝙻 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 𝙱𝙾𝚃𝙾𝙽_', author, null, [['𝙸𝙽𝙸𝙲𝙸𝙰𝚁 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾', `.start`]], m)
      m.reply(tradutor.texto2);
      const other = room.other(m.sender);
      if (other) await this.sendMessage(other, {text: `${tradutor.texto3} ${usedPrefix}start`}, {quoted: m});
      // this.sendButton(other, '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝙾𝚃𝚁𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙰𝙷 𝙰𝙱𝙰𝙽𝙳𝙾𝙽𝙰𝙳𝙾 𝙴𝙻 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾*\n\n*¿𝚀𝚄𝙸𝙴𝚁𝙴𝚂 𝙸𝚁 𝙰 𝙾𝚃𝚁𝙾 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾?*\n_𝙳𝙰 𝙲𝙻𝙸𝙲𝙺 𝙴𝙽 𝙴𝙻 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 𝙱𝙾𝚃𝙾𝙽_', author, null, [['𝙸𝙽𝙸𝙲𝙸𝙰𝚁 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾', `.start`]], m)
      delete this.anonymous[room.id];
      if (command === 'leave') break;
    }
    case 'start': {
      if (Object.values(this.anonymous).find((room) => room.check(m.sender))) return this.sendMessage(m.chat, {text: `${tradutor.texto4} ${usedPrefix}leave`}, {quoted: m});
      // this.sendButton(m.chat, '*[❗𝐈𝐍𝐅𝐎❗] 𝚃𝙾𝙳𝙰𝚅𝙸𝙰 𝙴𝚂𝚃𝙰𝚂 𝙴𝙽 𝚄𝙽 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾 𝙾 𝙴𝚂𝙿𝙴𝚁𝙰𝙽𝙳𝙾 𝙰 𝚀𝚄𝙴 𝙾𝚃𝚁𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝚂𝙴 𝚄𝙽𝙰 𝙿𝙰𝚁𝙰 𝙸𝙽𝙸𝙲𝙸𝙰𝚁*\n\n*¿𝚀𝚄𝙸𝙴𝚁𝙴𝚂 𝚂𝙰𝙻𝙸𝚁 𝙳𝙴𝙻 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾?*\n_𝙳𝙰 𝙲𝙻𝙸𝙲𝙺 𝙴𝙽 𝙴𝙻 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 𝙱𝙾𝚃𝙾𝙽_', author, null, [['𝚂𝙰𝙻𝙸𝚁 𝙳𝙴𝙻 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾', `.leave`]], m)
      const room = Object.values(this.anonymous).find((room) => room.state === 'WAITING' && !room.check(m.sender));
      if (room) {
        await this.sendMessage(room.a, {text: `${tradutor.texto5}`}, {quoted: m});
        // this.sendButton(room.a, '*[ ✔ ] 𝚄𝙽𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝚂𝙴 𝙰𝙷 𝚄𝙽𝙸𝙳𝙾 𝙰𝙻 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾, 𝙿𝚄𝙴𝙳𝙴𝙽 𝙸𝙽𝙸𝙲𝙸𝙰𝚁 𝙰 𝙲𝙷𝙰𝚃𝙴𝙰𝚁*', author, null, [['𝙸𝚁 𝙰 𝙾𝚃𝚁𝙾 𝙲𝙷𝙰𝚃', `.next`]], m)
        room.b = m.sender;
        room.state = 'CHATTING';
        await this.sendMessage(m.chat, {text: `${tradutor.texto6} ${usedPrefix}next`}, {quoted: m});
        // this.sendButton(m.chat, '*[ ✔ ] 𝚄𝙽𝙰 𝙿𝙴𝚁𝚂𝙾𝙽𝙰 𝚂𝙴 𝙰𝙷 𝚄𝙽𝙸𝙳𝙾 𝙰𝙻 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾, 𝙿𝚄𝙴𝙳𝙴𝙽 𝙸𝙽𝙸𝙲𝙸𝙰𝚁 𝙰 𝙲𝙷𝙰𝚃𝙴𝙰𝚁*', author, null, [['𝙸𝚁 𝙰 𝙾𝚃𝚁𝙾 𝙲𝙷𝙰𝚃', `.next`]], m)
      } else {
        const id = + new Date;
        this.anonymous[id] = {
          id,
          a: m.sender,
          b: '',
          state: 'WAITING',
          check: function(who = '') {
            return [this.a, this.b].includes(who);
          },
          other: function(who = '') {
            return who === this.a ? this.b : who === this.b ? this.a : '';
          },
        };
        await this.sendMessage(m.chat, {text: `${tradutor.texto7} ${usedPrefix}leave`}, {quoted: m});
        // this.sendButton(m.chat, '*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝚂𝙿𝙴𝚁𝙰𝙽𝙳𝙾 𝙰 𝙾𝚃𝚁𝙾 𝚄𝚂𝚄𝙰𝚁𝙸𝙾 𝙿𝙰𝚁𝙰 𝙸𝙽𝙸𝙲𝙸𝙰𝚁 𝙴𝙻 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾*\n\n*¿𝚀𝚄𝙸𝙴𝚁𝙴𝚂 𝚂𝙰𝙻𝙸𝚁 𝙳𝙴𝙻 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾?*\n_𝙳𝙰 𝙲𝙻𝙸𝙲𝙺 𝙴𝙽 𝙴𝙻 𝚂𝙸𝙶𝚄𝙸𝙴𝙽𝚃𝙴 𝙱𝙾𝚃𝙾𝙽_', author, null, [['𝚂𝙰𝙻𝙸𝚁 𝙳𝙴𝙻 𝙲𝙷𝙰𝚃 𝙰𝙽𝙾𝙽𝙸𝙼𝙾', `.leave`]], m)
      }
      break;
    }
  }
}
handler.help = ['start', 'leave', 'next'];
handler.tags = ['anonymous'];
handler.command = ['start', 'leave', 'next'];
handler.private = true;
export default handler;
