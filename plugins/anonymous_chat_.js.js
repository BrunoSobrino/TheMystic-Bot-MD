export async function before(m, {match}) {
  if (!m.chat.endsWith('@s.whatsapp.net')) {
    return;
  }
  this.anonymous = this.anonymous ? this.anonymous : {};
  const room = Object.values(this.anonymous).find((room) => [room?.a, room?.b].includes(m.sender) && room?.state === 'CHATTING');
  if (room) {
    if (/^.*(next|leave|start)/.test(m.text)) {
      return;
    }
    const other = [room?.a, room?.b].find((user) => user !== m.sender);
    await m.copyNForward(other, true);
  } else {
    if (/^.*(next|leave|start)/.test(m.text)) {
      return;
    } 
  conn.sendMessage(m.chat, {text: `*[❗] No estás en un chat, por favor espera a estar en uno.*`}, {quoted: m});
  }
  return !0;
}
