import { generateWAMessageFromContent, jidNormalizedUser } from "baileys";
import { smsg } from './src/libraries/simple.js';
import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import fs from 'fs';
import chalk from 'chalk';
import mddd5 from 'md5';
import ws from 'ws';
import { chats, setttings, dick, gameGalaxy, akiSettings } from "./constants.js";
let mconn;

/**
 * @type {import("baileys")}
 */
const { proto } = await import("baileys");
const isNumber = (x) => typeof x === 'number' && !isNaN(x);
const delay = (ms) => isNumber(ms) && new Promise((resolve) => setTimeout(function () {
  clearTimeout(this);
  resolve();
}, ms));

/**
 * Handle messages upsert
 * @param {import("baileys").BaileysEventMap<unknown>['messages.upsert']} groupsUpdate
 */
// Baileys 7 / LID: un mismo usuario puede llegar como PN (...@s.whatsapp.net)
// o como LID (...@lid). Estas ayudas comparan ambas formas normalizadas.
const participantMatches = (u, jid) => {
  const target = jidNormalizedUser(jid || '');
  return [u?.id, u?.phoneNumber, u?.lid].filter(Boolean)
    .some((x) => jidNormalizedUser(x) === target);
};
const botIdentities = (conn) => [conn?.user?.id, conn?.user?.lid, conn?.user?.jid]
  .filter(Boolean).map((j) => jidNormalizedUser(j));
