let axios = require("axios");
let uploadImage = require("../lib/uploadImage.js");

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
	let q = m.quoted ? m.quoted : m;
	let mime = (q.msg || q).mimetype || "";
	if (!mime) return conn.reply(m.chat, "Send/Reply Images with the caption *.bgcolor*", m)
	if (!text) return conn.reply(m.chat, "Send/Reply Images with the caption *.bgcolor*", m)
	await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }})
	let media = await q.download();
	let urll = await uploadImage(media);
	let res = await bgColor(urll, text);
	conn.sendMessage(m.chat, {
		image: res,
		caption: '```Success...\nDont forget to donate```',
	});
};
handler.help = ["bgcolor *<text>*"];
handler.tags = ['tools'];
handler.command = /^(bgcolor)$/i;

handler.premium = true;

module.exports = handler;

const bgColor = (url, color) => {
	return new Promise(async (resolve, reject) => {
		const payload = {
			image_file_b64: "",
			image_url: url,
			size: "preview",
			type: "auto",
			type_level: "1",
			format: "auto",
			roi: "0% 0% 100% 100%",
			crop: false,
			crop_margin: "0",
			scale: "original",
			position: "original",
			channels: "rgba",
			add_shadow: false,
			semitransparency: true,
			bg_color: color,
			bg_image_url: "",
		};
		await axios({
			method: "POST",
			url: "https://api.remove.bg/v1.0/removebg",
			data: payload,
			headers: {
				accept: "application/json",
				"X-API-Key": "UgjxxGCBGrEy98UwMwziHLp2",
				"Content-Type": "application/json",
			},
		})
			.then((res) => {
				const buffer = Buffer.from(res.data.data.result_b64, "base64");
				resolve(buffer);
			})
			.catch((e) => {
				resolve(e?.response);
			});
	});
};
