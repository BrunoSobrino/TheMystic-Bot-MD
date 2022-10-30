/* By https://github.com/FG98F/dylux-fg */
import twitterDl from 'fg-twitter'
let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args[0]) throw `✳️ Ejemplo : \n${usedPrefix + command} https://twitter.com/fernandavasro/status/1569741835555291139?t=ADxk8P3Z3prq8USIZUqXCg&s=19`
let res = await twitterDl(args[0])
try {
for (let result of res.download) {
let res = result.url.replace('https://ssstwitter.com', '')
conn.sendFile(m.chat, res, 'error.mp4', null, m)
}} catch {
await m.reply('✳️ Revise el link sea de un video de Twitter')
}}
handler.command = /^(twitter|tw)$/i
export default handler
