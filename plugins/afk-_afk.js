import _translate from "./_translate.js";
const tradutor = _translate.plugins.afk__afk
 // Para configurar o idioma, na raiz do projeto altere o arquivo config.json
  // Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
  // To set the language, in the root of the project, modify the config.json file.

export function before(m) {
  const user = global.db.data.users[m.sender];
  if (user.afk > -1) {
    m.reply(` ${tradutor.texto2[0]} ${user.afkReason ? `${tradutor.texto2[1]}` + user.afkReason : ''}*
  
  *${tradutor.texto2[2]} ${(new Date - user.afk).toTimeString()}*
  `.trim());
    user.afk = -1;
    user.afkReason = '';
  }
  const jids = [...new Set([...(m.mentionedJid || []), ...(m.quoted ? [m.quoted.sender] : [])])];
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
    m.reply(`${tradutor.texto1[0]}

*—◉ ${tradutor.texto1[1]}*      
*—◉ ${reason ? `${tradutor.texto1[2]}` + reason : `${tradutor.texto1[3]}`}*
*—◉ ${tradutor.texto1[4]} ${(new Date - afkTime).toTimeString()}*
  `.trim());
  }
  return true;
}
