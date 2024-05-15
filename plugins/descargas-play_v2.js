/*

- Agradecimiento a la comunidad de "WSApp • Developers"
 * https://chat.whatsapp.com/FaQunmlp9BmDRk6lEEc9FJ
- Agradecimiento especial a Carlos (PT) por los codigos de interactiveMessage (botones)
- Agradecimiento a Darlyn1234 por la estructura de uso en este codigo y quoted
 * https://github.com/darlyn1234
- Adaptacion de imagen en tipo lista, codigo y funcionamiento por BrunoSobrino
 * https://github.com/BrunoSobrino

*/
import fetch from 'node-fetch';
import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys';

let data;
let buff;
let mimeType;
let fileName;
let apiUrl;
let enviando = false;
let device;
const handler = async (m, { command, usedPrefix, conn, text }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language;
  const _translate = JSON.parse(fs.readFileSync(./language/${idioma}.json));
  const tradutor = _translate.plugins.descargas_play_v2;
  device = await getDevice(m.key.id);

  if (!text) throw ${tradutor.texto1[0]} _${usedPrefix + command} ${tradutor.texto1[1]} _${usedPrefix + command} https://youtu.be/JLWRZ8eWyZo?si=EmeS9fJvS_OkDk7p_;
  if (command === 'playyt' && (device == 'desktop' || device == 'web')) throw *[❗] Los mensajes de botones aun no estan disponibles en WhatsApp web, acceda a su celular para poder ver y usar los mensajes con botones.*;
  if (enviando) return;
  enviando = true;

  try {
    const apiUrls = [
      https://api.cafirexos.com/api/ytplay?text=${text},
      https://api-brunosobrino.onrender.com/api/ytplay?text=${text}&apikey=BrunoSobrino,
      https://api-for-canvas-brunosobrino.koyeb.app/api/ytplay?text=${text},
    ];

    let success = false;
    for (const url of apiUrls) {
      try {
        const res = await fetch(url);
        data = await res.json();
        if (data.resultado && data.resultado.url) {
          success = true;
          break;
        }
      } catch {}
    }

    if (!success) {
      enviando = false;
      throw ${tradutor.texto2};
    }

    if (command === 'playyt') {
      const dataMessagee = ${tradutor.texto4[0]} ${data.resultado.title}\n${tradutor.texto4[1]} ${data.resultado.publicDate}\n${tradutor.texto4[2]} ${data.resultado.channel}\n${tradutor.texto4[3]} ${data.resultado.url}.trim();
      var messa = await prepareWAMessageMedia({ image: {url: data.resultado.image}}, { upload: conn.waUploadToServer });
      let msg = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
              message: {
                  interactiveMessage: {
                      body: { text: dataMessagee },
                      footer: { text: ${global.wm}.trim() },
                      header: {
                          hasMediaAttachment: true,
                          imageMessage: messa.imageMessage,
                      },
                      nativeFlowMessage: {
                          buttons: [
                              {
                                  name: 'quick_reply',
                                  buttonParamsJson: JSON.stringify({
                                      display_text: 'AUDIO',
                                      id: ${usedPrefix}play.1 ${data.resultado.url} SN@
                                  })
                              },
                              {
                                  name: 'quick_reply',
                                  buttonParamsJson: JSON.stringify({
                                      display_text: 'VIDEO',
                                      id: ${usedPrefix}play.2 ${data.resultado.url} SN@
                                  })
                              },   
                          ],
                          messageParamsJson: "",
                      },
                  },
              },
          }
      }, { userJid: conn.user.jid, quoted: m});
      conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id});
      enviando = false;    
      return;
    }    

    try {
      if (command === 'play.1') {
        let apiUrls = [
          https://api.cafirexos.com/api/v1/ytmp3?url=${data.resultado.url},
          https://api.cafirexos.com/api/v2/ytmp3?url=${data.resultado.url},
          https://api-brunosobrino.onrender.com/api/v1/ytmp3?url=${data.resultado.url}&apikey=BrunoSobrino,
          https://api-brunosobrino.onrender.com/api/v2/ytmp3?url=${data.resultado.url}&apikey=BrunoSobrino,
          https://api-for-canvas-brunosobrino.koyeb.app/api/v1/ytmp3?url=${data.resultado.url},
          https://api-for-canvas-brunosobrino.koyeb.app/api/v2/ytmp3?url=${data.resultado.url},
        ];

        let success = false;
        for (const url of apiUrls) {
          try {
            apiUrl = url;
            mimeType = 'audio/mpeg';
            fileName = 'error.mp3';
            buff = await conn.getFile(apiUrl);
            success = true;
            break;
          } catch {}
        }

        if (!success) {
          enviando = false;
          throw ${tradutor.texto3};
        }
      } else if (command === 'play.2') {
        let apiUrls = [
          https://api.cafirexos.com/api/v1/ytmp4?url=${data.resultado.url},
          https://api.cafirexos.com/api/v2/ytmp4?url=${data.resultado.url},
          https://api-brunosobrino.onrender.com/api/v1/ytmp4?url=${data.resultado.url}&apikey=BrunoSobrino,
          https://api-brunosobrino.onrender.com/api/v2/ytmp4?url=${data.resultado.url}&apikey=BrunoSobrino,
          https://api-for-canvas-brunosobrino.koyeb.app/api/v1/ytmp4?url=${data.resultado.url},
          https://api-for-canvas-brunosobrino.koyeb.app/api/v2/ytmp4?url=${data.resultado.url},
        ];

        let success = false;
        for (const url of apiUrls) {
          try {
            apiUrl = url;
            mimeType = 'video/mp4';
            fileName = 'error.mp4';
            buff = await conn.getFile(apiUrl);
            success = true;
            break;
          } catch {}
        }

        if (!success) {
          enviando = false;
          throw ${tradutor.texto3};
        }
      }
    } catch {
      enviando = false;
      throw ${tradutor.texto3};
    }

    const dataMessage = ${tradutor.texto4[0]} ${data.resultado.title}\n${tradutor.texto4[1]} ${data.resultado.publicDate}\n${tradutor.texto4[2]} ${data.resultado.channel}\n${tradutor.texto4[3]} ${data.resultado.url};
    if (!text.includes('SN@')) await conn.sendMessage(m.chat, { text: dataMessage }, { quoted: m });

    if (buff) {
      await conn.sendMessage(m.chat, {[mimeType.startsWith('audio') ? 'audio' : 'video']: buff.data, mimetype: mimeType, fileName: fileName}, {quoted: m});
      enviando = false;
    } else {
      enviando = false;
      throw ${tradutor.texto5};
    }
  } catch (error) {
    console.log(error);  
    enviando = false;
    throw tradutor.texto6;
  }
};

handler.command = /^(play.1|play.2|playyt)$/i;
export default handler;
