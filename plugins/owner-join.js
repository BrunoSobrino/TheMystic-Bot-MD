const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;
const handler = async (m, {conn, text, isMods, isOwner, isPrems}) => {
  try {
    const link = (m.quoted ? m.quoted.text ? m.quoted.text : text : text) || text;
    const [_, code] = link.match(linkRegex) || [];
    if (!link.includes(linkRegex) || !code) throw '*[❗] Link erroneo o faltante, ingrese el enlace de un grupo de WhatsApp*\n\n*—◉ Ejemplo:*\n*◉ #join https://chat.whatsapp.com/FwEUGxkvZD85fIIp0gKyFC*';
    if ( isPrems || isMods || isOwner || m.fromMe) {
      const res = await conn.groupAcceptInvite(code);
      await conn.sendMessage(m.chat, {text: '[ ✔️ ] El Bot ha ingresado con éxito al grupo.'}, {quoted: m})
    } else {
      const data = global.owner.filter(([id]) => id)[0];
      const dataArray = Array.isArray(data) ? data : [data];
      for (const entry of dataArray) {
      const id = entry;
        await conn.sendMessage(id + '@s.whatsapp.net', {text: '*[❗] NUEVA SOLICITUD DE UN BOT PARA UN GRUPO [❗]*\n\n*—◉ Numero del solicitante:* ' + 'wa.me/' + m.sender.split('@')[0] + '\n*—◉ Link del grupo:* ' + link});
      }
      await conn.sendMessage(m.chat, {text: '*[❗] El link de su grupo fue enviado a mi propietario/a.*\n\n*—◉ Su grupo estará en evaluación y el propietario/a del Bot decidirá si agrega o no al Bot.*\n\n*—◉ Algunas de las razones por la cual su solicitud puede ser rechazada son:*\n*1.- El Bot está saturado.*\n*2.- El Bot fue eliminado del grupo recientemente.*\n*3.- El link del grupo ha sido restablecido.*\n*4.-El Bot no se agrega a grupos por decisión del propietario/a.*\n\n*—◉ El proceso de evaluación puede tomar algo de tiempo, incluso dias, tenga paciencia.*'}, {quoted: m});
    }
  } catch {
    throw '*[❗] Lo sentimos, algo salio mal por favor reportelo o vuelva a intentarlo.*';
  }
};
handler.help = ['join [chat.whatsapp.com]'];
handler.tags = ['premium'];
handler.command = /^join|nuevogrupo$/i;
handler.private = true;
export default handler;
