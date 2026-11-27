/*              Codigo Creado Por Bruno Sobrino
      (https://github.com/BrunoSobrino/TheMystic-Bot-MD)
*/


const handler = async (m, {conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin, isSuperAdmin}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.gc_listanum_kicknum

  if (!args[0]) return m.reply(`${tradutor.texto1} ${usedPrefix + command} 52*`);
  if (isNaN(args[0])) return m.reply(`${tradutor.texto2} ${usedPrefix + command} 52*`);
  const lol = args[0].replace(/[+]/g, '');
  // En grupos con LID la entrada del bot tiene id=@lid: se excluye por
  // todas las formas conocidas de su id, no solo por conn.user.jid.
  const botIds = [conn.user.id, conn.decodeJid(conn.user.id), conn.user.jid, conn.user.lid].filter(Boolean);
  const isBotId = (v) => botIds.includes(conn.decodeJid(v)) || botIds.includes(v);
  const ps = participants.map((u) => u.id).filter((v) => !isBotId(v) && v.startsWith(lol || lol));
  // Los ajustes se guardan bajo la id cruda del bot (#420): se fusionan
  // ambas claves (gana la cruda), si no restrict siempre se leía apagado.
  const bot = { ...(global.db.data.settings[conn.user.jid] || {}), ...(global.db.data.settings[conn.user.id] || {}) };
  if (ps.length === 0) return m.reply(`${tradutor.texto3} +${lol}*`);
  const numeros = ps.map((v)=> '⭔ @' + v.replace(/@.+/, ''));
  const delay = (time) => new Promise((res)=>setTimeout(res, time));
  switch (command) {
    case 'listanum': case 'listnum':
      conn.reply(m.chat, `${tradutor.texto4[0]} +${lol} ${tradutor.texto4[1]}\n\n` + numeros.join`\n`, m, {mentions: ps});
      break;
    case 'kicknum':
      if (!bot.restrict) return m.reply(`${tradutor.texto5[0]} (#𝚎𝚗𝚊𝚋𝚕𝚎 𝚛𝚎𝚜𝚝𝚛𝚒𝚌𝚝) ${tradutor.texto5[1]}`);
      if (!isBotAdmin) return m.reply(tradutor.texto6);
      conn.reply(m.chat, `${tradutor.texto7[0]} +${lol}, ${tradutor.texto7[1]}`, m);
      const ownerGroup = m.chat.split`-`[0] + '@s.whatsapp.net';
      const users = participants.map((u) => u.id).filter((v) => !isBotId(v) && v.startsWith(lol || lol));
      const superAdmin = participants.find((u) => u.admin === 'superadmin')?.id;
      const isOwnerId = (jid) => global.owner.some(([id]) => jid === id + '@s.whatsapp.net');
      for (const user of users) {
        const error = `@${user.split('@')[0]} ${tradutor.texto8}`;
        if (user !== ownerGroup + '@s.whatsapp.net' && !isBotId(user) && !isOwnerId(user) && user.startsWith(lol || lol) && user !== superAdmin && isBotAdmin && bot.restrict) {
          await delay(2000);
          const responseb = await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
          if (responseb?.[0]?.status === '404') m.reply(error, m.chat, {mentions: conn.parseMention(error)});
          await delay(10000);
        }
        // Antes: un usuario no expulsable (dueño del grupo, owner del
        // bot o superadmin) abortaba todo el bucle con return; ahora
        // simplemente se salta y se sigue con el resto. La comparación
        // vieja `user !== isSuperAdmin` comparaba un JID con un
        // booleano y nunca protegía al creador del grupo.
      }
      break;
  }
};

handler.tags = ['group'];
handler.help = ['kicknum', 'listnum']
handler.command = /^(listanum|kicknum|listnum)$/i;
handler.group = handler.botAdmin = handler.admin = true;
handler.fail = null;
export default handler;
