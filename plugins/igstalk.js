import axios from 'axios'
import cheerio from 'cheerio'
import fetch from 'node-fetch'
let handler = async (m, { conn, args, usedPrefix, command }) => {
if (!args[0]) throw `${lenguajeGB['smsAvisoMG']()}ادخل الإسم المستخدم الإنسغرام\nعلى سبيل المثال n*${usedPrefix + command} f.b.i_ys._ess._ui_.di_man_6000*\n\nادخل الإسم المستخدم الإنستغرام\nعلى سبيل المثال \n*${usedPrefix + command} f.b.i_ys._ess._ui_.di_man_6000*`
const {key} = await conn.sendMessage(m, {text: wait})
await conn.sendMessage(m, {text: waitt, edit: key})
await conn.sendMessage(m, {text: waittt, edit: key})
await conn.sendMessage(m, {text: waitttt, edit: key})
let res = await igstalk(args[0].replace(/^@/, ''))
let res2 = await fetch(`https://api.lolhuman.xyz/api/stalkig/${args[0].replace(/^@/, '')}?apikey=${lolkeysapi}`)
let res3 = await res2.json()
let json = JSON.parse(JSON.stringify(res))
let iggs = `
┃ 𓃠 *${gt} ${vs}*
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝙉𝙊𝙈𝘽𝙍𝙀 | 𝙉𝘼𝙈𝙀
┃ *${json.username}*
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝙐𝙎𝙐𝘼𝙍𝙄𝙊(𝘼) | 𝙐𝙎𝙀𝙍
┃ *${json.fullname}*
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝙀𝙉𝙇𝘼𝘾𝙀 | 𝙇𝙄𝙉𝙆
┃ *https://instagram.com/${json.username.replace(/^@/, '')}*
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝙎𝙀𝙂𝙐𝙄𝘿𝙊𝙍𝙀𝙎 | 𝙁𝙊𝙇𝙇𝙊𝙒𝙀𝙍𝙎 
┃ *${json.followers}* 
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝙎𝙀𝙂𝙐𝙄𝘿𝙊𝙎 | 𝙁𝙊𝙇𝙇𝙊𝙒𝙄𝙉𝙂
┃ *${json.following}* 
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ 
┃ 𝙋𝙐𝘽𝙇𝙄𝘾𝘼𝘾𝙄𝙊𝙉𝙀𝙎 | 𝙋𝙊𝙎𝙏𝙎
┃ *${json.post}*
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝘽𝙄𝙊𝙂𝙍𝘼𝙁Í𝘼 | 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝙏𝙄𝙊𝙉
┃ *${json.bio}*`.trim() 
let aa = `${res3.result.photo_profile || res.profile}`
await conn.sendFile(m.chat, aa, 'error.jpg', iggs, m)
conn.reply(m.chat, `${lenguajeGB['smsAvisoIIG']()}💖 *تعرف على الأخبار وتذكر أن يكون لديك الإصدار الأحدث*\n\n💝 *تعرف على الجديد وتذكر أن يكون لديك الإصدار الأحدث*`, m, {
contextInfo: { externalAdReply :{ mediaUrl: null, mediaType: 1, description: null, 
title: 'Essaouidi | Yassine',
body: 'Super Bot WhatsApp',         
previewType: 0, thumbnail: fs.readFileSync("./media/menus/Menu3.jpg"),
sourceUrl: `https://github.com/GataNina-Li/GataBot-MD`}}})}
handler.help = ['igstalk'].map(v => v + ' <username>')
handler.tags = ['downloader']
handler.command = /^(igstalk|verig|igver)$/i
handler.exp = 80
handler.money = 150
handler.level = 3
handler.register = true
export default handler

