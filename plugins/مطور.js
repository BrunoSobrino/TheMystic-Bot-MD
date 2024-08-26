import fetch from 'node-fetch';
import fs from 'fs';
import jimp from 'jimp';

let handler = async (m, { conn, usedPrefix, text, args, command }) => {
  let watermark = '𝘦𝘮𝘢𝘮 𝘢𝘣𝘰𝘭𝘦𝘭𝘢';

  // جهز الرسائل الوهمية المختلفة
  let fakeContact = { 
    'key': { 
      'participants': '0@s.whatsapp.net', 
      'remoteJid': 'status@broadcast', 
      'fromMe': false, 
      'id': watermark 
    }, 
    'message': { 
      'contactMessage': { 
        'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` 
      } 
    }, 
    'participant': '0@s.whatsapp.net' 
  };

  let fakeGif = {
    key: { 
      participant: '0@s.whatsapp.net', 
      ...('6289643739077-1613049930@g.us' ? {remoteJid: '6289643739077-1613049930@g.us'} : {}) 
    }, 
    message: { 
      'videoMessage': { 
        'title': '𝐆𝐎𝐉𝐎⚡𝐁𝐎𝐓', 
        'h': `Hmm`, 
        'seconds': '99999', 
        'gifPlayback': 'true', 
        'caption': watermark, 
        'jpegThumbnail': false
      } 
    }
  };

  let fakeLocation = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast'
    },
    message: {
      locationMessage: {
        degreesLatitude: 37.7749,
        degreesLongitude: -122.4194,
        name: 'فلسطين',
        address: 'مصر طنطا',
        url: 'https://www.google.com/maps/dir//%D9%85%D8%A8%D9%86%D9%89+%D8%A7%D9%84%D9%84%D8%BA%D8%A7%D8%AA+%D8%A7%D9%84%D8%A7%D8%AC%D9%86%D8%A8%D9%8A%D8%A9%D8%8C+%D8%B4%D8%A7%D8%B1%D8%B9+%D9%85%D8%B9%D8%A7%D9%88%D9%8A%D8%A9%D8%8C+%D8%B7%D9%86%D8%B7%D8%A7+(%D9%82%D8%B3%D9%85+2)%D8%8C+%D8%B7%D9%86%D8%B7%D8%A7,+Tanta+Qism+2,+Second+Tanta,+Gharbia+Governorate+@30.798597,31.001798%E2%80%AD%E2%80%AD/@30.7956921,31.0005774,15z/data=!4m7!4m6!1m1!4e2!1m2!1m1!1s0x14f7c96555618ee3:0x63741335d8f09c62!3e0'
      }
    }
  };

  let fakeText = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: 'status@broadcast'
    },
    message: {
      conversation: 'فلسطين حرة مهما كان الثمن ❤️🧞'
    }
  };

  let fakeMessages = [fakeGif, fakeContact, fakeLocation, fakeText];
  let randomFakeMessage = fakeMessages[Math.floor(Math.random() * fakeMessages.length)];

  let imageUrl = 'https://telegra.ph/file/b53923906c388dfecf608.jpg'; // رابط الصورة
  let randomPosterImage = 'https://i.imgur.com/RbaRjrb.jpeg'; // صورة العرض

  let recipient = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  let orderInfo = { 
    key: { 
      remoteJid: 'status@broadcast', 
      participant: '0@s.whatsapp.net' 
    }, 
    message: { 
      orderMessage: { 
        itemCount: 2023, 
        status: 1, 
        thumbnail: 'https://imgur.com/a/hi-DYdhJum?third_party=1', 
        surface: 1, 
        message: watermark, 
        orderTitle: watermark, 
        sellerJid: '0@s.whatsapp.net' 
      } 
    } 
  };

  let name = await conn.getName(recipient);

  let delay = time => new Promise(res => setTimeout(res, time));
  await conn.sendContact(m.chat, [[`201144480436@s.whatsapp.net`, watermark]], randomFakeMessage, {
    contextInfo: { 
      forwardingScore: 2023,
      isForwarded: false, 
      externalAdReply: {  
        title: '𝑇𝛨𝛯 𝛩𝑊𝛮𝛯𝑅 𝘦𝘮𝘢𝘮 𝘢𝘣𝘰𝘭𝘦𝘭𝘢', 
        body: watermark, 
        sourceUrl: 'https://whatsapp.com/channel/0029VaJxI9uJkK7BedTH0D11',
        thumbnail: randomPosterImage,
        thumbnailUrl: randomPosterImage, 
        mediaType: 1,
        showAdAttribution: true, 
        renderLargerThumbnail: true, 
        mentionedJid: [m.sender]
      }
    }
  }, { quoted: randomFakeMessage });
};

handler.help = ['owner', 'creator'];
handler.tags = ['info'];
handler.command = /^(owner|مطور|المطور)$/i;

export default handler;

async function getBuffer(url) {
  return new Promise(async (resolve, reject) => {
    let buffer;
    await jimp
      .read(url)
      .then((image) => {
        image.getBuffer(image._originalMime, function (err, res) {
          buffer = res;
        });
      })
      .catch(reject);
    if (!Buffer.isBuffer(buffer)) reject(false);
    resolve(buffer);
  });
    }
