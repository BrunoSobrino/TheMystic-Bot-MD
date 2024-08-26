/* let handler = m => m;
handler.all = async function (m) {
  let chat = global.db.data.chats[m.chat];

  if (/^الجن|جن$/i.test(m.text)) {
    let vn =  'https://qu.ax/RQOw' ;
    conn.sendPresenceUpdate( 'recording' , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:  'audio/mpeg' , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^سبحانه$/i.test(m.text)) {
    let vn =  'https://qu.ax/nGFt.mp3' ;
    conn.sendPresenceUpdate( 'recording' , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:  'audio/mpeg' , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^علاوي$/i.test(m.text)) {
    let vn =  'https://qu.ax/vXcL.mp3' ;
    conn.sendPresenceUpdate( 'recording' , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:  'audio/mpeg' , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^دانس$/i.test(m.text)) {
    let vn =  'https://qu.ax/NDrj.m4a' ;
    conn.sendPresenceUpdate( 'recording' , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype: 'audio/mpeg' , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^هههه|ضحك$/i.test(m.text)) {
    let vn =  'https://qu.ax/PFyy.wav' ;
    conn.sendPresenceUpdate( 'recording' , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:  'audio/mpeg' , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }

  if (/^بضاني$/i.test(m.text)) {
    let vn = 'https://qu.ax/oOd';
    conn.sendPresenceUpdate('recording', m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype: 'audio/mpeg', fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^تبتبتينينثن$/i.test(m.text)) {
    let vn = 'https://qu.a';
    conn.sendPresenceUpdate('recording', m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype: 'audio/mpeg', fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^نو ريب$/i.test(m.text)) {
    let vn =  'https://qu.ax/pSra' ;
    conn.sendPresenceUpdate( 'recording' , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:  'audio/mpeg' , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^انا الادمن|هات رول|رول$/i.test(m.text)) {
    let vn =   'https://qu.ax/pEbX'  ;
    conn.sendPresenceUpdate(  'recording'  , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:   'audio/mpeg'  , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^راب فشيخ$/i.test(m.text)) {
    let vn =    'https://qu.ax/MGGw'   ;
    conn.sendPresenceUpdate(   'recording'   , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:    'audio/mpeg'   , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^دسوقي$/i.test(m.text)) {
    let vn =     'https://qu.ax/WOgR'    ;
    conn.sendPresenceUpdate(    'recording'    , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:     'audio/mpeg'    , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^سامو عليكو|السلام عليكم$/i.test(m.text)) {
    let vn =     'https://qu.ax/LASb.wav'    ;
    conn.sendPresenceUpdate(    'recording'    , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:     'audio/mpeg'    , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^الغزاله$/i.test(m.text)) {
    let vn =     'https://qu.ax/nlVt'    ;
    conn.sendPresenceUpdate(    'recording'    , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:     'audio/mpeg'    , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^ربنا يسمحك$/i.test(m.text)) {
    let vn =     'https://qu.ax/cZJu'    ;
    conn.sendPresenceUpdate(    'recording'    , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:     'audio/mpeg'    , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }
  if (/^خخ|خخخ|خخخخ|خخخخخخخ|خخخخخخ$/i.test(m.text)) {
    let vn =     'https://qu.ax/YYHr'    ;
    conn.sendPresenceUpdate(    'recording'    , m.chat);
    conn.sendMessage(m.chat, { audio: { url: vn }, ptt: true, mimetype:     'audio/mpeg'    , fileName: `shawaza_zizo_2024.opp` }, { quoted: m });
  }


  return !0;
};
export default handler;
