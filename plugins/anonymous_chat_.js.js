export async function before(m, {match}) {
  if (!m.chat.endsWith('@s.whatsapp.net')) {
    return !0;
  }
  this.anonymous = this.anonymous ? this.anonymous : {};
  const room = Object.values(this.anonymous).find((room) => [room?.a, room?.b].includes(m.sender) && room?.state === 'CHATTING');
  if (room) {
    if (/^(next|leave|start)/.test(m.text)) {
      let other
      try {
      other = [room?.a, room?.b].find((user) => user !== m.sender);
      } catch {  
       conn.sendMessage(m.chat, {text: `*[❗] No estás en un chat, por favor espera a estar en uno.*`}, {quoted: m}); 
      }  
      await m.copyNForward(other, true);
    }    
  }
  return !0;
}
