/**
 * @type {import('@whiskeysockets/baileys')}
 */
const {
  proto,
  generateWAMessage,
  areJidsSameUser,
  decryptPollVote,
} = (await import('@whiskeysockets/baileys')).default;

export async function all(m, chatUpdate) {
  /* if (m.message.pollUpdateMessage) {
    console.log(m.message.pollUpdateMessage)
    console.log(m.message.pollUpdateMessage.pollCreationMessageKey)
    let authcode = "eed1zxI49cxiovBTUFLIEWi1shD9HgIOghONuqPDGTk="
    let xds = decryptPollVote({
      encPayload: m.message.pollUpdateMessage.vote.encPayload,
      encIv: m.message.pollUpdateMessage.vote.encIv,
    }, {
      pollCreatorJid: m.message.pollUpdateMessage.pollCreationMessageKey.participant,
      pollMsgId: m.message.pollUpdateMessage.pollCreationMessageKey.id,
      pollEncKey: authcode, //Uint8Array.from(authcode.split('').map(letter => letter.charCodeAt(0))),
      voterJid: m.sender,
    })
    console.log(xds)
}*/
  if (m.isBaileys) {
    return;
  }
  if (!m.message) {
    return;
  }
  if (!(m.message.buttonsResponseMessage || m.message.templateButtonReplyMessage || m.message.listResponseMessage || m.message.interactiveResponseMessage)) {
    return;
  }
  let id;
  if (m.message.buttonsResponseMessage) {
    id = m.message.buttonsResponseMessage.selectedButtonId;
  } else if (m.message.templateButtonReplyMessage) {
    id = m.message.templateButtonReplyMessage.selectedId;
  } else if (m.message.listResponseMessage) {
    id = m.message.listResponseMessage.singleSelectReply?.selectedRowId;
  } else if (m.message.interactiveResponseMessage) {
    id = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id;
  }
  const text = m.message.buttonsResponseMessage?.selectedDisplayText || m.message.templateButtonReplyMessage?.selectedDisplayText || m.message.listResponseMessage?.title;
  let isIdMessage = false; 
  let usedPrefix;
  for (const name in global.plugins) {
    const plugin = global.plugins[name];
    if (!plugin) {
      continue;
    }
    if (plugin.disabled) {
      continue;
    }
    if (!opts['restrict']) {
      if (plugin.tags && plugin.tags.includes('admin')) {
        continue;
      }
    }
    if (typeof plugin !== 'function') {
      continue;
    }
    if (!plugin.command) {
      continue;
    }
    const str2Regex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    const _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix;
    const match = (_prefix instanceof RegExp ?
      [[_prefix.exec(id), _prefix]] :
      Array.isArray(_prefix) ?
        _prefix.map((p) => {
          const re = p instanceof RegExp ?
            p :
            new RegExp(str2Regex(p));
          return [re.exec(id), re];
        }) :
        typeof _prefix === 'string' ?
          [[new RegExp(str2Regex(_prefix)).exec(id), new RegExp(str2Regex(_prefix))]] :
          [[[], new RegExp]]
    ).find((p) => p[1]);
    if ((usedPrefix = (match[0] || '')[0])) {
      const noPrefix = id.replace(usedPrefix, '');
      let [command] = noPrefix.trim().split` `.filter((v) => v);
      command = (command || '').toLowerCase();
      const isId = plugin.command instanceof RegExp ?
        plugin.command.test(command) :
        Array.isArray(plugin.command) ?
          plugin.command.some((cmd) => cmd instanceof RegExp ?
            cmd.test(command) :
            cmd === command,
          ) :
          typeof plugin.command === 'string' ?
            plugin.command === command :
            false;
      if (!isId) {
        continue;
      }
      isIdMessage = true;
    }
  }
  const messages = await generateWAMessage(m.chat, {text: isIdMessage ? id : text, mentions: m.mentionedJid}, {
    userJid: this.user.id,
    quoted: m.quoted && m.quoted.fakeObj,
  });
  messages.key.fromMe = areJidsSameUser(m.sender, this.user.id);
  messages.key.id = m.key.id;
  messages.pushName = m.name;
  if (m.isGroup) {
    messages.key.participant = messages.participant = m.sender;
  }
  const msg = {
    ...chatUpdate,
    messages: [proto.WebMessageInfo.fromObject(messages)].map((v) => (v.conn = this, v)),
    type: 'append',
  };
  this.ev.emit('messages.upsert', msg);
}

