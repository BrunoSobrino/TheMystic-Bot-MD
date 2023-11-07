import fetch from 'node-fetch';
const handler = async (m, {conn, command, usedPrefix}) => {
  if (!db.data.chats[m.chat].modohorny && m.isGroup) throw '*تحمل مسؤوليتك مع الله عز وجل الأوامر ليست من صنعي*';
  switch (command) {
    case 'pack':
      const url = await pack[Math.floor(Math.random() * pack.length)];
      conn.sendMessage(m.chat, {image: {url: url}, caption: `سلومة الله يهديك`}, {quoted: m});
      break;
    case 'pack2':
      const url2 = await packgirl[Math.floor(Math.random() * packgirl.length)];
      conn.sendMessage(m.chat, {image: {url: url2}, caption: `سلومة الله يهديك`}, {quoted: m});
      break;
    case 'pack3':
      const url3 = await packmen[Math.floor(Math.random() * packmen.length)];
      conn.sendMessage(m.chat, {image: {url: url3}, caption: `سلومة الله يهديك`}, {quoted: m});
      break;
    case 'videoxxx': case 'vídeoxxx':
      const url4 = await videosxxxc[Math.floor(Math.random() * videosxxxc.length)];
      await conn.sendMessage(m.chat, {video: {url: url4}, caption: `*ᴅɪsғʀᴜᴛᴀ ᴅᴇʟ ᴠɪᴅᴇᴏ 🥵*`}, {quoted: m});
      break;
    case 'videoxxxlesbi': case 'videolesbixxx': case 'pornolesbivid': case 'pornolesbianavid': case 'pornolesbiv': case 'pornolesbianav': case 'pornolesv':
      const url5 = await videosxxxc2[Math.floor(Math.random() * videosxxxc2.length)];
      await conn.sendMessage(m.chat, {video: {url: url5}, caption: `*ᴅɪsғʀᴜᴛᴀ ᴅᴇʟ ᴠɪᴅᴇᴏ 🥵*`}, {quoted: m});
      break;
  }
};
handler.command = /^(pack|pack2|pack3|videoxxx|vídeoxxx|videoxxxlesbi|videolesbixxx|pornolesbivid|pornolesbianavid|pornolesbiv|pornolesbianav|pornolesv)$/i;
export default handler;

global.pack = [
  'https://telegra.ph/Img-11-07-13',
  
  
];
global.packmen = [
  'https://telegra.ph/file/bf303b19b9834f90e9617.jpg',
  
];
global.videosxxxc = [
  'https://telegra.ph/file/4a270d9945ac46f42d95c.mp4',
  'https://telegra.ph/file/958c11e84d271e783ea3f.mp4',
  'https://telegra.ph/file/f753759342337c4012b3f.mp4',
  'https://telegra.ph/file/379cee56c908dd536dd33.mp4',
  'https://telegra.ph/file/411d8f59a5cefc2a1d227.mp4',
  'https://telegra.ph/file/ee2cf1b359d6eef50d7b7.mp4',
  'https://telegra.ph/file/1e316b25c787f94a0f8fd.mp4',
  'https://telegra.ph/file/c229d33edce798cde0ca4.mp4',
  'https://telegra.ph/file/b44223e72dd7e80e415f2.mp4',
  'https://telegra.ph/file/61486d45a8a3ea95a7c86.mp4',
  'https://telegra.ph/file/76ba0dc2a07f491756377.mp4',
  'https://telegra.ph/file/831bb88f562bef3f1a15d.mp4',
  'https://telegra.ph/file/ee2cf1b359d6eef50d7b7.mp4',
  'https://telegra.ph/file/598857924f3a29ffd37ae.mp4',
  'https://telegra.ph/file/528caef6ea950ec45aeef.mp4',
  'https://telegra.ph/file/4a270d9945ac46f42d95c.mp4',
  'https://telegra.ph/file/958c11e84d271e783ea3f.mp4',
  'https://telegra.ph/file/f753759342337c4012b3f.mp4',
  'https://telegra.ph/file/379cee56c908dd536dd33.mp4',
  'https://telegra.ph/file/411d8f59a5cefc2a1d227.mp4',
  'https://telegra.ph/file/76ba0dc2a07f491756377.mp4',
  'https://telegra.ph/file/831bb88f562bef3f1a15d.mp4',
];

global.videosxxxc2 = [
"https://telegra.ph/file/2dfb1ad0cab22951e30d1.mp4",
"https://telegra.ph/file/c430651857023968d3a76.mp4",
"https://telegra.ph/file/1ba17f6230dd1ea2de48c.mp4",
"https://telegra.ph/file/e04b802f12aafee3d314e.mp4",
"https://telegra.ph/file/a58661697d519d3d0acbd.mp4",
"https://telegra.ph/file/9ed60b18e79fcfebcd76c.mp4",
"https://telegra.ph/file/d58096000ad5eaef0b05e.mp4",
"https://telegra.ph/file/60b4c8ebeadebb7e0da06.mp4"
];
