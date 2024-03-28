

const handler = async (m, {conn, usedPrefix, command, args, isOwner, isAdmin, isROwner}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.config_funciones


const optionsFull = `_*${tradutor.texto1[0]}*_\n 

${tradutor.texto1[1]}  | WELCOME"
${tradutor.texto1[2]} ${usedPrefix + command} welcome
${tradutor.texto1[3]}

--------------------------------

${tradutor.texto2[0]} | PUBLIC
${tradutor.texto2[1]}* ${usedPrefix + command} public
${tradutor.texto2[2]}
${tradutor.texto2[3]}

--------------------------------

${tradutor.texto3[0]} | MODOHORNY
${tradutor.texto3[1]} ${usedPrefix + command} modohorny
${tradutor.texto3[2]}

--------------------------------

${tradutor.texto4[0]} | ANTILINK
${tradutor.texto4[1]} ${usedPrefix + command} antilink
${tradutor.texto4[2]}
${tradutor.texto4[3]}

--------------------------------

${tradutor.texto5[0]} 🔗 | ANTILINK 2
${tradutor.texto5[1]}  ${usedPrefix + command} antilink2
${tradutor.texto5[2]}
${tradutor.texto5[3]}

--------------------------------

${tradutor.texto6[0]} | DETECT
${tradutor.texto6[1]} ${usedPrefix + command} detect
${tradutor.texto6[2]}

--------------------------------

${tradutor.texto7[0]} | DETECT 2
${tradutor.texto7[1]} ${usedPrefix + command} detect2
${tradutor.texto7[2]}

--------------------------------

${tradutor.texto8[0]} RESTRICT
${tradutor.texto8[1]} ${usedPrefix + command} restrict
${tradutor.texto8[2]}
${tradutor.texto8[3]}
--------------------------------

${tradutor.texto9[0]} | AUTOREAD
${tradutor.texto9[1]} ${usedPrefix + command} autoread
${tradutor.texto9[2]}
${tradutor.texto9[3]}

--------------------------------

${tradutor.texto10[0]} | AUDIOS
${tradutor.texto10[1]} ${usedPrefix + command} audios
${tradutor.texto10[2]}

--------------------------------

${tradutor.texto11[0]} | AUTOSTICKER
${tradutor.texto11[1]} ${usedPrefix + command} autosticker 
${tradutor.texto11[2]}

--------------------------------

${tradutor.texto12[0]} | PCONLY
${tradutor.texto12[1]} ${usedPrefix + command} pconly
${tradutor.texto12[2]}
${tradutor.texto12[3]}

--------------------------------

${tradutor.texto13[0]} | GCONLY
${tradutor.texto13[1]} ${usedPrefix + command} gconly
${tradutor.texto13[2]} 
${tradutor.texto13[3]}

--------------------------------

${tradutor.texto14[0]} | ANTIVIEWONCE 
${tradutor.texto14[1]} ${usedPrefix + command} antiviewonce
${tradutor.texto14[2]}

--------------------------------

${tradutor.texto15[0]} | ANTILLAMADAS
${tradutor.texto15[1]} ${usedPrefix + command} anticall
${tradutor.texto15[2]} 
${tradutor.texto15[3]}

--------------------------------

${tradutor.texto16[0]} | ANTITOXIC
${tradutor.texto16[1]} ${usedPrefix + command} antitoxic
${tradutor.texto16[2]}
${tradutor.texto16[3]}

--------------------------------

${tradutor.texto17[0]} | ANTITRABAS
${tradutor.texto17[1]}  ${usedPrefix + command} antitraba
${tradutor.texto17[2]} 
${tradutor.texto17[3]} 

--------------------------------

${tradutor.texto18[0]} | ANTIARABES
${tradutor.texto18[1]} ${usedPrefix + command} antiarabes
${tradutor.texto18[2]}
${tradutor.texto18[3]}

--------------------------------

${tradutor.texto19[0]} | ANTIARABES 2
${tradutor.texto19[1]}  ${usedPrefix + command} antiarabes2
${tradutor.texto19[2]} 
${tradutor.texto19[3]} 

--------------------------------

${tradutor.texto20[0]} | MODOADMIN
${tradutor.texto20[1]} ${usedPrefix + command} modoadmin
${tradutor.texto20[2]}

--------------------------------

${tradutor.texto21[0]} | SIMSIMI
${tradutor.texto21[1]} ${usedPrefix + command} simsimi
${tradutor.texto21[2]}

--------------------------------

${tradutor.texto22[0]} | ANTIDELETE
${tradutor.texto22[1]} ${usedPrefix + command} antidelete
${tradutor.texto22[2]}

--------------------------------

${tradutor.texto23[0]} | AUDIOS_BOT
${tradutor.texto23[1]} ${usedPrefix + command} audios_bot
${tradutor.texto23[2]}
${tradutor.texto23[3]}

--------------------------------

${tradutor.texto24[0]} | MODOIA
${tradutor.texto24[1]} ${usedPrefix + command} modoia
${tradutor.texto24[2]}
${tradutor.texto24[3]}

--------------------------------

${tradutor.texto25[0]} | ANTISPAM
${tradutor.texto25[1]} ${usedPrefix + command} antispam
${tradutor.texto25[2]}
${tradutor.texto25[3]}

--------------------------------

${tradutor.texto26[0]} | MODEJADIBOT
${tradutor.texto26[1]} ${usedPrefix + command} modejadibot
${tradutor.texto26[2]} (${usedPrefix}serbot / ${usedPrefix}jadibot). 
${tradutor.texto26[3]}

--------------------------------

${tradutor.texto27[0]} | ANTIPRIVADO
${tradutor.texto27[1]} ${usedPrefix + command} antiprivado
${tradutor.texto27[2]}
${tradutor.texto27[3]}`.trim();

  const isEnable = /true|enable|(turn)?on|1/i.test(command);
  const chat = global.db.data.chats[m.chat];
  const user = global.db.data.users[m.sender];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const type = (args[0] || '').toLowerCase();
  let isAll = false; const isUser = false;
  switch (type) {
    case 'welcome':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!(isAdmin || isOwner || isROwner)) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.welcome = isEnable;
      break;
    case 'detect':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.detect = isEnable;
      break;
    case 'detect2':
      if (!m.isGroup) {
        if (!isOwner) {
          global.dfail('group', m, conn);
          throw false;
        }
      } else if (!isAdmin) {
        global.dfail('admin', m, conn);
        throw false;
      }
      chat.detect2 = isEnable;
      break;
    case 'simsimi':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.simi = isEnable;
      break;
    case 'antiporno':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiporno = isEnable;
      break;
    case 'delete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.delete = isEnable;
      break;
    case 'antidelete':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antidelete = isEnable;
      break;
    case 'public':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['self'] = !isEnable;
      break;
    case 'antilink':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiLink = isEnable;
      break;
    case 'antilink2':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiLink2 = isEnable;
      break;
    case 'antiviewonce':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiviewonce = isEnable;
      break;
    case 'modohorny':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.modohorny = isEnable;
      break;
    case 'modoadmin':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.modoadmin = isEnable;
      break;
    case 'autosticker':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.autosticker = isEnable;
      break;
    case 'audios':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.audios = isEnable;
      break;
    case 'restrict':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.restrict = isEnable;
      break;
    case 'audios_bot':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.audios_bot = isEnable;      
      break;
    case 'modoia':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.modoia = isEnable;      
      break;      
    case 'nyimak':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['nyimak'] = isEnable;
      break;
    case 'autoread':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.autoread2 = isEnable;
      //global.opts['autoread'] = isEnable;
      break;
    case 'pconly':
    case 'privateonly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['pconly'] = isEnable;
      break;
    case 'gconly':
    case 'grouponly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['gconly'] = isEnable;
      break;
    case 'swonly':
    case 'statusonly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['swonly'] = isEnable;
      break;
    case 'anticall':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.antiCall = isEnable;
      break;
    case 'antiprivado':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.antiPrivate = isEnable;
      break;
    case 'modejadibot':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.modejadibot = isEnable;
      break;
    case 'antispam':
      isAll = true;
      if (!(isROwner || isOwner)) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.antispam = isEnable;
      break;
    case 'antitoxic':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiToxic = isEnable;
      break;
      case 'game': case 'juegos': case 'fun': case 'ruleta':
if (m.isGroup) {
if (!(isAdmin || isOwner)) {
global.dfail('admin', m, conn)
throw false
}}
chat.game = isEnable          
break;
    case 'antitraba':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiTraba = isEnable;
      break;
    case 'antiarabes':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn); 
          throw false;
        }
      }
      chat.antiArab = isEnable;
      break;
    case 'antiarabes2':
      if (m.isGroup) {
        if (!(isAdmin || isROwner || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiArab2 = isEnable;
      break;
    default:
      if (!/[01]/.test(command)) return await conn.sendMessage(m.chat, {text: optionsFull}, {quoted: m});
      throw false;
  }
  conn.sendMessage(m.chat, {text: `_*${tradutor.texto28[0]}*_\n\n*${tradutor.texto28[1]}* _${type}_ *fue* ${isEnable ? '_activada_' : '_desactivada_'} *${tradutor.texto28[2]}* ${isAll ? '_bot._' : isUser ? '' : '_chat._'}`}, {quoted: m});
  //conn.sendMessage(m.chat, {text: `▢ *Opción:* ${type}\n\n▢ *Estado:* ${isEnable ? 'Activado' : 'Desactivado'}\n\n▢ *Para* ${isAll ? 'este bot' : isUser ? '' : 'este chat'}`}, {quoted: m});
};
handler.command = /^((en|dis)able|(tru|fals)e|(turn)?[01])$/i;
export default handler;
