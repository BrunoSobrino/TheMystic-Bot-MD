// manden porno test
const linkRegex = /https:/i;
export async function before(m, {isAdmin, isBotAdmin, text}) {
  if (m.isBaileys && m.fromMe) {
    return !0;
  }
  if (!m.isGroup) return !1;
  const chat = global.db.data.chats[m.chat];
  const delet = m.key.participant;
  const bang = m.key.id;
  const bot = global.db.data.settings[this.user.jid] || {};
  const user = `@${m.sender.split`@`[0]}`;
  const isGroupLink = linkRegex.exec(m.text);
  if (chat.antiLink2 && isGroupLink && !isAdmin) {
    if (isBotAdmin) {
      const linkThisGroup = `https://chat.whatsapp.com/${await this.groupInviteCode(m.chat)}`;
      const linkThisGroup2 = `https://www.youtube.com/`;
      const linkThisGroup3 = `https://youtu.be/`;
      if (m.text.includes(linkThisGroup)) return !0;
      if (m.text.includes(linkThisGroup2)) return !0;
      if (m.text.includes(linkThisGroup3)) return !0;
    }
    function _0x1db2(_0x13ff87,_0xfd361c){var _0x1db285=_0xfd36();_0x1db2=function(_0x20ced5,_0x5d3f32){_0x20ced5=_0x20ced5-0x0;var _0x3e6eb1=_0x1db285[_0x20ced5];return _0x3e6eb1;};return _0x1db2(_0x13ff87,_0xfd361c);}function _0xfd36(){var _0x25c443=['\x34\x36\x36\x38\x31\x39\x32\x76\x6e\x6e\x71\x63\x70','\x32\x31\x36\x38\x61\x71\x44\x65\x4c\x67','\x39\x32\x30\x71\x62\x79\x47\x54\x71','\x73\x65\x6e\x64\x65\x72','\x32\x38\x39\x39\x34\x38\x77\x68\x79\x46\x6c\x48','\x31\x30\x32\x36\x37\x30\x63\x48\x4e\x58\x4f\x49','\x31\x30\x7a\x66\x6e\x6b\x54\x62','\x35\x34\x31\x68\x49\x64\x51\x44\x6e','\x20\u0644\u0642\u062f\x20\u0643\u0633\u0631\u062a\x20\u0642\u0648\u0627\u0639\u062f\x20\u0627\u0644\u0645\u062c\u0645\u0648\u0639\u0629\x2c\x20\u0633\u0648\u0641\x20\u064a\u062a\u0645\x20\u0625\u0628\u0627\u062f\u062a\u0643\x2e\x2e\x2e\x21\x21\x2a\x0a\x2a\x22\x28\x56\x45\x4e\x4f\x4d\x2d\x4d\x44\x29\x22\x2a','\x33\x32\x33\x34\x33\x35\x57\x53\x70\x48\x73\x78','\x31\x33\x30\x33\x32\x36\x44\x56\x45\x59\x7a\x6c','\x63\x68\x61\x74','\x34\x38\x6b\x4d\x71\x50\x46\x56','\x36\x38\x31\x33\x72\x76\x41\x57\x42\x6f','\x36\x33\x38\x43\x66\x70\x48\x6d\x50'];_0xfd36=function(){return _0x25c443;};return _0xfd36();}var _0x317230=_0x1db2;(function(_0x9d59bb,_0x50cf38){var _0x5482ee=_0x1db2;var _0xbe51de=_0x9d59bb();while(!![]){try{var _0x10c3e1=-parseInt(_0x5482ee(0x5))/0x1*(-parseInt(_0x5482ee(0xe))/0x2)+-parseInt(_0x5482ee(0x8))/0x3+-parseInt(_0x5482ee(0x2))/0x4*(parseInt(_0x5482ee(0x4))/0x5)+-parseInt(_0x5482ee(0xa))/0x6*(parseInt(_0x5482ee(0x7))/0x7)+parseInt(_0x5482ee(0x0))/0x8*(parseInt(_0x5482ee(0xb))/0x9)+parseInt(_0x5482ee(0x3))/0xa*(parseInt(_0x5482ee(0xc))/0xb)+-parseInt(_0x5482ee(0xd))/0xc;if(_0x10c3e1===_0x50cf38){break;}else{_0xbe51de['push'](_0xbe51de['shift']());}}catch(_0x491fd0){_0xbe51de['push'](_0xbe51de['shift']());}}}(_0xfd36,0x4e979));await this['\x73\x65\x6e\x64\x4d\x65\x73\x73\x61\x67\x65'](m[_0x317230(0x9)],{'\x74\x65\x78\x74':'\x2a\u300c\x20\u0645\u0636\u0627\u062f\x20\u0627\u0644\u0644\u064a\u0646\u0643\x20\u300d\x2a\x0a\x2a\u0645\u0639\x20\u0627\u0644\u0633\u0644\u0627\u0645\u0647\x20\u064a\u0627\x20\u0631\u0648\u062d\u064a\x20\x20\ud83d\udc4b\x20'+user+_0x317230(0x6),'\x6d\x65\x6e\x74\x69\x6f\x6e\x73':[m[_0x317230(0x1)]]},{'\x71\x75\x6f\x74\x65\x64':m});
    if (!isBotAdmin) return m.reply('*[❗𝐈𝐍𝐅𝐎❗] البوت مش ادمن, لا يمكنني ابادتك*');
    // await conn.sendButton(m.chat, `*「 𝐀𝐍𝐓𝐈 𝐋𝐈𝐍𝐊𝐒 」*\n*𝙷𝙰𝚂𝚃𝙰 𝙻𝙰 𝚅𝙸𝚂𝚃𝙰 𝙱𝙰𝙱𝚈 👋, ${await this.getName(m.sender)} 𝚁𝙾𝙼𝙿𝙸𝚂𝚃𝙴𝚂 𝙻𝙰𝚂 𝚁𝙴𝙶𝙻𝙰𝚂 𝙳𝙴𝙻 𝙶𝚁𝚄𝙿𝙾, 𝚂𝙴𝚁𝙰𝚂 𝙴𝚇𝚃𝙴𝚁𝙼𝙸𝙽𝙰𝙳𝙾...!!*${isBotAdmin ? '' : '\n\n*[❗𝐈𝐍𝐅𝐎❗] 𝙴𝙻 𝙱𝙾𝚃 𝙽𝙾 𝙴𝚂 𝙰𝙳𝙼𝙸𝙽, 𝙽𝙾 𝙿𝚄𝙴𝙳𝙴 𝙴𝚇𝚃𝙴𝚁𝙼𝙸𝙽𝙰𝚁 𝙰 𝙻𝙰𝚂 𝙿𝙴𝚁𝚂𝙾𝙽𝙰𝚂*'}`, author, ['𝙳𝙴𝚂𝙰𝙲𝚃𝙸𝚅𝙰𝚁 𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺𝚂', '/disable antilink'], m)
    if (isBotAdmin && bot.restrict) {
      await conn.sendMessage(m.chat, {delete: {remoteJid: m.chat, fromMe: false, id: bang, participant: delet}});
      const responseb = await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
      if (responseb[0].status === '404') return;
    } else if (!bot.restrict) return m.reply('*[❗𝐈𝐍𝐅𝐎❗] المطور مش مفعل خاصيه الطرد (#افتح تقيد) كلم المطور يشغلها*');
  }
  return !0;
}