const botIs = (conn, jid) => {
  const target = jidNormalizedUser(jid || '');
  if (botIdentities(conn).includes(target)) return true;
  const resolved = conn?.resolveUser?.(target) || {};
  return [resolved.jid, resolved.lid].filter(Boolean)
    .some((x) => botIdentities(conn).includes(jidNormalizedUser(x)));
};

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || [];
  this.uptime = this.uptime || Date.now();
  if (!chatUpdate) {
    return;
  }
  this.pushMessage(chatUpdate.messages).catch(console.error);
  let m = chatUpdate.messages[chatUpdate.messages.length - 1];
  if (!m) {
    return;
  }
  if (global.db.data == null) await global.loadDatabase();
  
  /* ------------------------------------------------*/
  try {
    m = smsg(this, m) || m;
    if (!m) {
      return;
    }
    global.mconn = m
    mconn = m
    m.exp = 0;
    m.money = false;
    m.limit = false;
    try {
      // TODO: use loop to insert data instead of this
      const user = global.db.data.users[m.sender]
      if (typeof user !== 'object') {
        global.db.data.users[m.sender] = {};
      }
      if (user) {
        // im gona cook this
        // why the fuck nobody put the code like this in 3 years??????
        // credit to mystic or skidy89
        
      for (const dicks in dick) {
          user.name = m.name
        if (user[dicks] === undefined || !user.hasOwnProperty(dicks)) {
          user[dicks] = dick[dicks] // god pls forgive me
        }
      }}
      const akinator = global.db.data.users[m.sender].akinator;
      if (typeof akinator !== 'object') {
        global.db.data.users[m.sender].akinator = {};
      }
      if (akinator) {
                for (const aki in akiSettings) {
          if (akinator[aki] === undefined || !akinator.hasOwnProperty(aki)) {
            akinator[aki] = akiSettings[aki] ?? {};
          }
        }
      }
      let gameglx = global.db.data.users[m.sender].gameglx
      if (typeof gameglx !== 'object') {
        global.db.data.users[m.sender].gameglx = {}
      }
      if (gameglx) {
        
        for (const game in gameGalaxy) {
          if (gameglx[game] === undefined || !gameglx.hasOwnProperty(game)) {
            gameglx[game] = gameGalaxy[game] ?? {} // ctrl + v moment 
          }
        }
      }


      const chat = global.db.data.chats[m.chat];
      if (typeof chat !== 'object') {
        global.db.data.chats[m.chat] = {};
      }
      if (chat) {
        
      
        for (const chatss in chats) {
          if (chat[chatss] === undefined || !chat.hasOwnProperty(chatss)) {
            chat[chatss] = chats[chatss] ?? {}// ctrl + v moment
          }
        }
      }
      const settings = global.db.data.settings[this.user?.id];
      if (typeof settings !== 'object') global.db.data.settings[this.user?.id] = {};
      if (settings) {
       
        for (const setting in settings) {
          if (settings[setting] === undefined || !settings.hasOwnProperty(setting)) {
            settings[setting] = setttings[setting] ?? {} // ctrl + v moment
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje; // is null? np the operator ?? fix that (i hope)
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
    const tradutor = _translate.handler.handler

    if (opts['nyimak']) {
      return;
    }
    if (!m.fromMe && opts['self']) {
      return;
    }
    if (opts['pconly'] && m.chat.endsWith('g.us')) {
      return;
    }
    if (opts['gconly'] && !m.chat.endsWith('g.us')) {
      return;
    }
    if (opts['swonly'] && m.chat !== 'status@broadcast') {
      return;
    }
    if (typeof m.text !== 'string') {
      m.text = '';
    }
    // LID: el remitente puede venir como PN o como LID; se comparan ambas
    // formas resueltas del número del owner/mod contra m.sender.
    // Además Baileys 7 trae el número real en la clave del mensaje
    // (participantAlt en grupos, remoteJidAlt en privado) cuando el remitente
    // viene enmascarado como LID: sin eso, un owner con el mapeo LID todavía
    // frío no es reconocido y el bot le contesta que no es owner.
    const resolvedIdentity = (number) => this.resolveUser(number + '@s.whatsapp.net') || {};
    const senderIds = new Set(
      [m.sender, m.key?.participantAlt, m.key?.remoteJidAlt]
        .filter(Boolean).map((j) => jidNormalizedUser(j)),
    );
    const senderResolved = this.resolveUser?.(m.sender) || {};
    if (senderResolved.jid) senderIds.add(jidNormalizedUser(senderResolved.jid));
    if (senderResolved.lid) senderIds.add(jidNormalizedUser(senderResolved.lid));
    const identityMatches = (resolved) =>
      [resolved.jid, resolved.lid].filter(Boolean)
        .some((x) => senderIds.has(jidNormalizedUser(x)));
    const isROwner = global.owner.map(([number]) => number)
      .some((num) => {
        const resolved = resolvedIdentity(num);
        return [num + '@s.whatsapp.net', resolved.jid, resolved.lid]
          .filter(Boolean).some((x) => senderIds.has(jidNormalizedUser(x)));
      }) || m.fromMe;
    const isOwner = isROwner || m.fromMe;
    const isMods = isOwner || global.mods
      .some((num) => identityMatches(resolvedIdentity(num)));
    const isPrems = isROwner || isOwner || isMods || global.db.data.users[m.sender].premiumTime > 0; // || global.db.data.users[m.sender].premium = 'true'.replace(/[^0-9]/g, '').replace(/[^0-9]/g, '')

    if (opts['queque'] && m.text && !(isMods || isPrems)) {
      const queque = this.msgqueque; const time = 1000 * 5;
      const previousID = queque[queque.length - 1];
      queque.push(m.id || m.key.id);
      setInterval(async function () {
        if (queque.indexOf(previousID) === -1) clearInterval(this);
        await delay(time);
      }, time);
    }

    if (m.isBaileys || isBaileysFail && m?.sender === jidNormalizedUser(this.user?.lid)) {
      return;
    }

    m.exp += Math.ceil(Math.random() * 10);

    let usedPrefix;
    const _user = global.db.data && global.db.data.users && global.db.data.users[m.sender];
    //const groupMetadata = m.isGroup ? { ...(conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}), ...(((conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}).participants) && { participants: ((conn.chats[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}).participants || []).map(p => ({ ...p, id: p.jid, jid: p.jid, lid: p.lid })) }) } : {};
    const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch((_) => null)) : {}) || {};
    //const participants = ((m.isGroup ? groupMetadata.participants : []) || []).map(participant => ({ id: participant.jid, jid: participant.jid, lid: participant.lid, admin: participant.admin }));
    const participants = (m.isGroup ? groupMetadata.participants : []) || [];
    const user = (m.isGroup ? participants.find((u) => participantMatches(u, m.sender)) : {}) || {}; // User Data
    const bot = (m.isGroup ? participants.find((u) => participantMatches(u, this.user?.id || this.user?.lid || '')) : {}) || {}; // Your Data
    const isRAdmin = user?.admin == 'superadmin' || false;
    const isAdmin = isRAdmin || user?.admin == 'admin' || false; // Is User Admin?
    const isBotAdmin = bot?.admin || false; // Are you Admin?

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
    for (const name in global.plugins) {
      const plugin = global.plugins[name];
      if (!plugin) {
        continue;
      }
      if (plugin.disabled) {
        continue;
      }
      const __filename = join(___dirname, name);
      const properPluginsAll = {
            chatUpdate,
            __dirname: ___dirname,
            __filename,
          }
      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, properPluginsAll);
        } catch (e) {
          // if (typeof e === 'string') continue
          console.error(e);
          /* for (const [jid] of global.reportes_solicitudes.filter(([number]) => number)) {
            const data = (await conn.onWhatsApp(jid))[0] || {};
            if (data.exists) {
              await m.reply(`*[ ⚠️ 𝚁𝙴𝙿𝙾𝚁𝚃𝙴 𝙳𝙴 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙲𝙾𝙽 𝙵𝙰𝙻𝙻𝙾𝚂 ⚠️ ]*\n\n*—◉ 𝙿𝙻𝚄𝙶𝙸𝙽:* ${name}\n*—◉ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾:* ${m.sender}\n*—◉ 𝙲𝙾𝙼𝙰𝙽𝙳𝙾:* ${m.text}\n\n*—◉ 𝙴𝚁𝚁𝙾𝚁:*\n\`\`\`${format(e)}\`\`\`\n\n*[❗] 𝚁𝙴𝙿𝙾𝚁𝚃𝙴𝙻𝙾 𝙰𝙻 𝙲𝚁𝙴𝙰𝙳𝙾𝚁 𝙳𝙴𝙻 𝙱𝙾𝚃 𝙿𝙰𝚁𝙰 𝙳𝙰𝚁𝙻𝙴 𝚄𝙽𝙰 𝚂𝙾𝙻𝚄𝙲𝙸𝙾𝙽, 𝙿𝚄𝙴𝙳𝙴 𝚄𝚂𝙰𝚁 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 #reporte*`.trim(), data.jid);
            }
          }*/
          const md5c = fs.readFileSync('./plugins/' + m.plugin);
          /*fetch('https://themysticbot.cloud:2083/error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: conn.user.jid, plugin: m.plugin, command: `${m.text}`, reason: format(e), md5: mddd5(md5c) }),
          });*/
        }
      }
      if (!opts['restrict']) {
        if (plugin.tags && plugin.tags.includes('admin')) {
          // global.dfail('restrict', m, this)
          continue;
        }
      }
      const str2Regex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
      const _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix;
      const match = (_prefix instanceof RegExp ? // RegExp Mode?
        [[_prefix.exec(m.text), _prefix]] :
        Array.isArray(_prefix) ? // Array?
          _prefix.map((p) => {
            const re = p instanceof RegExp ? // RegExp in Array?
              p :
              new RegExp(str2Regex(p));
            return [re.exec(m.text), re];
          }) :
          typeof _prefix === 'string' ? // String?
            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
            [[[], new RegExp]]
      ).find((p) => p[1]);
      const properPluginsBefore = Object.assign(properPluginsAll, {
          match,
          conn: this,
          participants,
          groupMetadata,
          user,
          bot,
          isROwner,
          isOwner,
          isRAdmin,
          isAdmin,
          isBotAdmin,
          isPrems
        })
      if (typeof plugin.before === 'function') {
        if (await plugin.before.call(this, m, properPluginsBefore)) {
          continue;
        }
      }
      if (typeof plugin !== 'function') {
        continue;
      }
      if ((usedPrefix = (match[0] || '')[0])) {
        const noPrefix = m.text.replace(usedPrefix, '');
        let [command, ...args] = noPrefix.trim().split` `.filter((v) => v);
        args = args || [];
        const _args = noPrefix.trim().split` `.slice(1);
        const text = _args.join` `;
        command = (command || '').toLowerCase();
        const fail = plugin.fail || global.dfail; // When failed
        const isAccept = plugin.command instanceof RegExp ? // RegExp Mode?
          plugin.command.test(command) :
          Array.isArray(plugin.command) ? // Array?
            plugin.command.some((cmd) => cmd instanceof RegExp ? // RegExp in Array?
              cmd.test(command) :
              cmd === command,
            ) :
            typeof plugin.command === 'string' ? // String?
              plugin.command === command :
              false;

        if (!isAccept) {
          continue;
        }

       if (m.id.startsWith('EVO') || m.id.startsWith('Lyru-') || (m.id.startsWith('BAE5') && m.id.length === 16) || m.id.startsWith('B24E') || (m.id.startsWith('8SCO') && m.id.length === 20) || m.id.startsWith('FizzxyTheGreat-')) return

        m.plugin = name;
        if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
          const chat = global.db.data.chats[m.chat];
          const user = global.db.data.users[m.sender];
          const botSpam = global.db.data.settings[mconn.conn.user?.id] || {};

          if (!['owner-unbanchat.js', 'info-creator.js'].includes(name) && chat && chat?.isBanned && !isROwner) return; // Except this
          if (name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && chat?.isBanned && !isROwner) return; // Except this
          //if ((name != 'owner-unbanchat.js' || name != 'owner-exec.js' || name != 'owner-exec2.js') && chat?.isBanned && !isROwner) return; // Except this
                    
          if (m.text && user.banned && !isROwner) {
            if (typeof user.bannedMessageCount === 'undefined') {
              user.bannedMessageCount = 0;
            }

            if (user.bannedMessageCount < 3) {
              const messageNumber = user.bannedMessageCount + 1;
              const messageText = `${tradutor.texto1[0]}
${tradutor.texto1[1]} ${messageNumber}/3
 ${user.bannedReason ? `${tradutor.texto1[2]} ${user.bannedReason}` : `${tradutor.texto1[3]}`}
 ${tradutor.texto1[4]}`.trim();
              m.reply(messageText);
              user.bannedMessageCount++;
            } else if (user.bannedMessageCount === 3) {
              user.bannedMessageSent = true;
            } else {
              return;
            }
            return;
          }

          if (botSpam.antispam && m.text && user && user.lastCommandTime && (Date.now() - user.lastCommandTime) < 5000 && !isROwner) {
            if (user.commandCount === 2) {
              const remainingTime = Math.ceil((user.lastCommandTime + 5000 - Date.now()) / 1000);
              if (remainingTime > 0) {
                const messageText = `*[ ℹ️ ] Espera* _${remainingTime} segundos_ *antes de utilizar otro comando.*`;
                m.reply(messageText);
                return;
              } else {
                user.commandCount = 0;
              }
            } else {
              user.commandCount += 1;
            }
          } else {
            user.lastCommandTime = Date.now();
            user.commandCount = 1;
          }
        }
        const hl = _prefix;
        const adminMode = global.db.data.chats[m.chat].modoadmin;
        const mystica = `${plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || hl || m.text.slice(0, 1) == hl || plugin.command}`;
        if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mystica) return;

        if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { // Both Owner
          fail('owner', m, this);
          continue;
        }
        if (plugin.rowner && !isROwner) { // Real Owner
          fail('rowner', m, this);
          continue;
        }
        if (plugin.owner && !isOwner) { // Number Owner
          fail('owner', m, this);
          continue;
        }
        if (plugin.mods && !isMods) { // Moderator
          fail('mods', m, this);
          continue;
        }
        if (plugin.premium && !isPrems) { // Premium
          fail('premium', m, this);
          continue;
        }
        if (plugin.group && !m.isGroup) { // Group Only
          fail('group', m, this);
          continue;
        } else if (plugin.botAdmin && !isBotAdmin) { // You Admin
          fail('botAdmin', m, this);
          continue;
        } else if (plugin.admin && !isAdmin) { // User Admin
          fail('admin', m, this);
          continue;
        }
        if (plugin.private && m.isGroup) { // Private Chat Only
          fail('private', m, this);
          continue;
        }
        if (plugin.register == true && _user.registered == false) { // Butuh daftar?
          fail('unreg', m, this);
          continue;
        }
        m.isCommand = true;
        const xp = 'exp' in plugin ? parseInt(plugin.exp) : 17; // XP Earning per command
        if (xp > 200) {
          m.reply('Ngecit -_-');
        } // Hehehe
        else {
          m.exp += xp;
        }
        if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
          mconn.conn.reply(m.chat, `${tradutor.texto2} _${usedPrefix}buyall_`, m);
          continue;
        }
        if (plugin.level > _user.level) {
          mconn.conn.reply(m.chat, `${tradutor.texto3[0]} ${plugin.level} ${tradutor.texto3[1]} ${_user.level}, ${tradutor.texto3[2]} ${usedPrefix}lvl ${tradutor.texto3[3]}`, m);
          continue;
        }
        const chatPrim = global.db.data.chats[m.chat] || {};
        const normalizeJid = (jid) => jid?.replace(/[^0-9]/g, '');
        const isActiveBot = (jid) => {
          const normalizedJid = normalizeJid(jid) + '@s.whatsapp.net';
          return botIs(global.conn, normalizedJid) ||
            (global.conns || []).some((bot) => botIs(bot, normalizedJid));
        };
        if (chatPrim.setPrimaryBot) {
            const primaryNumber = normalizeJid(chatPrim.setPrimaryBot) + '@s.whatsapp.net';
            if (!isActiveBot(chatPrim.setPrimaryBot)) {
              console.log(`⚠ Bot primario ${primaryNumber} no está activo - Liberando chat`);
              delete chatPrim.setPrimaryBot;
              global.db.data.chats[m.chat] = chatPrim
            }
            else if (primaryNumber && !botIs(mconn.conn, primaryNumber)) {
            return;
          }
        }
        const properPluginsHandler = Object.assign(properPluginsBefore, {
          usedPrefix,
          noPrefix,
          _args,
          args,
          command,
          text
        });
        try {
          await plugin.call(this, m, properPluginsHandler);
          if (!isPrems) {
            m.limit = m.limit || plugin.limit || false;
          }
        } catch (e) {
          m.error = e;
          console.error(e);
          if (e) {
            let text = format(e);
            for (const key of Object.values(global.APIKeys)) {
              text = text.replace(new RegExp(key, 'g'), '#HIDDEN#');
            }
            if (e.name) {
              /* for (const [jid] of global.reportes_solicitudes.filter(([number]) => number)) {
                const data = (await conn.onWhatsApp(jid))[0] || {};
                if (data.exists) {
                  await m.reply(`*[ ⚠️ 𝚁𝙴𝙿𝙾𝚁𝚃𝙴 𝙳𝙴 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙲𝙾𝙽 𝙵𝙰𝙻𝙻𝙾𝚂 ⚠️ ]*\n\n*—◉ 𝙿𝙻𝚄𝙶𝙸𝙽:* ${m.plugin}\n*—◉ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾:* ${m.sender}\n*—◉ 𝙲𝙾𝙼𝙰𝙽𝙳𝙾:* ${usedPrefix}${command} ${args.join(' ')}\n\n\`\`\`${text}\`\`\`\n\n*[❗] 𝚁𝙴𝙿𝙾𝚁𝚃𝙴𝙻𝙾 𝙰𝙻 𝙲𝚁𝙴𝙰𝙳𝙾𝚁 𝙳𝙴𝙻 𝙱𝙾𝚃 𝙿𝙰𝚁𝙰 𝙳𝙰𝚁𝙻𝙴 𝚄𝙽𝙰 𝚂𝙾𝙻𝚄𝙲𝙸𝙾𝙽, 𝙿𝚄𝙴𝙳𝙴 𝚄𝚂𝙰𝚁 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 #reporte*`.trim(), data.jid);
                }
              }*/
              const md5c = fs.readFileSync('./plugins/' + m.plugin);
              /*fetch('https://themysticbot.cloud:2083/error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: conn.user.jid, plugin: m.plugin, command: `${usedPrefix}${command} ${args.join(' ')}`, reason: text, md5: mddd5(md5c) }),
              }).then((res) => res.json()).then((json) => {
                console.log(json);
              }).catch((err) => {
                console.error(err);
              });*/
            }
            await m.reply(text);
          }
        } finally {
          // m.reply(util.format(_user))
          if (typeof plugin.after === 'function') {
            try {
              await plugin.after.call(this, m, extra);
            } catch (e) {
              console.error(e);
            }
          }
          if (m.limit) {
            m.reply(`${tradutor.texto4[0]} ` + +m.limit + ` ${tradutor.texto4[1]}`);
          }
        }
        break;
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    if (opts['queque'] && m.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id);
      if (quequeIndex !== -1) {
        this.msgqueque.splice(quequeIndex, 1);
      }
    }
    let user; const stats = global.db.data.stats;
    if (m) {
      if (m.sender && (user = global.db.data.users[m.sender])) {
        user.exp += m.exp;
        user.limit -= m.limit * 1;
      }

      let stat;
      if (m.plugin) {
        const now = +new Date;
        if (m.plugin in stats) {
          stat = stats[m.plugin];
          if (!isNumber(stat.total)) {
            stat.total = 1;
          }
          if (!isNumber(stat.success)) {
            stat.success = m.error != null ? 0 : 1;
          }
          if (!isNumber(stat.last)) {
            stat.last = now;
          }
          if (!isNumber(stat.lastSuccess)) {
            stat.lastSuccess = m.error != null ? 0 : now;
          }
        } else {
          stat = stats[m.plugin] = {
            total: 1,
            success: m.error != null ? 0 : 1,
            last: now,
            lastSuccess: m.error != null ? 0 : now,
          };
        }
        stat.total += 1;
        stat.last = now;
        if (m.error == null) {
          stat.success += 1;
          stat.lastSuccess = now;
        }
      }
    }

    try {
      if (!opts['noprint']) await (await import(`./src/libraries/print.js`)).default(m, this);
    } catch (e) {
      console.log(m, m.quoted, e);
    }
    const settingsREAD = global.db.data.settings[mconn.conn.user?.id] || {};
    if (opts['autoread']) await mconn.conn.readMessages([m.key]);
    if (settingsREAD.autoread2) await mconn.conn.readMessages([m.key]);
  }
}

