

const handler = (m) => m;
handler.before = async function(m) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.game__suitpvp

  this.suit = this.suit ? this.suit : {};
  if (db.data.users[m.sender].suit < 0) db.data.users[m.sender].suit = 0;
  const room = Object.values(this.suit).find((room) => room.id && room.status && [room.p, room.p2].includes(m.sender));
  if (room) {
    let win = '';
    let tie = false;
    if (m.sender == room.p2 && /^(acc(ept)?|terima|aceptar|gas|aceptare?|nao|gamau|rechazar|ga(k.)?bisa)/i.test(m.text) && m.isGroup && room.status == 'wait') {
      if (/^(tolak|gamau|rechazar|ga(k.)?bisa)/i.test(m.text)) {
        const textno = `*[❗] @${room.p2.split`@`[0]} ${tradutor.texto1}`;
        m.reply(textno, null, {mentions: this.parseMention(textno)});
        delete this.suit[room.id];
        return !0;
      }
      room.status = 'play';
      room.asal = m.chat;
      clearTimeout(room.waktu);
      const textplay = `${tradutor.texto2} @${room.p.split`@`[0]} 𝚈 @${room.p2.split`@`[0]}\n\n${tradutor.texto3} wa.me/${conn.user.id.split`@`[0]}*`;
      m.reply(textplay, m.chat, {mentions: this.parseMention(textplay)});
      const comienzop = `${tradutor.texto4[0]}
${tradutor.texto4[1]}
${tradutor.texto4[2]}
${tradutor.texto4[3]}\n${tradutor.texto4[4]}${room.poin}${tradutor.texto4[5]} ${room.poin_lose}${tradutor.texto4[6]}
${tradutor.texto4[7]}`;
      const comienzop2 = `${tradutor.texto5[0]}
${tradutor.texto5[1]}
${tradutor.texto5[2]}
${tradutor.texto5[3]}\n${tradutor.texto5[4]}${room.poin}${tradutor.texto5[5]} ${room.poin_lose}${tradutor.texto5[6]}
${tradutor.texto5[7]}`;

      if (!room.pilih) this.sendMessage(room.p, {text: comienzop}, {quoted: m});
      if (!room.pilih2) this.sendMessage(room.p2, {text: comienzop2}, {quoted: m});
      room.waktu_milih = setTimeout(() => {
        const iniciativa = tradutor.texto6;
        if (!room.pilih && !room.pilih2) this.sendMessage(m.chat, {text: iniciativa}, {quoted: m});
        else if (!room.pilih || !room.pilih2) {
          win = !room.pilih ? room.p2 : room.p;
          const textnull = `*[❗] @${(room.pilih ? room.p2 : room.p).split`@`[0]} ${tradutor.texto7}`;
          this.sendMessage(m.chat, {text: textnull}, {quoted: m}, {mentions: this.parseMention(textnull)});
          db.data.users[win == room.p ? room.p : room.p2].exp += room.poin;
          db.data.users[win == room.p ? room.p : room.p2].exp += room.poin_bot;
          db.data.users[win == room.p ? room.p2 : room.p].exp -= room.poin_lose;
        }
        delete this.suit[room.id];
        return !0;
      }, room.timeout);
    }
    const jwb = m.sender == room.p;
    const jwb2 = m.sender == room.p2;
    const g = /tijera/i;
    const b = /piedra/i;
    const k = /papel/i;
    const reg = /^(tijera|piedra|papel)/i;
    if (jwb && reg.test(m.text) && !room.pilih && !m.isGroup) {
      room.pilih = reg.exec(m.text.toLowerCase())[0];
      room.text = m.text;
      m.reply(`*[ ✔ ] 𝙷𝙰𝚂 𝙴𝙻𝙴𝙶𝙸𝙳𝙾 ${m.text}, 𝚁𝙴𝙶𝚁𝙴𝚂𝙰 𝙰𝙻 𝙶𝚁𝚄𝙿𝙾 𝚈 ${room.pilih2 ? `𝚁𝙴𝚅𝙸𝚂𝙰 𝙻𝙾𝚂 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂*` : '𝙴𝚂𝙿𝙴𝚁𝙰 𝙻𝙾𝚂 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂*'}`);
      if (!room.pilih2) this.reply(room.p2, '*[❗] 𝙴𝙻 𝙾𝙿𝙾𝙽𝙴𝙽𝚃𝙴 𝙰𝙷 𝙴𝙻𝙴𝙶𝙸𝙳𝙾, 𝙴𝚂 𝚃𝚄 𝚃𝚄𝚁𝙽𝙾 𝙳𝙴 𝙴𝙻𝙴𝙶𝙸𝚁!!*', 0);
    }
    if (jwb2 && reg.test(m.text) && !room.pilih2 && !m.isGroup) {
      room.pilih2 = reg.exec(m.text.toLowerCase())[0];
      room.text2 = m.text;
      m.reply(`*[ ✔ ] 𝙷𝙰𝚂 𝙴𝙻𝙴𝙶𝙸𝙳𝙾 ${m.text}, 𝚁𝙴𝙶𝚁𝙴𝚂𝙰 𝙰𝙻 𝙶𝚁𝚄𝙿𝙾 𝚈 ${room.pilih ? `𝚁𝙴𝚅𝙸𝚂𝙰 𝙻𝙾𝚂 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂*` : '𝙴𝚂𝙿𝙴𝚁𝙰 𝙻𝙾𝚂 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂*'}`);
      if (!room.pilih) this.reply(room.p, '*[❗] 𝙴𝙻 𝙾𝙿𝙾𝙽𝙴𝙽𝚃𝙴 𝙰𝙷 𝙴𝙻𝙴𝙶𝙸𝙳𝙾, 𝙴𝚂 𝚃𝚄 𝚃𝚄𝚁𝙽𝙾 𝙳𝙴 𝙴𝙻𝙴𝙶𝙸𝚁!!*', 0);
    }
    const stage = room.pilih;
    const stage2 = room.pilih2;
    if (room.pilih && room.pilih2) {
      clearTimeout(room.waktu_milih);
      if (b.test(stage) && g.test(stage2)) win = room.p;
      else if (b.test(stage) && k.test(stage2)) win = room.p2;
      else if (g.test(stage) && k.test(stage2)) win = room.p;
      else if (g.test(stage) && b.test(stage2)) win = room.p2;
      else if (k.test(stage) && b.test(stage2)) win = room.p;
      else if (k.test(stage) && g.test(stage2)) win = room.p2;
      else if (stage == stage2) tie = true;
      this.reply(room.asal, `
*👑 𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂 𝙳𝙴𝙻 𝙿𝚅𝙿 👑*${tie ? '\n*—◉ 𝙴𝙼𝙿𝙰𝚃𝙴!!*' : ''}
*@${room.p.split`@`[0]} (${room.text})* ${tie ? '' : room.p == win ? ` *𝙶𝙰𝙽𝙾 🥳 +${room.poin}XP*` : ` *𝙿𝙴𝚁𝙳𝙸𝙾 🤡 ${room.poin_lose}XP*`}
*@${room.p2.split`@`[0]} (${room.text2})* ${tie ? '' : room.p2 == win ? ` *𝙶𝙰𝙽𝙾 🥳 +${room.poin}XP*` : ` *𝙿𝙴𝚁𝙳𝙸𝙾 🤡 ${room.poin_lose}XP*`}
`.trim(), m, {mentions: [room.p, room.p2]} );
      if (!tie) {
        db.data.users[win == room.p ? room.p : room.p2].exp += room.poin;
        db.data.users[win == room.p ? room.p : room.p2].exp += room.poin_bot;
        db.data.users[win == room.p ? room.p2 : room.p].exp += room.poin_lose;
      }
      delete this.suit[room.id];
    }
  }
  return !0;
};
handler.exp = 0;
export default handler;
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
