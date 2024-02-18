/* -------------------------------------------------------*/
/* [❗]                      [❗]                      [❗] */
/*                                                       */
/*        |- [ ⚠ ] - CODE CREDITS - [ ⚠ ] -|            */
/*          —◉ DEVELOPED BY LUA SER OFC:                 */
/*       ◉ git : (https://github.com/xxirfanx)           */
/*                                                       */
/* [❗]                      [❗]                      [❗] */
/* -------------------------------------------------------*/
import moment from 'moment-timezone';
import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
   let res = await fetch('https://api.github.com/repos/xxirfanx/zoromd')
   let json = await res.json()
   let txt = `							*B O T  -  S C R I P T*\n\n`
      txt += `	◦  *Name* : ${json.name}\n`
      txt += `	◦  *Visitor* : ${json.watchers_count}\n`
      txt += `	◦  *Size* : ${(json.size / 1024).toFixed(2)} MB\n`
      txt += `	◦  *Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}\n`
      txt += `	◦  *Url* : ${json.html_url}\n\n`
      txt += `	   ${json.forks_count} Forks · ${json.stargazers_count} Stars · ${json.open_issues_count} Issues\n\n`
      txt += me
   await conn.relayMessage(m.chat,  {
    requestPaymentMessage: {
      currencyCodeIso4217: 'INR',
      amount1000: '50000000000',
      requestFrom: '0@s.whatsapp.net',
      noteMessage: {
      extendedTextMessage: {
      text: txt,
      contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
      showAdAttribution: true
      }}}}}}, {})
}

handler.help = ['sc <bot sc>']
handler.tags = ['general']
handler.command = /^sc(ript(bot)?|bot)?$/i

export default handler