/**
 * Handle groups participants update
 * @param {import("baileys").BaileysEventMap<unknown>['group-participants.update']} groupsUpdate
 */
export async function participantsUpdate({ id, participants, action }) {
  const idioma = global?.db?.data?.chats[id]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.handler.participantsUpdate

  const m = mconn
  if (opts['self']) return;
  if (global.db.data == null) await loadDatabase();
  const chat = global.db.data.chats[id] || {};
  const botTt = global.db.data.settings[mconn?.conn?.user?.id] || {};
  let text = '';
  switch (action) {
    case 'add':
    case 'remove':
      if (chat.welcome && !chat?.isBanned) {
        if (action === 'remove' && participants.some((p) => botIs(m?.conn, p))) return;
        const groupMetadata = await m?.conn?.groupMetadata(id) || (conn?.chats[id] || {}).metadata;
        for (const user of participants) {
          try {
          let pp = await m?.conn?.profilePictureUrl(user, 'image').catch(_ => 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60');
           const apii = await mconn?.conn?.getFile(pp);
           const antiArab = JSON.parse(fs.readFileSync('./src/antiArab.json'));
           const userPrefix = antiArab.some((prefix) => user.startsWith(prefix));
           const botTt2 = groupMetadata?.participants?.find((u) => participantMatches(u, m?.conn?.user?.id || m?.conn?.user?.lid || '')) || {};
           const isBotAdminNn = botTt2?.admin === 'admin' || false;
           text = (action === 'add' ? (chat.sWelcome || tradutor.texto1 || conn.welcome || 'Welcome, @user!').replace('@subject', await m?.conn?.getName(id)).replace('@desc', groupMetadata?.desc?.toString() || '*𝚂𝙸𝙽 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝙲𝙸𝙾𝙽*').replace('@user', '@' + user.split('@')[0]) :
            (chat.sBye || tradutor.texto2 || conn.bye || 'Bye, @user!')).replace('@user', '@' + user.split('@')[0]);
            if (userPrefix && chat.antiArab && botTt.restrict && isBotAdminNn && action === 'add') {
           const responseb = await m.conn.groupParticipantsUpdate(id, [user], 'remove');
            if (responseb[0].status === '404') return;
           const fkontak2 = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${user.split('@')[0]}:${user.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
           await m?.conn?.sendMessage(id, { text: `*[❗] @${user.split('@')[0]} ᴇɴ ᴇsᴛᴇ ɢʀᴜᴘᴏ ɴᴏ sᴇ ᴘᴇʀᴍɪᴛᴇɴ ɴᴜᴍᴇʀᴏs ᴀʀᴀʙᴇs ᴏ ʀᴀʀᴏs, ᴘᴏʀ ʟᴏ ϙᴜᴇ sᴇ ᴛᴇ sᴀᴄᴀʀᴀ ᴅᴇʟ ɢʀᴜᴘᴏ*`, mentions: [user] }, { quoted: fkontak2 });
           return;
            }
            await m?.conn?.sendFile(id, apii.data, 'pp.jpg', text, null, false, { mentions: [user] });
          } catch (e) {
          console.log(e);
          }
        }
      }
      break;
    case 'promote':
    case 'daradmin':
    case 'darpoder':
      text = (chat.sPromote || tradutor.texto3 || conn?.spromote || '@user ```is now Admin```');
    case 'demote':
    case 'quitarpoder':
    case 'quitaradmin':
      if (!text) {
        text = (chat?.sDemote || tradutor.texto4 || conn?.sdemote || '@user ```is no longer Admin```');
      }
      text = text.replace('@user', '@' + participants[0].split('@')[0]);
      if (chat.detect && !chat?.isBanned) {
        mconn?.conn?.sendMessage(id, { text, mentions: mconn?.conn?.parseMention(text) });
      }
      break;
  }
}

/**
 * Handle groups update
 * @param {import("baileys").BaileysEventMap<unknown>['groups.update']} groupsUpdate
 */

export async function groupsUpdate(groupsUpdate) {
  const idioma = global.db.data.chats[groupsUpdate[0].id]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.handler.participantsUpdate

  if (opts['self']) {
    return;
  }
  for (const groupUpdate of groupsUpdate) {
    const id = groupUpdate.id;
    if (!id) continue;
    if (groupUpdate.size == NaN) continue;
    if (groupUpdate.subjectTime) continue;
    const chats = global.db.data.chats[id]; 
    let text = '';
    if (!chats?.detect) continue;
    if (groupUpdate?.desc) text = (chats?.sDesc || tradutor.texto5 || conn?.sDesc || '```Description has been changed to```\n@desc').replace('@desc', groupUpdate.desc);
    if (groupUpdate?.subject) text = (chats?.sSubject || tradutor.texto6 || conn?.sSubject || '```Subject has been changed to```\n@subject').replace('@subject', groupUpdate.subject);
    if (groupUpdate?.icon) text = (chats?.sIcon || tradutor.texto7 || conn?.sIcon || '```Icon has been changed to```').replace('@icon', groupUpdate.icon);
    if (groupUpdate?.revoke) text = (chats?.sRevoke || tradutor.texto8 || conn?.sRevoke || '```Group link has been changed to```\n@revoke').replace('@revoke', groupUpdate.revoke);
    if (!text) continue;
    await mconn?.conn?.sendMessage(id, { text, mentions: mconn?.conn?.parseMention(text) });
  }
}

export async function callUpdate(callUpdate) {
  const isAnticall = global?.db?.data?.settings[mconn?.conn?.user?.id]?.antiCall;
  if (!isAnticall) return;
  for (const nk of callUpdate) {
    if (nk.isGroup == false) {
      if (nk.status == 'offer') {
        const callmsg = await mconn?.conn?.reply(nk.from, `Hola *@${nk.from.split('@')[0]}*, las ${nk.isVideo ? 'videollamadas' : 'llamadas'} no están permitidas, serás bloqueado.\n-\nSi accidentalmente llamaste póngase en contacto con mi creador para que te desbloquee!`, false, { mentions: [nk.from] });
        // let data = global.owner.filter(([id, isCreator]) => id && isCreator)
        // await this.sendContact(nk.from, data.map(([id, name]) => [id, name]), false, { quoted: callmsg })
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑;;;\nFN:𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑\nORG:𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑\nTITLE:\nitem1.TEL;waid=5219992095479:+521 999 209 5479\nitem1.X-ABLabel:𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑\nX-WA-BIZ-DESCRIPTION:[❗] ᴄᴏɴᴛᴀᴄᴛᴀ ᴀ ᴇsᴛᴇ ɴᴜᴍ ᴘᴀʀᴀ ᴄᴏsᴀs ɪᴍᴘᴏʀᴛᴀɴᴛᴇs.\nX-WA-BIZ-NAME:𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑\nEND:VCARD`;
        await mconn.conn.sendMessage(nk.from, { contacts: { displayName: '𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑', contacts: [{ vcard }] } }, { quoted: callmsg });
        await mconn.conn.updateBlockStatus(nk.from, 'block');
      }
    }
  }
}

export async function deleteUpdate(message) {
  const datas = global
  const id = message?.participant 
  const idioma = datas.db.data.users[id]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.handler.deleteUpdate

  let d = new Date(new Date + 3600000)
  let date = d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
  let time = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })
  try {
    const { fromMe, id, participant } = message
    if (fromMe) return
    let msg = mconn.conn.serializeM(mconn.conn.loadMessage(id))
    let chat = global.db.data.chats[msg?.chat] || {}
    if (!chat?.antidelete) return
    if (!msg) return
    if (!msg?.isGroup) return
    const antideleteMessage = `${tradutor.texto1[0]}
${tradutor.texto1[1]} @${participant.split`@`[0]}
${tradutor.texto1[2]} ${time}
${tradutor.texto1[3]} ${date}\n
${tradutor.texto1[4]}
${tradutor.texto1[5]}`.trim();
    await mconn.conn.sendMessage(msg.chat, { text: antideleteMessage, mentions: [participant] }, { quoted: msg })
    mconn.conn.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
  } catch (e) {
    console.error(e)
  }
}

global.dfail = (type, m, conn) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.handler.dfail

  const msg = {
    rowner: tradutor.texto1,
    owner: tradutor.texto2,
    mods: tradutor.texto3,
    premium: tradutor.texto4,
    group: tradutor.texto5,
    private: tradutor.texto6,
    admin: tradutor.texto7,
    botAdmin: tradutor.texto8,
    unreg: tradutor.texto9,
    restrict: tradutor.texto10,
  }[type];
  const aa = { quoted: m, userJid: conn.user?.id || conn.user?.jid };
  const prep = generateWAMessageFromContent(m.chat, { extendedTextMessage: { text: msg, contextInfo: { externalAdReply: { title: tradutor.texto11[0], body: tradutor.texto11[1], thumbnail: imagen1, sourceUrl: tradutor.texto11[2] } } } }, aa);

  const chatPrim2 = global.db.data.chats[m.chat] || {};
  const normalizeJid2 = (jid) => jid?.replace(/[^0-9]/g, '');
  const isActiveBot2 = (jid) => {
    const normalizedJid2 = normalizeJid2(jid) + '@s.whatsapp.net';
    return botIs(global.conn, normalizedJid2) ||
      (global.conns || []).some((bot) => botIs(bot, normalizedJid2));
  };
  if (chatPrim2.setPrimaryBot) {
    const primaryNumber2 = normalizeJid2(chatPrim2.setPrimaryBot) + '@s.whatsapp.net';
    if (!isActiveBot2(chatPrim2.setPrimaryBot)) {
      delete chatPrim2.setPrimaryBot;
      global.db.data.chats[m.chat] = chatPrim2
    }
    else if (primaryNumber2 && !botIs(mconn.conn, primaryNumber2)) {
      return;
    }
  } else if (msg) return conn.relayMessage(m.chat, prep.message, { messageId: prep.key.id });
};

const file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
  unwatchFile(file);
  console.log(chalk.redBright('Update \'handler.js\''));
  if (global.reloadHandler) await global.reloadHandler(true);//console.log()

});
/*

  if (global.conns && global.conns.length > 0) {
    const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
    for (const userr of users) {
      userr.subreloadHandler(false)
    }
  }*/