async function igstalk(Username) {
return new Promise((resolve, reject) => {
axios.get('https://dumpor.com/v/'+Username, {
headers: { "cookie": "_inst_key=SFMyNTY.g3QAAAABbQAAAAtfY3NyZl90b2tlbm0AAAAYWGhnNS1uWVNLUU81V1lzQ01MTVY2R0h1.fI2xB2dYYxmWqn7kyCKIn1baWw3b-f7QvGDfDK2WXr8", "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36" }}).then(res => {
const $ = cheerio.load(res.data)
const result = {
profile: $('#user-page > div.user > div.row > div > div.user__img').attr('style').replace(/(background-image: url\(\'|\'\);)/gi, ''),
fullname: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > a > h1').text(),
username: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > h4').text(),
post: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(1)').text().replace(' Posts',''),
followers: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(2)').text().replace(' Followers',''),
following: $('#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(3)').text().replace(' Following',''),
bio: $('#user-page > div.user > div > div.col-md-5.my-3 > div').text()}
resolve(result)})})}


/*import { instagramStalk } from '@bochilteam/scraper'

let handler= async (m, { args, usedPrefix, command }) => {
if (!args[0]) throw `${lenguajeGB['smsAvisoMG']()}𝙄𝙉𝙂𝙍𝙀𝙎𝙀 𝙀𝙇 𝙐𝙎𝙐𝘼𝙍𝙄𝙊 𝘿𝙀 𝘼𝙇𝙂𝙐𝙄𝙀𝙉 𝘿𝙀 𝙄𝙉𝙎𝙏𝘼𝙂𝙍𝘼𝙈\n𝙀𝙅𝙀𝙈𝙋𝙇𝙊\n*${usedPrefix + command} gatadios*\n\n𝙀𝙉𝙏𝙀𝙍 𝙄𝙉𝙎𝙏𝘼𝙂𝙍𝘼𝙈 𝙐𝙎𝙀𝙍𝙉𝘼𝙈𝙀\n𝙀𝙓𝘼𝙈𝙋𝙇𝙀\n*${usedPrefix + command} gata_dios*`
const {
username,
name,
description,
followersH,
followingH,
postsH,
} = await instagramStalk(args[0])
m.reply(`
┃ 𓃠 *${gt} ${vs}*
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝙉𝙊𝙈𝘽𝙍𝙀 | 𝙉𝘼𝙈𝙀
┃ *${name}*
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝙐𝙎𝙐𝘼𝙍𝙄𝙊(𝘼) | 𝙐𝙎𝙀𝙍
┃ *${username}*
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝙀𝙉𝙇𝘼𝘾𝙀 | 𝙇𝙄𝙉𝙆
┃ *https://instagram.com/${username.replace(/^@/, '')}*
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝙎𝙀𝙂𝙐𝙄𝘿𝙊𝙍𝙀𝙎 | 𝙁𝙊𝙇𝙇𝙊𝙒𝙀𝙍𝙎 
┃ *${followersH}* 
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝙎𝙀𝙂𝙐𝙄𝘿𝙊𝙎 | 𝙁𝙊𝙇𝙇𝙊𝙒𝙄𝙉𝙂
┃ *${followingH}* 
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈ 
┃ 𝙋𝙐𝘽𝙇𝙄𝘾𝘼𝘾𝙄𝙊𝙉𝙀𝙎 | 𝙋𝙊𝙎𝙏𝙎
┃ *${postsH}* 
┃┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
┃ 𝘽𝙄𝙊𝙂𝙍𝘼𝙁Í𝘼 | 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝙏𝙄𝙊𝙉
┃ *${description}*
`.trim()) 
  
  let info = `💖 *Infórmate sobre las Novedades y recuerda tener la última versión.*\n\n💝 *Find out about what's new and remember to have the latest version.*
  `
 conn.sendButton(m.chat, info, `𝙂𝘼𝙏𝘼 𝘿𝙄𝙊𝙎 - 𝘼𝙎𝙄𝙎𝙏𝙀𝙉𝘾𝙄𝘼\n${asistencia}\n\n`, [
['𝙈𝙚𝙣𝙪 𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙨 🌀', '#descargasmenu'],
['𝙈𝙚𝙣𝙪 𝘾𝙤𝙢𝙥𝙡𝙚𝙩𝙤 | 𝙁𝙪𝙡𝙡 𝙈𝙚𝙣𝙪 ✨', '.allmenu'],
['𝙑𝙤𝙡𝙫𝙚𝙧 𝙖𝙡 𝙈𝙚𝙣𝙪́ | 𝘽𝙖𝙘𝙠 𝙩𝙤 𝙈𝙚𝙣𝙪 ☘️', '/menu']], m)
 /*.trim()
  
await conn.sendHydrated(m.chat, info, wm, null, ig, '𝙄𝙣𝙨𝙩𝙖𝙜𝙧𝙖𝙢', null, null, [
['𝙈𝙚𝙣𝙪 𝘿𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙨 🌀', '#descargasmenu'],
['𝙈𝙚𝙣𝙪 𝘾𝙤𝙢𝙥𝙡𝙚𝙩𝙤 | 𝙁𝙪𝙡𝙡 𝙈𝙚𝙣𝙪 ✨', '.allmenu'],
['𝙑𝙤𝙡𝙫𝙚𝙧 𝙖𝙡 𝙈𝙚𝙣𝙪́ | 𝘽𝙖𝙘𝙠 𝙩𝙤 𝙈𝙚𝙣𝙪 ☘️', '/menu']
], m,)  
  
}
handler.help = ['igstalk'].map(v => v + ' <username>')
handler.tags = ['downloader']
handler.command = /^(igstalk|verig|igver)$/i
handler.exp = 80
export default handler*/
