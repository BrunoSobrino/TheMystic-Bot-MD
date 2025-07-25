  const groupMetadataCache = new Map();
  const lidCache = new Map();

const handler = async (m, {conn, participants, command, usedPrefix}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.grupos_eliminar

  if (!global.db.data.settings[conn.user.jid].restrict) throw `${tradutor.texto1[0]} (*_restrict_*), ${tradutor.texto1[1]}`;
  const kicktext = `${tradutor.texto2} _${usedPrefix + command} @${global.suittag}_`;
  if (!await m.mentionedJid[0] && !m.quoted) return m.reply(kicktext, m.chat, {mentions: conn.parseMention(kicktext)});
  if (m.message.extendedTextMessage === undefined || m.message.extendedTextMessage === null) return m.reply(tradutor.texto3);
  if (m.message.extendedTextMessage.contextInfo.participant !== null && m.message.extendedTextMessage.contextInfo.participant != undefined && m.message.extendedTextMessage.contextInfo.participant !== '') {
    const mentioneda = m.message.extendedTextMessage.contextInfo.mentionedJid[0] ? m.message.extendedTextMessage.contextInfo.mentionedJid[0] : m.message.extendedTextMessage.contextInfo.participant;
    const mentioned = await resolveLidToRealJid(mentioneda, conn, m?.chat);
    if (conn.user.jid.includes(mentioned)) return m.reply(tradutor.texto4);
    const responseb = await conn.groupParticipantsUpdate(m.chat, [mentioned], 'remove');
    const exitoso1 = `${tradutor.texto5[0]} @${mentioned.split('@')[0]} ${tradutor.texto5[1]}`;
    const error1 = `${tradutor.texto6[0]} @${mentioned.split('@')[0]} ${tradutor.texto6[1]}`;
    const error2 = `${tradutor.texto7[0]} @${mentioned.split('@')[0]} ${tradutor.texto7[1]}`;
    if (responseb[0].status === '200') m.reply(exitoso1, m.chat, {mentions: conn.parseMention(exitoso1)});
    else if (responseb[0].status === '406') m.reply(error1, m.chat, {mentions: conn.parseMention(error1)});
    else if (responseb[0].status === '404') m.reply(error2, m.chat, {mentions: conn.parseMention(error2)});
    else conn.sendMessage(m.chat, {text: `${tradutor.texto8}`, mentions: [m.sender], contextInfo: {forwardingScore: 999, isForwarded: true}}, {quoted: m});
  } else if (m.message.extendedTextMessage.contextInfo.mentionedJid != null && m.message.extendedTextMessage.contextInfo.mentionedJid != undefined) {
    return;
  }
};
handler.help = ['kick'];
handler.tags = ['group'];
handler.command = /^(kick|expulsar|eliminar|echar|sacar)$/i;
handler.admin = handler.group = handler.botAdmin = true;
export default handler;

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 60000) {
    const inputJid = lid.toString();
    if (!inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) return inputJid.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net`;
    if (lidCache.has(inputJid)) return lidCache.get(inputJid);
    const lidToFind = inputJid.split("@")[0];
    let attempts = 0;
    while (attempts < maxRetries) {
        try {
            const metadata = await conn?.groupMetadata(groupChatId);
            if (!metadata?.participants) throw new Error("No se obtuvieron participantes");
            for (const participant of metadata.participants) {
                try {
                    if (!participant?.jid) continue;
                    const contactDetails = await conn?.onWhatsApp(participant.jid);
                    if (!contactDetails?.[0]?.lid) continue;
                    const possibleLid = contactDetails[0].lid.split("@")[0];
                    if (possibleLid === lidToFind) {
                        lidCache.set(inputJid, participant.jid);
                        return participant.jid;
                    }
                } catch (e) { continue }
            }
            lidCache.set(inputJid, inputJid);
            return inputJid;
        } catch (e) {
            if (++attempts >= maxRetries) {
                lidCache.set(inputJid, inputJid);
                return inputJid;
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }
    return inputJid;
}
