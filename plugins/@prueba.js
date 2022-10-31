import * as e from "fs";
let handler = async (m, { conn, usedPrefix: t }) => {
let n = await conn.getName(m.sender),
l = global.owner.filter(([m, conn]) => m && conn);
for (let [r, i] of l) {
let o = "BEGIN:VCARD\nVERSION:3.0\nFN:" + 'BrunoSobrino' + "\nORG:The Shadow Brokers - TEAM;\nitem1.TEL;waid=5219992095479:+52 1 999 209 5479\nitem1.X-ABLabel:Creador Oficial 👑\nitem2.TEL;waid=" + r.replace(/[^0-9]/g, "") + ":+" + r.replace(/[^0-9]/g, "") + "\nitem2.X-ABLabel:\uD83E\uDD1D Due\xf1o actual 🤖\nitem3.EMAIL;type=INTERNET:theshadowbrokers133@gmail.com\nitem3.X-ABLabel:Email\nitem4.URL;Web:https://www.paypal.me/theshadowbrokers133\nitem4.ADR:;;\uD83C\uDDF5\uD83C\uDDEA México;;;;\nitem5.X-ABLabel:\nEND:VCARD";
conn.sendMessage(m.chat, {
contacts: {
displayName: "BrunoSobrino",
contacts: [{ vcard: o }]}}, { quoted: m })}}
handler.command = /^(prueba)$/i
export default handler
