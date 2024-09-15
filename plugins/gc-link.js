import fs from 'fs';
import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from "baileys";

const handler = async (m, {conn, args}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_link

  let ppgc;
  try {
      ppgc = await conn.profilePictureUrl(m.chat, 'image')
  } catch {
      ppgc = 'https://i.ibb.co/RBx5SQC/avatar-group-large-v2.png'
  }  
  const ppgcbuff = await conn.getFile(ppgc)    
  const device = await getDevice(m.key.id);
    
    if (device !== 'desktop' || device !== 'web') {
        const linkcode = await conn.groupInviteCode(m.chat)
        var messa = await prepareWAMessageMedia({ image: ppgcbuff.data}, { upload: conn.waUploadToServer })
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat) },
                        footer: { text: `${global.wm}`.trim() },
                        header: {
                            hasMediaAttachment: true,
                            imageMessage: messa.imageMessage,
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    // URL Redirect 
                                    name: 'cta_copy',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'COPIAR LINK',
                                        copy_code: `https://chat.whatsapp.com/${linkcode}`,
                                        id: `https://chat.whatsapp.com/${linkcode}`
                                    })
                                },                   
                            ],
                            messageParamsJson: "",
                        },
                    },
                },
            }
        }, { userJid: conn.user.jid, quoted: m})
      conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id});
    } else {
        conn.reply(m.chat, 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group), m, {
           contextInfo: {externalAdReply: {mediaUrl: null, mediaType: 1, description: null,
           title: tradutor.texto1[0],
           body: '𝚃𝚑𝚎 𝙼𝚢𝚜𝚝𝚒𝚌 - 𝙱𝚘𝚝',
           previewType: 0, thumbnail: fs.readFileSync('./src/assets/images/menu/languages/es/menu.png'),
           sourceUrl: `https://github.com/BrunoSobrino/TheMystic-Bot-MD`}
           }
        }
      );  
   }
};
handler.help = ['linkgroup'];
handler.tags = ['group'];
handler.command = /^(link(gro?up)?)$/i;
handler.group = true;
handler.botAdmin = true;
export default handler;
