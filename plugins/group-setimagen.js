const handler = async (m, { conn }) => {

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || '';
          if (/image/.test(mime)) {
            let img = await q.download();
            if (!img) return m.reply(`ꕥ Te faltó la imagen para el perfil del grupo.`);

            try {
              await conn.updateProfilePicture(m.chat, img);
              m.reply(`ꕥ La imagen del grupo se actualizó con éxito.`);
            } catch (e) {
              await m.reply(`✎ No pudimos atrapar la información esta vez.\n> *Si crees que es un fallo, pásate por el grupo de soporte y lo revisamos juntos.*`);
            }
          } else {
            m.reply(`ꕥ Te faltó la imagen para cambiar el perfil del grupo.`);
}}

handler.command = ['setimagen'];

export default handler;