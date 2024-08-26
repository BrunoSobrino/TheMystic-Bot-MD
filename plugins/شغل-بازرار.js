import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import axios from 'axios';
import { youtubedl, youtubedlv2 } from '@bochilteam/scraper';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { command, usedPrefix, conn, args, text }) => {
  if (command === 'شغل') {
    if (!text) {
      await conn.sendMessage(m.chat, { text: `*❲ ❗ ❳ يرجي إدخال نص للبحث في يوتيوب .*\nمثال :\n> ➤  ${usedPrefix + command} القرآن الكريم\n> ➤  ${usedPrefix + command} https://youtu.be/JLWRZ8eWyZo?si=EmeS9fJvS_OkDk7p` }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
      return;
    }
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
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

      await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch {
      await conn.sendMessage(m.chat, { text: `*❲ ❗ ❳ حدث خطأ عند البحث في يوتيوب .*\nيرجي ادخال نص صحيح أو رابط مثال :\n> ➤  ${usedPrefix + command} القرآن الكريم\n> ➤  ${usedPrefix + command} https://youtu.be/JLWRZ8eWyZo?si=EmeS9fJvS_OkDk7p` }, { quoted: m });
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    }

  } else if (command.startsWith('mp3.')) {
    try {
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
      
      if (command === 'شغل.1') {
      
      try {
        const q = '128kbps';
        const v = text;
        const yt = await youtubedl(v).catch(async (_) => await youtubedlv2(v));
        const dl_url = await yt.audio[q].download();
        const ttl = await yt.title;
        const size = await yt.audio[q].fileSizeH;
        
        await conn.sendMessage(m.chat, { audio: { url: dl_url }, mimetype: 'audio/mpeg', fileName: `${ttl}.mp3` }, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
      } catch {
        try {
          const lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytaudio2?apikey=${lolkeysapi}&url=${text}`);
          const lolh = await lolhuman.json();
          const n = lolh.result.title || 'error';
          await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
          await conn.sendMessage(m.chat, {audio: {url: lolh.result.link}, mimetype: 'audio/mpeg', fileName: `${n}.mp3`}, {quoted: m});
          
        } catch {
          try {
            const searchh = await yts(text);
            const __res = searchh.all.map((v) => v).filter((v) => v.type == 'video');
            const infoo = await ytdl.getInfo('https://youtu.be/' + __res[0].videoId);
            const ress = await ytdl.chooseFormat(infoo.formats, {filter: 'audioonly'});
           await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
             conn.sendMessage(m.chat, {audio: {url: ress.url}, mimetype: 'audio/mpeg', fileName: __res[0].title + '.mp3'}, {quoted: m});
          } catch {
            await conn.reply(m.chat, '*❲ ❗ ❳ حدث خطأ عند جلب الملف من يوتيوب .*', m);
          }
        }
      }
      
      } else if (command === 'شغل.2') {
      
        try {
        const q = '128kbps';
        const v = text;
        const yt = await youtubedl(v).catch(async (_) => await youtubedlv2(v));
        const dl_url = await yt.audio[q].download();
        const ttl = await yt.title;
        const size = await yt.audio[q].fileSizeH;
        await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
        await conn.sendMessage(m.chat, {document: {url: dl_url}, mimetype: 'audio/mpeg', fileName: `${ttl}.mp3`}, {quoted: m});
        
      } catch {
        try {
          const lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytaudio2?apikey=${lolkeysapi}&url=${text}`);
          const lolh = await lolhuman.json();
          const n = lolh.result.title || 'error';
          await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
          await conn.sendMessage(m.chat, {document: {url: lolh.result.link}, fileName: `${n}.mp3`, mimetype: 'audio/mpeg'}, {quoted: m});
        } catch {
          try {
            const searchh = await yts(text);
            const __res = searchh.all.map((v) => v).filter((v) => v.type == 'video');
            const infoo = await ytdl.getInfo('https://youtu.be/' + __res[0].videoId);
            const ress = await ytdl.chooseFormat(infoo.formats, {filter: 'audioonly'});
           await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
             conn.sendMessage(m.chat, {audio: {url: ress.url}, fileName: __res[0].title + '.mp3', mimetype: 'audio/mp4'}, {quoted: m});
          } catch {
            await conn.reply(m.chat, '*❲ ❗ ❳ حدث خطأ عند جلب الملف من يوتيوب .*', m);
          }
        }
      }
      
      } else if (command === 'شغل.3') {
      
      try {
        const q = '128kbps';
        const v = text;
        const yt = await youtubedl(v).catch(async (_) => await youtubedlv2(v));
        const dl_url = await yt.audio[q].download();
        const ttl = await yt.title;
        const size = await yt.audio[q].fileSizeH;
        await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
        await conn.sendMessage(m.chat, {audio: {url: dl_url}, mimetype: 'audio/ogg; codecs=opus', ptt: true, fileName: `${ttl}.opus`}, {quoted: m});
       
       
      } catch {
        try {
          const lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytaudio2?apikey=${lolkeysapi}&url=${text}`);
          const lolh = await lolhuman.json();
          const n = lolh.result.title || 'error';
          await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
          await conn.sendMessage(m.chat, {audio: {url: lolh.result.link}, mimetype: 'audio/ogg; codecs=opus', ptt: true, fileName: `${n}.opus`}, {quoted: m});
          
          
        } catch {
          try {
            const searchh = await yts(text);
            const __res = searchh.all.map((v) => v).filter((v) => v.type == 'video');
            const infoo = await ytdl.getInfo('https://youtu.be/' + __res[0].videoId);
            const ress = await ytdl.chooseFormat(infoo.formats, {filter: 'audioonly'});
           await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
             conn.sendMessage(m.chat, {audio: {url: ress.url}, mimetype: 'audio/ogg; codecs=opus', ptt: true, fileName: __res[0].title + '.opus'},  {quoted: m});
             
             
          } catch {
            await conn.reply(m.chat, '*❲ ❗ ❳ حدث خطأ عند جلب الملف من يوتيوب .*', m);
          }
        }
      }
      
      }

    } catch (error) {
      await handleFallback(command, text, m, conn);
    }

  } else if (command.startsWith('mp4.')) {
    try {
      await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
      
      if (command === 'فديو') {
      
        try {
        const qu = '360';
        const q = qu + 'p';
        const v = text;
        const yt = await youtubedl(v).catch(async (_) => await youtubedlv2(v));
        const dl_url = await yt.video[q].download();
        const ttl = await yt.title;
        const size = await yt.video[q].fileSizeH;
        await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
         await conn.sendMessage(m.chat, {video: {url: dl_url}, caption: `➤ العنوان : ${ttl}\n➤ الحجم : ${size}`}, {quoted: m});
         
         
      } catch {
        try {
          const mediaa = await ytMp4(text);
          await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
            await conn.sendMessage(m.chat, {video: {url: dl_url}, caption: cap}, {quoted: m});
        } catch {
          try {
            const lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytvideo2?apikey=${lolkeysapi}&url=${text}`);
            const lolh = await lolhuman.json();
            const n = lolh.result.title || 'error';
            const n2 = lolh.result.link;
            const n3 = lolh.result.size;
            const n4 = lolh.result.thumbnail;
            await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
            await conn.sendMessage(m.chat, {video: {url: n2}, caption: `➤ العنوان : ${n}\n➤ الحجم : ${n3}`}, {quoted: m});
          } catch {
            await conn.reply(m.chat, `*❲ ❗ ❳ حدث خطأ عند جلب الملف من يوتيوب .*`, m);
          }
  }}
      
        
      } else if (command === 'فديو.2') {
      
        try {
        const qu = '360';
        const q = qu + 'p';
        const v = text;
        const yt = await youtubedl(v).catch(async (_) => await youtubedlv2(v));
        const dl_url = await yt.video[q].download();
        const ttl = await yt.title;
        const size = await yt.video[q].fileSizeH;
        await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
        await conn.sendMessage(m.chat, {document: {url: dl_url}, fileName: `${ttl}.mp4`, mimetype: 'video/mp4', caption: `➤ العنوان : ${ttl}\n➤ الحجم : ${size}`, thumbnail: await fetch(yt.thumbnail)}, {quoted: m});
        
        
      } catch {
        try {
          const mediaa = await ytMp4(text);
          await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
          await conn.sendMessage(m.chat, {document: {url: dl_url}, caption: cap, mimetype: 'video/mp4', fileName: ttl + `.mp4`}, {quoted: m});
        } catch {
          try {
            const lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytvideo2?apikey=${lolkeysapi}&url=${text}`);
            const lolh = await lolhuman.json();
            const n = lolh.result.title || 'error';
            const n2 = lolh.result.link;
            const n3 = lolh.result.size;
            const n4 = lolh.result.thumbnail;
            await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
            await conn.sendMessage(m.chat, {document: {url: n2}, fileName: `${n}.mp4`, mimetype: 'video/mp4', caption: `➤ العنوان : ${n}\n➤ الحجم : ${n3}`, thumbnail: await fetch(n4)}, {quoted: m});
          } catch {
            await conn.reply(m.chat, `*❲ ❗ ❳ حدث خطأ عند جلب الملف من يوتيوب .*`, m);
          }
  }}     
        
      } else if (command === 'فديو.3') {
      
        try {
        const qu = '360';
        const q = qu + 'p';
        const v = text;
        const yt = await youtubedl(v).catch(async (_) => await youtubedlv2(v));
        const dl_url = await yt.video[q].download();
        const ttl = await yt.title;
        const size = await yt.video[q].fileSizeH;
        await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
         await conn.sendMessage(m.chat, {video: {url: dl_url}, gifPlayback: true, caption: `➤ العنوان : ${ttl}\n➤ الحجم : ${size}`}, {quoted: m});
         
        
      } catch {
        try {
          const mediaa = await ytMp4(text);
          await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
            await conn.sendMessage(m.chat, {video: {url: dl_url}, gifPlayback: true, caption: cap}, {quoted: m});
        } catch {
          try {
            const lolhuman = await fetch(`https://api.lolhuman.xyz/api/ytvideo2?apikey=${lolkeysapi}&url=${text}`);
            const lolh = await lolhuman.json();
            const n = lolh.result.title || 'error';
            const n2 = lolh.result.link;
            const n3 = lolh.result.size;
            const n4 = lolh.result.thumbnail;
            await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
            await conn.sendMessage(m.chat, {video: {url: n2}, gifPlayback: true, caption: `➤ العنوان : ${n}\n➤ الحجم : ${n3}`}, {quoted: m});
          } catch {
            await conn.reply(m.chat, `*❲ ❗ ❳ حدث خطأ عند جلب الملف من يوتيوب .*`, m);
          }
  }}
      
      }

    } catch (error) {
      await handleFallback(command, text, m, conn);
    }
  }
};

