// Codigo por Gabriel Øfc : (https://github.com/glytglobal)
// Creado para: TheMystic-Bot-MD : (https://github.com/BrunoSobrino/TheMystic-Bot-MD) 

import _0x453b96 from 'axios';
const {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  generateWAMessageContent,
  getDevice
} = (await import("@whiskeysockets/baileys"))["default"];
let handler = async (_0x3585f0, {
  conn: _0x1a6b0c,
  text: _0x2f2134,
  usedPrefix: _0x4aa81f,
  command: _0x3f9b74
}) => {
  if (!_0x2f2134) {
    return _0x1a6b0c.reply(_0x3585f0.chat, "[❗️] *¿QUE BUSQUEDA DESEA REALIZAR EN TIKTOK?*", _0x3585f0, rcanal);
  }
  async function _0x438e4e(_0x2effca) {
    const {
      videoMessage: _0x46952c
    } = await generateWAMessageContent({
      'video': {
        'url': _0x2effca
      }
    }, {
      'upload': _0x1a6b0c.waUploadToServer
    });
    return _0x46952c;
  }
  function _0x1cb89b(_0x551ce5) {
    for (let _0xe08334 = _0x551ce5.length - 1; _0xe08334 > 0; _0xe08334--) {
      const _0x3db8fc = Math.floor(Math.random() * (_0xe08334 + 1));
      [_0x551ce5[_0xe08334], _0x551ce5[_0x3db8fc]] = [_0x551ce5[_0x3db8fc], _0x551ce5[_0xe08334]];
    }
  }
  try {
   _0x1a6b0c.reply(_0x3585f0.chat, '[❗️] *ENVIANDO SUS RESULTADOS..*', _0x3585f0, {
   contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, showAdAttribution: true,
   title: packname,
   body: wm,
   previewType: 0, thumbnail: icons,
   sourceUrl: channel }}});
    let _0x26b601 = [];
    let {
      data: _0xda4544
    } = await _0x453b96.get("https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=" + _0x2f2134);
    let _0x40a9cd = _0xda4544.data;
    _0x1cb89b(_0x40a9cd);
    let _0x2d5b59 = _0x40a9cd.splice(0, 7);
    for (let _0x29b70b of _0x2d5b59) {
      _0x26b601.push({
        'body': proto.Message.InteractiveMessage.Body.fromObject({
          'text': null
        }),
        'footer': proto.Message.InteractiveMessage.Footer.fromObject({
          'text': wm 
        }),
        'header': proto.Message.InteractiveMessage.Header.fromObject({
          'title': '' + _0x29b70b.title,
          'hasMediaAttachment': true,
          'videoMessage': await _0x438e4e(_0x29b70b.nowm)
        }),
        'nativeFlowMessage': proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          'buttons': []
        })
      });
    }
    const _0x33ffca = generateWAMessageFromContent(_0x3585f0.chat, {
      'viewOnceMessage': {
        'message': {
          'messageContextInfo': {
            'deviceListMetadata': {},
            'deviceListMetadataVersion': 0x2
          },
          'interactiveMessage': proto.Message.InteractiveMessage.fromObject({
            'body': proto.Message.InteractiveMessage.Body.create({
              'text': "✨️ RESULTADO DE: " + _0x2f2134
            }),
            'footer': proto.Message.InteractiveMessage.Footer.create({
              'text': "[❗️] TIKTOK SEARCH"
            }),
            'header': proto.Message.InteractiveMessage.Header.create({
              'hasMediaAttachment': false
            }),
            'carouselMessage': proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              'cards': [..._0x26b601]
            })
          })
        }
      }
    }, {
      'quoted': _0x3585f0
    });
    await _0x1a6b0c.relayMessage(_0x3585f0.chat, _0x33ffca.message, {
      'messageId': _0x33ffca.key.id
    });
  } catch {
    await _0x1a6b0c.reply(error);
  }
};
handler.help = ["tiktoksearch <txt>"];
handler.estrellas = 1;
handler.register = true;
handler.tags = ["buscador"];
handler.command = ["tiktoksearch", "tts", "tiktoks"];
export default handler;