/*const {
  proto,
  generateWAMessage,
  areJidsSameUser,
  decryptPollVote,
} = (await import('@whiskeysockets/baileys')).default;

export async function all(m, chatUpdate) {
  if (m.isBaileys) {
    return;
  }
  if (!m.message) {
    return;
  }
  if (!(m.message.buttonsResponseMessage || m.message.templateButtonReplyMessage || m.message.listResponseMessage)) {
    return;
  }
  const id = m.message.buttonsResponseMessage?.selectedButtonId || m.message.templateButtonReplyMessage?.selectedId || m.message.listResponseMessage?.singleSelectReply?.selectedRowId;
  const text = m.message.buttonsResponseMessage?.selectedDisplayText || m.message.templateButtonReplyMessage?.selectedDisplayText || m.message.listResponseMessage?.title;
  let isIdMessage = false; let usedPrefix;
  for (const name in global.plugins) {
    const plugin = global.plugins[name];
    if (!plugin) {
      continue;
    }
    if (plugin.disabled) {
      continue;
    }
    if (!opts['restrict']) {
      if (plugin.tags && plugin.tags.includes('admin')) {
        continue;
      }
    }
    if (typeof plugin !== 'function') {
      continue;
    }
    if (!plugin.command) {
      continue;
    }
    const str2Regex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    const _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix;
    const match = (_prefix instanceof RegExp ? // RegExp Mode?
            [[_prefix.exec(id), _prefix]] :
            Array.isArray(_prefix) ? // Array?
                _prefix.map((p) => {
                  const re = p instanceof RegExp ? // RegExp in Array?
                        p :
                        new RegExp(str2Regex(p));
                  return [re.exec(id), re];
                }) :
                typeof _prefix === 'string' ? // String?
                    [[new RegExp(str2Regex(_prefix)).exec(id), new RegExp(str2Regex(_prefix))]] :
                    [[[], new RegExp]]
    ).find((p) => p[1]);
    if ((usedPrefix = (match[0] || '')[0])) {
      const noPrefix = id.replace(usedPrefix, '');
      let [command] = noPrefix.trim().split` `.filter((v) => v);
      command = (command || '').toLowerCase();
      const isId = plugin.command instanceof RegExp ? // RegExp Mode?
                plugin.command.test(command) :
                Array.isArray(plugin.command) ? // Array?
                    plugin.command.some((cmd) => cmd instanceof RegExp ? // RegExp in Array?
                        cmd.test(command) :
                        cmd === command,
                    ) :
                    typeof plugin.command === 'string' ? // String?
                        plugin.command === command :
                        false;
      if (!isId) {
        continue;
      }
      isIdMessage = true;
    }
  }
  const messages = await generateWAMessage(m.chat, {text: isIdMessage ? id : text, mentions: m.mentionedJid}, {
    userJid: this.user.id,
    quoted: m.quoted && m.quoted.fakeObj,
  });
  messages.key.fromMe = areJidsSameUser(m.sender, this.user.id);
  messages.key.id = m.key.id;
  messages.pushName = m.name;
  if (m.isGroup) {
    messages.key.participant = messages.participant = m.sender;
  }
  const msg = {
    ...chatUpdate,
    messages: [proto.WebMessageInfo.fromObject(messages)].map((v) => (v.conn = this, v)),
    type: 'append',
  };
  this.ev.emit('messages.upsert', msg);
}*/
