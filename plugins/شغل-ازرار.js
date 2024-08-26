import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { command, usedPrefix, conn, args, text }) => {
  if (command === 'حمل') {
    if (!text) throw `*❲ ❗ ❳ يرجي إدخال نص للبحث في يوتيوب .*\nمثال :\n> ➤  ${usedPrefix + command} القرآن الكريم\n> ➤  ${usedPrefix + command} https://youtu.be/JLWRZ8eWyZo?si=EmeS9fJvS_OkDk7p`;

    try {
      const yt_play = await search(args.join(' '));
      const dataMessage = `*❲ نتيجة البحث عن : ${text} ❳*\n➤ العنوان : ${yt_play[0].title}\n➤ النشر : ${yt_play[0].ago}\n➤ الطول : ${secondString(yt_play[0].duration.seconds)}\n➤ الرابط : ${yt_play[0].url}\n➤ المشاهدات : ${MilesNumber(yt_play[0].views)}\n➤ الصانع : ${yt_play[0].author.name}\n➤ القناة : ${yt_play[0].author.url}`.trim();

      const iturl = yt_play[0].url;
      const itimg = yt_play[0].thumbnail;
      const messa = await prepareWAMessageMedia({ image: { url: itimg } }, { upload: conn.waUploadToServer });

      let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              body: { text: dataMessage },
              footer: { text: `©${global.wm}`.trim() },
              header: {
                hasMediaAttachment: true,
                imageMessage: messa.imageMessage,
              },
              nativeFlowMessage: {
                buttons: [
                  { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'صوتي', id: `${usedPrefix}mp3.1 ${iturl}` }) },
                  { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ملف صوتي', id: `${usedPrefix}mp3.2 ${iturl}` }) },
                  { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ريكورد', id: `${usedPrefix}mp3.3 ${iturl}` }) },
                  { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'فيديو', id: `${usedPrefix}mp4.1 ${iturl}` }) },
                  { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'ملف فيديو', id: `${usedPrefix}mp4.2 ${iturl}` }) },
                  { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'جيف', id: `${usedPrefix}mp4.3 ${iturl}` }) },
                ],
                messageParamsJson: "",
              },
            },
          },
        },
      }, { userJid: conn.user.jid, quoted: m });

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch {
      throw `*❲ ❗ ❳ حدث خطأ عند البحث في يوتيوب .*\nيرجي ادخال نص صحيح أو رابط مثال :\n> ➤  ${usedPrefix + command} القرآن الكريم\n> ➤  ${usedPrefix + command} https://youtu.be/JLWRZ8eWyZo?si=EmeS9fJvS_OkDk7p`;
    }

  } else if (command.startsWith('mp3.')) {
    try {
      const q = '128kbps';
      const v = text;
      const yt = await youtubedl(v).catch(async () => await youtubedlv2(v));
      const dl_url = await yt.audio[q].download();
      const ttl = await yt.title;

      if (command === 'mp3.1') {
        await conn.sendMessage(m.chat, { audio: { url: dl_url }, mimetype: 'audio/mpeg', fileName: `${ttl}.mp3` }, { quoted: m });
      } else if (command === 'mp3.2') {
        await conn.sendMessage(m.chat, { document: { url: dl_url }, mimetype: 'audio/mpeg', fileName: `${ttl}.mp3` }, { quoted: m });
      } else if (command === 'mp3.3') {
        await conn.sendMessage(m.chat, { audio: { url: dl_url }, mimetype: 'audio/ogg; codecs=opus', ptt: true, fileName: `${ttl}.opus` }, { quoted: m });
      }

    } catch (error) {
      await handleFallback(command, text, m, conn);
    }

  } else if (command.startsWith('mp4.')) {
    try {
      const qu = '360';
      const q = `${qu}p`;
      const v = text;
      const yt = await youtubedl(v).catch(async () => await youtubedlv2(v));
      const dl_url = await yt.video[q].download();
      const ttl = await yt.title;
      const size = await yt.video[q].fileSizeH;

      if (command === 'mp4.1') {
        await conn.sendMessage(m.chat, { video: { url: dl_url }, caption: `➤ العنوان : ${ttl}\n➤ الحجم : ${size}` }, { quoted: m });
      } else if (command === 'mp4.2') {
        await conn.sendMessage(m.chat, { document: { url: dl_url }, fileName: `${ttl}.mp4`, mimetype: 'video/mp4', caption: `➤ العنوان : ${ttl}\n➤ الحجم : ${size}`, thumbnail: await fetch(yt.thumbnail) }, { quoted: m });
      } else if (command === 'mp4.3') {
        await conn.sendMessage(m.chat, { video: { url: dl_url }, gifPlayback: true, caption: `➤ العنوان : ${ttl}\n➤ الحجم : ${size}` }, { quoted: m });
      }

    } catch (error) {
      await handleFallback(command, text, m, conn);
    }
  }
};

handler.command = /^(حمل|mp3.1|mp3.2|mp3.3|mp4.1|mp4.2|mp4.3)$/i;
export default handler;

async function search(query, options = {}) {
  const search = await yts.search({ query, hl: 'ar', gl: 'AR', ...options });
  return search.videos;
}

function MilesNumber(number) {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g;
  const rep = '$1.';
  const arr = number.toString().split('.');
  arr[0] = arr[0].replace(exp, rep);
  return arr[1] ? arr.join('.') : arr[0];
}

function secondString(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return 'n/a';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  return i === 0 ? `${bytes} ${sizes[i]}` : `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
}

async function ytMp3(url) {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(url).then(async (getUrl) => {
      const result = [];
      for (let i = 0; i < getUrl.formats.length; i++) {
        const item = getUrl.formats[i];
        if (item.mimeType === 'audio/webm; codecs="opus"') {
          const { contentLength } = item;
          const bytes = await bytesToSize(contentLength);
          result[i] = { audio: item.url, size: bytes };
        }
      }
      const fix = result.filter((x) => x.audio !== undefined && x.size !== undefined);
      resolve(fix[0]);
    }).catch(reject);
  });
}

async function handleFallback(command, text, m, conn) {
  const isMp3 = command.startsWith('mp3.');
  const result = await ytMp3(text);

  if (isMp3) {
    await conn.sendMessage(m.chat, { audio: { url: result.audio }, fileName: `audio.mp3`, mimetype: 'audio/mpeg', ptt: false, fileLength: result.size }, { quoted: m });
  } else {
    await conn.sendMessage(m.chat, { video: { url: result.audio }, fileName: `video.mp4`, mimetype: 'video/mp4', fileLength: result.size }, { quoted: m });
  }
}
