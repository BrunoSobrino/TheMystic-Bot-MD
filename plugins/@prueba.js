import * as e from "fs";
let handler = async (m, { conn, usedPrefix: t }) => {
let n = await a.getName(m.sender),
let l = global.suittag.filter(([m, conn]) => m && conn);
for (let [r, i] of l) {
let o = "BEGIN:VCARD\nVERSION:3.0\nFN:" + 'BrunoSobrino' + "\nORG:Otakus Tecnol\xf3gicos;\nitem1.TEL;waid=51957041866:+51 957 041 866\nitem1.X-ABLabel:⚡ Creadora Principal\nitem2.TEL;waid=" + r.replace(/[^0-9]/g, "") + ":+" + r.replace(/[^0-9]/g, "") + "\nitem2.X-ABLabel:\uD83E\uDD1D Due\xf1o actual\nitem3.EMAIL;type=INTERNET:https://www.paypal.me/theshadowbrokers133\nitem3.X-ABLabel:Email\nitem4.URL;Web:https://latam-api.vercel.app/\nitem4.ADR:;;\uD83C\uDDF5\uD83C\uDDEA Peru;;;;\nitem5.X-ABLabel:How Sexy You Are " + n + "! 7w7r\nEND:VCARD";
conn.sendMessage(m.chat, {
contacts: {
displayName: "NeKosmic",
contacts: [{ vcard: o }]}}, {
quoted: { key: { participant: "0@s.whatsapp.net" },
message: { contactMessage: { displayName: wm }}
}})}}
handler.command = /^(prueba)$/i
export default handler
