import {createHash} from 'crypto';
import PhoneNumber from 'awesome-phonenumber';
import fetch from 'node-fetch';


const handler = async (m, {conn, usedPrefix, participants, isPrems}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.rpg_perfil

  let pp = 'https://telegra.ph/file/06cc652844ea19e8aed1c.jpg';
  const who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
  if (!(who in global.db.data.users)) throw tradutor.texto1;
  try {
    pp = await conn.profilePictureUrl(who);
  } catch (e) {
  } finally {
    const {name, limit, lastclaim, registered, regTime, age, premiumTime} = global.db.data.users[who];
    const username = conn.getName(who);
    const prem = global.prems.includes(who.split `@` [0]);
    const sn = createHash('md5').update(who).digest('hex');
    const str = `${tradutor.texto2[0]} ${username} ${registered ? '(' + name + ') ': ''}
${tradutor.texto2[1]}  ${PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international')}
${tradutor.texto2[2]}  wa.me/${who.split`@`[0]}${registered ? tradutor.texto2[7] + age + tradutor.texto2[8] : ''}
${tradutor.texto2[3]}  ${limit} ${tradutor.texto2[9]}
${tradutor.texto2[4]}  ${registered ? tradutor.texto2[10] : tradutor.texto2[11]}
${tradutor.texto2[5]}  ${premiumTime > 0 ? 'Si' : (isPrems ? tradutor.texto2[10] : tradutor.texto2[11]) || ''}
${tradutor.texto2[6]}  
${sn}`;
    conn.sendMessage(m.chat, {image: {url: pp}, caption: str}, {quoted: m});
  }
};
handler.help = ['profile [@user]'];
handler.tags = ['xp'];
handler.command = /^perfil|profile?$/i;
export default handler;
