
import fetch from "node-fetch"

let handler = async (m, { conn, isOwner, usedPrefix, command, args }) => {
	let query = "input text\nEx. .dirlia hello world\n<command> <tex>"
	let text
	if (args.length >= 1) {
		text = args.slice(0).join(" ")
	} else if (m.quoted && m.quoted.text) {
		text = m.quoted.text
	} else throw query
	try {
	m.reply(wait)
	 await Draw(text).then((img) => {
                conn.sendFile(m.chat, img, text, "*[ Result ]*\n" + text, m)
            })
      } catch (e) {
      throw eror
   }
            
}
handler.help = ["openjourney"]
handler.tags = ["misc"]
handler.command = /^(dirlia)$/i
export default handler


async function Draw(propmt) {
        const Blobs = await fetch(
      "https://api-inference.huggingface.co/models/prompthero/openjourney-v2",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer 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",
        },
        body: JSON.stringify({ inputs: propmt }),
      }
    )
      .then((res) => res.blob())
        const arrayBuffer = await Blobs.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return buffer
}