handler.command = /^(شغل|شغل.1|شغل.2|شغل.3|فديو|فديو.2|فديو.3)$/i;
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

/*async function ytMp3(url) {
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
}*/

async function ytMp3(url) {
  return new Promise((resolve, reject) => {
    ytdl.getInfo(url).then(async (getUrl) => {
      const result = [];
      for (let i = 0; i < getUrl.formats.length; i++) {
        const item = getUrl.formats[i];
        if (item.mimeType == 'audio/webm; codecs=\"opus\"') {
          const {contentLength} = item;
          const bytes = await bytesToSize(contentLength);
          result[i] = {audio: item.url, size: bytes};
        }
      }
      const resultFix = result.filter((x) => x.audio != undefined && x.size != undefined);
      const tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].audio}`);
      const tinyUrl = tiny.data;
      const title = getUrl.videoDetails.title;
      const thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
      resolve({title, result: tinyUrl, result2: resultFix, thumb});
    }).catch(reject);
  });
}

async function ytMp4(url) {
  return new Promise(async (resolve, reject) => {
    ytdl.getInfo(url).then(async (getUrl) => {
      const result = [];
      for (let i = 0; i < getUrl.formats.length; i++) {
        const item = getUrl.formats[i];
        if (item.container == 'mp4' && item.hasVideo == true && item.hasAudio == true) {
          const {qualityLabel, contentLength} = item;
          const bytes = await bytesToSize(contentLength);
          result[i] = {video: item.url, quality: qualityLabel, size: bytes};
        }
      }
      const resultFix = result.filter((x) => x.video != undefined && x.size != undefined && x.quality != undefined);
      const tiny = await axios.get(`https://tinyurl.com/api-create.php?url=${resultFix[0].video}`);
      const tinyUrl = tiny.data;
      const title = getUrl.videoDetails.title;
      const thumb = getUrl.player_response.microformat.playerMicroformatRenderer.thumbnail.thumbnails[0].url;
      resolve({title, result: tinyUrl, rersult2: resultFix[0].video, thumb});
    }).catch(reject);
  });
}

async function ytPlay(query) {
  return new Promise((resolve, reject) => {
    yts(query).then(async (getData) => {
      const result = getData.videos.slice( 0, 5 );
      const url = [];
      for (let i = 0; i < result.length; i++) {
        url.push(result[i].url);
      }
      const random = url[0];
      const getAudio = await ytMp3(random);
      resolve(getAudio);
    }).catch(reject);
  });
}

async function ytPlayVid(query) {
  return new Promise((resolve, reject) => {
    yts(query).then(async (getData) => {
      const result = getData.videos.slice( 0, 5 );
      const url = [];
      for (let i = 0; i < result.length; i++) {
        url.push(result[i].url);
      }
      const random = url[0];
      const getVideo = await ytMp4(random);
      resolve(getVideo);
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
