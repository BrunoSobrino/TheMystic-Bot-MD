import fetch from "node-fetch"
import uploadImage from '../lib/uploadImage.js'
const { UploadToIBB } = await(await import("../lib/upload-to-ibb.js"));
let handler = async (m, { conn, args }) => {
	let q = m.quoted ? m.quoted : m
	let mime = (q.msg || q).mimetype || ''
	if (/image/.test(mime)) {
		await m.reply(wait)
		let media = await q.download()
		let lin = ["https://"]
		let noti = args[0] || 600
		let nita = lin.includes(args[0]) ? args[0] : (await uploadImage(media))
		
const sauce = await UploadToIBB(nita, noti, "3c1615980dcf693b282c4b0fb608b28a");
const parsedData = sauce.data;
const obj = findJsonPathsAndValues(parsedData);
const result = Object.entries(obj)
  .map(([key, value]) => `	◦  *${key.charAt(0).toUpperCase() + key.slice(1).split('.').join(' ')}* : ${value}`)
  .join('\n');
		await conn.reply(m.chat, `*乂 IBB UPLOAD*\n\n${result}`, m)
	} else throw 'قم بالاشارة للصورة التي تريد رفعها'
}
handler.help = ["toibb"]
handler.tags = ["tools"]
handler.command = ["ibb"]
export default handler

function findJsonPathsAndValues(data, prefixer = '') {
  let pathsAndValues = {};

  Object.entries(data).forEach(([key, value]) => {
    let fullPath = prefixer ? `${prefixer}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      pathsAndValues = { ...pathsAndValues, ...findJsonPathsAndValues(value, fullPath) };
    } else {
      pathsAndValues[fullPath] = value;
    }
  });

  return pathsAndValues;
}
