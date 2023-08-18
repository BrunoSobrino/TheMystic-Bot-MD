export async function before(m, {match}) {
  // if (match) return !1
  if (!m.chat.endsWith('@s.whatsapp.net')) {
    return !0;
  }
  this.anonymous = this.anonymous ? this.anonymous : {};
  const room = Object.values(this.anonymous).find((room) => [room.a, room.b].includes(m.sender) && room.state === 'CHATTING');
if (room) {
  if (/^.*(next|leave|start)/.test(m.text)) {
    return;
  }
  const other = [room.a, room.b].find((user) => user !== m.sender);
  if (other) {
    await m.copyNForward(other, true);
  } else {
    conn.sendMessage(m.chat, {text: `*[❗] No estas en un chat, por favor espera a estar en uno o usa el comando #leave*`}, {quoted: m})
  }
}
  return !0;
}
