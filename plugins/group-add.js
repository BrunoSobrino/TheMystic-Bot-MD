const {generateWAMessageFromContent, prepareWAMessageMedia, proto} = await import("baileys");
import fetch from 'node-fetch';
const {getBinaryNodeChild, getBinaryNodeChildren} = await import("baileys");
const handler = async (m, {conn, text, participants, args}) => {
  const idioma = global.db.data.users[m.sender].language || global.defaultLenguaje 
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_add

  if (!global.db.data.settings[conn.user.jid].restrict) throw tradutor.texto1;
  if (!args[0]) throw tradutor.texto2;
  try {
    // Identificadores conocidos de los miembros (JID, número y LID): en grupos
    // con LID el id del participante puede ser el LID y no el número.
    const _participantIds = new Set((participants || []).flatMap((p) => [p.id, p.phoneNumber, p.lid].filter(Boolean)));
    const numbers = text.split(',').map((v) => v.replace(/[^0-9]/g, '')).filter((v) => v.length > 4 && v.length < 20);
    const alreadyInGroup = numbers.filter((v) => _participantIds.has(v + '@s.whatsapp.net'));
    const users = (await Promise.all(
        numbers
            .filter((v) => !_participantIds.has(v + '@s.whatsapp.net'))
            .map(async (v) => [v, await conn.onWhatsApp(v + '@s.whatsapp.net')]))).filter((v) => v[1][0]?.exists).map((v) => v[0] + '@c.us');
    // Si todos los números ya están en el grupo, avisar en vez de intentar añadirlos.
    if (users.length === 0 && alreadyInGroup.length > 0) {
      const msg = tradutor.texto6.replace('@user', alreadyInGroup.map((v) => '@' + v).join(', '));
      return m.reply(msg, null, { mentions: alreadyInGroup.map((v) => v + '@s.whatsapp.net') });
    }
    const response = await conn.query({tag: 'iq', attrs: {type: 'set', xmlns: 'w:g2', to: m.chat}, content: users.map((jid) => ({tag: 'add', attrs: {}, content: [{tag: 'participant', attrs: {jid}}]}))});
    const pp = await conn.profilePictureUrl(m.chat).catch((_) => null);
    const jpegThumbnail = pp ? Buffer.from(await (await fetch(pp)).arrayBuffer()) : Buffer.alloc(0);
    const add = getBinaryNodeChild(response, 'add');
    const participant = getBinaryNodeChildren(add, 'participant');
    for (const user of participant.filter((item) => item.attrs.error == 403)) {
      const jid = user.attrs.jid;
      const content = getBinaryNodeChild(user, 'add_request');
      const invite_code = content.attrs.code;
      const invite_code_exp = content.attrs.expiration;
      const teks = `${tradutor.texto3[0]} @${jid.split('@')[0]}, ${tradutor.texto3[1]}`;
      m.reply(teks, null, {mentions: conn.parseMention(teks)});
      const captionn = tradutor.texto4;
      const messaa = await prepareWAMessageMedia({image: jpegThumbnail}, {upload: conn.waUploadToServer});
      const groupInvite = generateWAMessageFromContent(m.chat, proto.Message.fromObject({groupInviteMessage: {groupJid: m.chat, inviteCode: invite_code, inviteExpiration: invite_code_exp, groupName: await conn.getName(m.chat), caption: captionn, jpegThumbnail: jpegThumbnail}}), {userJid: jid});
      await conn.relayMessage(jid, groupInvite.message, {messageId: groupInvite.key.id});
    }
  } catch {
    throw tradutor.texto5;
  }
};
handler.help = ['add'].map((v) => v + ' número');
handler.tags = ['group'];
handler.command = ['add', 'agregar'];
handler.admin = handler.group = handler.botAdmin = true;
export default handler;
