import _0x36ae01 from 'axios';
const {
  generateWAMessageContent,
  generateWAMessageFromContent,
  proto
} = (await import("baileys"))["default"];
let handler = async (_0x10bd40, {
  conn: _0x9c7141,
  text: _0x27db11,
  usedPrefix: _0x55e61b,
  command: _0x5ad406
}) => {
  if (!_0x27db11) {
    return _0x9c7141.reply(_0x10bd40.chat, "[❗] *¿Que quieres buscar en pinterest?*", _0x10bd40);
  }
  async function _0x3f3fc7(_0x5f4723) {
    const {
      imageMessage: _0x14a396
    } = await generateWAMessageContent({
      'image': {
        'url': _0x5f4723
      }
    }, {
      'upload': _0x9c7141.waUploadToServer
    });
    return _0x14a396;
  }
  function _0x2af019(_0x27693a) {
    for (let _0x5ce07a = _0x27693a.length - 1; _0x5ce07a > 0; _0x5ce07a--) {
      const _0x4d6146 = Math.floor(Math.random() * (_0x5ce07a + 1));
      [_0x27693a[_0x5ce07a], _0x27693a[_0x4d6146]] = [_0x27693a[_0x4d6146], _0x27693a[_0x5ce07a]];
    }
  }
  let _0x51323f = [];
  let {
    data: _0x4fc489
  } = await _0x36ae01.get("https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D" + _0x27db11 + "&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22" + _0x27db11 + "%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559");
  let _0x5f34cb = _0x4fc489.resource_response.data.results.map(_0x33ba1c => _0x33ba1c.images.orig.url);
  _0x2af019(_0x5f34cb);
  let _0x3b2637 = _0x5f34cb.splice(0, 5);
  let _0x2913ed = 1;
  for (let _0x47c48a of _0x3b2637) {
    _0x51323f.push({
      'body': proto.Message.InteractiveMessage.Body.fromObject({
        'text': "Imagen -" + (" " + _0x2913ed++)
      }),
      'footer': proto.Message.InteractiveMessage.Footer.fromObject({
        'text': wm
      }),
      'header': proto.Message.InteractiveMessage.Header.fromObject({
        'title': '',
        'hasMediaAttachment': true,
        'imageMessage': await _0x3f3fc7(_0x47c48a)
      }),
      'nativeFlowMessage': proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        'buttons': [{
          'name': "cta_url",
          'buttonParamsJson': "{\"display_text\":\"url 📫\",\"Url\":\"https://www.pinterest.com/search/pins/?rs=typed&q=" + _0x27db11 + "\",\"merchant_url\":\"https://www.pinterest.com/search/pins/?rs=typed&q=" + _0x27db11 + "\"}"
        }]
      })
    });
  }
  const _0x1ca5c6 = generateWAMessageFromContent(_0x10bd40.chat, {
    'viewOnceMessage': {
      'message': {
        'messageContextInfo': {
          'deviceListMetadata': {},
          'deviceListMetadataVersion': 0x2
        },
        'interactiveMessage': proto.Message.InteractiveMessage.fromObject({
          'body': proto.Message.InteractiveMessage.Body.create({
            'text': "[❗] Resultado de : " + _0x27db11
          }),
          'footer': proto.Message.InteractiveMessage.Footer.create({
            'text': "🔎 `P I N T E R E S T - S E A R C H`"
          }),
          'header': proto.Message.InteractiveMessage.Header.create({
            'hasMediaAttachment': false
          }),
          'carouselMessage': proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            'cards': [..._0x51323f]
          })
        })
      }
    }
  }, {
    'quoted': _0x10bd40
  });
  await _0x9c7141.relayMessage(_0x10bd40.chat, _0x1ca5c6.message, {
    'messageId': _0x1ca5c6.key.id
  });
};
handler.help = ["pinterest"];
handler.tags = ["downloader"];
handler.command = /^(pinterest)$/i;
export default handler;
