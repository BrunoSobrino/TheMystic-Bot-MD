
import fetch from "node-fetch";
import uploadFile from '../lib/uploadFile.js'
import uploadImage from '../lib/uploadImage.js'


const mimeAudio = 'audio/mpeg';
const mimeVideo = 'video/mp4';
const mimeImage = 'image/jpeg';

let handler = async (m, { conn, command, args }) => {
  let teks
    if (args.length >= 1) {
        teks = args.slice(0).join(" ")
    } else if (m.quoted && m.quoted.text) {
        teks = m.quoted.text
    }

  if (m.quoted && m.quoted.mtype) {
    const mtype = m.quoted.mtype;
    let type;

    if (mtype === 'audioMessage') {
      type = 'vn';
    } else if (mtype === 'videoMessage') {
      type = 'vid';
    } else if (mtype === 'imageMessage') {
      type = 'img';
    } else if (mtype === 'extendedTextMessage') {
      type = 'txt';
    } else {
      throw "❌ نوع الوسائط غير صالح!";
    }

    const doc = {};

    if (type === 'vn') {
      const link = await (type === 'img' ? uploadImage : uploadFile)(await m.quoted.download());
      doc.mimetype = mimeAudio;
      doc.audio = { url: link } ? { url: link } : generateVoice("id-ID", "id-ID-ArdiNeural", teks);
    } else if (type === 'vid') {
      const link = await (type === 'img' ? uploadImage : uploadFile)(await m.quoted.download());
      doc.mimetype = mimeVideo;
      doc.caption = teks;
      doc.video = { url: link } ? { url: link } : { url: giflogo };
    } else if (type === 'img') {
      const link = await (type === 'img' ? uploadImage : uploadFile)(await m.quoted.download());
      doc.mimetype = mimeImage;
      doc.caption = teks;
      doc.image = { url: link } ? { url: link } : { url: logo };
    } else if (type === 'txt') {
      doc.text = teks;
    }

    await conn.sendMessage('status@broadcast', doc, {
      backgroundColor: getRandomHexColor(),
      font: Math.floor(Math.random() * 9),
      statusJidList: Object.keys(global.db.data.users)
    }).then((res) => {
      conn.reply(m.chat, `*تم بنجاح نشر  ${type} في حالة الواتساب الخاص بك*`, res);
    }).catch(() => {
      conn.reply(m.chat, `Gagal upload ${type}`, m);
    });
  } else {
    throw "هذا الامر من خلاله يمكنك ان تنشر سطوري في الواتساب بدون الخروج من المحاذثة كيف ذلك ? سوف ترسل للبوت الخاص بك الصورة او الفيديو او الأديو الذي تريد ان تنشره في الواتساب بدون الخروج من المحاذثة ثم تشير له وتكتب \n\n*.tostatus*";
  }
};

handler.help = ['tostatus']
handler.tags = ["owner"];
handler.command = ['tostatus']
handler.owner = true
export default handler;

async function generateVoice(Locale = "id-ID", Voice = "id-ID-ArdiNeural", Query) {
  const formData = new FormData();
  formData.append("locale", Locale);
  formData.append("content", `<voice name="${Voice}">${Query}</voice>`);
  formData.append("ip", '46.161.194.33');
  const response = await fetch('https://app.micmonster.com/restapi/create', {
    method: 'POST',
    body: formData
  });
  return Buffer.from(('data:audio/mpeg;base64,' + await response.text()).split(',')[1], 'base64');
}

function getRandomHexColor() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
                          }
