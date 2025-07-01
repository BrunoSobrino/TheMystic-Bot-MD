export function before(m) {
 const datas = global
 const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
 const tradutor = _translate.plugins.afk__afk

 const user = global.db.data.users[m.sender];
 if (user.afk > -1) {
 m.reply(`${tradutor.texto2[0]} ${user.afkReason ? `${tradutor.texto2[1]}` + user.afkReason : ''}*\n\n*${tradutor.texto2[2]} ${(new Date - user.afk).toTimeString()}*`.trim());
   user.afk = -1;
   user.afkReason = '';
 }
const getQuotedSender = async () => {
    try {
      return m.quoted ? await m.quoted?.sender : null;
    } catch {
      return null;
    }
  };
  (async () => {
    const quotedSender = await getQuotedSender();
    const jids = [...new Set([...(m.mentionedJid || []), ...(quotedSender ? [quotedSender] : [])])];
 for (const jid of jids) {
 const user = global.db.data.users[jid];
 if (!user) {
   continue;
 }
 const afkTime = user.afk;
 if (!afkTime || afkTime < 0) {
   continue;
 }
 const reason = user.afkReason || '';
 m.reply(`${tradutor.texto1[0]}\n\n*—◉ ${tradutor.texto1[1]}*\n*—◉ ${reason ? `${tradutor.texto1[2]}` + reason : `${tradutor.texto1[3]}`}*\n*—◉ ${tradutor.texto1[4]} ${(new Date - afkTime).toTimeString()}*`.trim());
 }
 })();  
 return true;
}
