const handler = async (m, {conn, usedPrefix, command, args, isOwner, isAdmin, isROwner}) => {
  const optionsFull = `*الخيار:* ✨ | الترحيب
*الامر:* ${usedPrefix + command} الترحيب
*الوصف:* فتح او قفل الترحيب في الجروب.

--------------------------------

*الخيار:* 🌎 | مود العام
*الامر:* ${usedPrefix + command} عام
*الوصف:* يصبح البوت علنا او خاصا.
*الحاله:* لا يمكن استخدام هذا الامر الا بواسطه المطور.

--------------------------------

*الخيار:* 🔗 | مضاد اللينكات
*الامر:* ${usedPrefix + command} مضاداللينكات
*الحاله:* تشغيل او ايقاف مضاد لينكات الواتس.
*الحاله:* يجب ان يكون مفعلا.

--------------------------------

*الخيار:* 🔗 | مضاد اللنكات 2
*الامر:* ${usedPrefix + command} مضاداللينكات2
*الوصف:* تشغيل وا اقاف مضاد اي لنكات.
*الحاله:* يجب ان يكون مفعلا.

--------------------------------

*الخيار:* 🔎 | كشف
*الامر:* ${usedPrefix + command} كشف
*:* تنشيط او الغاء التعديل علي الوصف.

--------------------------------

*الخيار:* 🔎 | كشف 2
*الامر:* ${usedPrefix + command} كشف2
*الوصف:* يكشف التعديلات في المجموعه و يحافظ علي اداره افضل.

--------------------------------

*الخيار:* ❗ | يقيد
*الامر:* ${usedPrefix + command} تقيد
*وصف:* فتح او قفل قيود البوت مثلا  يطرد و يضيفه.
*حاله:* المطور بس الي يستعمل الامر ده.

--------------------------------

*الخيار:* ☑️ | القرائه التلقائي
*الامر:* ${usedPrefix + command} الصحين
*الوصف:* فتح او قفل القرائه التلقائي.
*الحاله:* المطور بس الي بيتسعمل الامر ده.

--------------------------------

*الخيار:* 🔊 |  اصوات
*الامر:* ${usedPrefix + command} اصوات
*الوصف:* فتح او قفل الريكات في الجروب.

--------------------------------

*الخيار:* 👾 | ستيكر تلقائي
*الامر:* ${usedPrefix + command} ستيكرتلقائي 
*الوصف:*تصبح جميع الصور أو مقاطع الفيديو المرسلة في المجموعة ملصقات. 

--------------------------------

*الخيار:* 💬 | خاص فقط
*الامر:* ${usedPrefix + command} برايفت
*الوصف:* سوف يستجيب البوت في الخاص بس.
*الحاله:* المطور بس الي يقدر يستعمل الامر ده.

--------------------------------

*الخيار:* 🏢 | جروبات فقط
*الامر:* ${usedPrefix + command} جروبات
*الوصف:* البوت هيشتغل في الجروبات بس. 
*الحاله:* المكور بس الي يستخدم الامر ده.

--------------------------------

*الخيار:* ❌ | مضاد الاخفاء
*الامر:* ${usedPrefix + command} مضادالاخفاء
*الوصف:* الصوره او الفيديو الذي يبعت ليرا مره واحده يبعت من البوت مره اخري بشكل طبيعي. 

--------------------------------

*الخيار:* 📵 | ممنوع الاتصال
*الامر:* ${usedPrefix + command} مضادالاتصال
*الوصف:* يبلك اي حد يرن علي رقم البوت. 
*الحاله:* المطور بس الي يستخدم الامر ده.

--------------------------------

*الخاله:* 💬 | مضاد الخاص
*الامر:* ${usedPrefix + command} مضادالخاص
*الوصف:* يبلك اي حد يكلم البوت خاص. 
*الحاله:* المطور بس الي يستخدم الامرد ده.

--------------------------------

*الخيار:* 🤬 | مضاد الشتائم
*الامر:* ${usedPrefix + command} مضادالشتائم
*الوصف:* يقوم بتحذير اي شخص سب او شتم او كتب شئ عيب واذا تجاوذ التحذيرات يقوم بطرده.
*الحاله:* يجب ان يكون التقيد مفعلا.

--------------------------------

*الخيار:* 🤖 | البوت الفرعي
*الامر:* ${usedPrefix + command} البوت-الفرعي
*الحاله:* تفعيل و اقاف امر (${usedPrefix}serbot / ${usedPrefix}jadibot). 
*الحاله:* المطور بس الي يقدر يستعمل الامر ده.

--------------------------------

*الخيار:* 👑 | الادمن
*الامر:* ${usedPrefix + command} الادمن-فقط
*الوصف:* سوف يجيب البوت علي الادمن فقط.

--------------------------------

*الخيار:* 😃 | سمسمي
*الامر:* ${usedPrefix + command} سمسمي
*الوصف:* هيبدا البوت يرد باستخدام الذكاء الصتناعي سمسمي.

--------------------------------

*الخيار:* ⏳ | مضاد الاسبام
*الامر:* ${usedPrefix + command} مضادالاسبام
*الوصف:* يكتشف البوت بعد ارسال 5 رسائل و يحظر المستخدم.
*الخاله:* المطور بس الي يستخدم الامر ده.

--------------------------------

*الخيار:* 🛡️ | مضاد الحذف
*الامر:* ${usedPrefix + command} مضادالحذف
*الوصف:* يكتشف البوت الرساله المحذوفه و يقوم بتحويلها للمستخدم.

--------------------------------

*الخيار:* 🔊 | صوت_بوت
*الامر:* ${usedPrefix + command} اصوات_البوت
*الوصف:* يتم الغاء جميعرالصوات الخاصه بالبوت .
*الحاله:* المطور بس الي يستخدم الامر ده.`.trim();

  const isEnable = /true|افتح|enable|(turn)?on|1/i.test(command);
  const chat = global.db.data.chats[m.chat];
  const user = global.db.data.users[m.sender];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const type = (args[0] || '').toLowerCase();
  let isAll = false; const isUser = false;
  switch (type) {
    case 'الترحيب':
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
    case 'كشف':
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
    case 'كشف2':
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
    case 'سمسمي':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
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
    case 'مضادالحذف':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antidelete = isEnable;
      break;
    case 'عام':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['self'] = !isEnable;
      break;
    case 'مضادالينكات':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiLink = isEnable;
      break;
    case 'مضاداللينكات2':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiLink2 = isEnable;
      break;
    case 'مضادالاخفاء':
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
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.modohorny = isEnable;
      break;
    case 'الادمن-فقط':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.modoadmin = isEnable;
      break;
    case 'ستيكرتلقائي':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.autosticker = isEnable;
      break;
    case 'اصوات':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.audios = isEnable;
      break;
    case 'تقيد':
      isAll = true;
      if (!isOwner) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.restrict = isEnable;
      break;
    case 'اصوات_البوت':
      isAll = true;
      if (!isOwner) {
        global.dfail('owner', m, conn);
        throw false;
      }
      bot.audios_bot = isEnable;      
      break;
    case 'nyimak':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['nyimak'] = isEnable;
      break;
    case 'الصحين':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.autoread2 = isEnable;
      global.opts['autoread'] = isEnable;
      break;
    case 'برايفت':
    case 'privateonly':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      global.opts['pconly'] = isEnable;
      break;
    case 'جروبات':
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
    case 'مضادالمكالمات':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.antiCall = isEnable;
      break;
    case 'مضادالخاص':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.antiPrivate = isEnable;
      break;
    case 'البوت-الفرعي':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.modejadibot = isEnable;
      break;
    case 'مضادالاسبام':
      isAll = true;
      if (!isROwner) {
        global.dfail('rowner', m, conn);
        throw false;
      }
      bot.antispam = isEnable;
      break;
    case 'مضادالشتائم':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiToxic = isEnable;
      break;
    case 'antitraba':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiTraba = isEnable;
      break;
    case 'antiarabes':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
          global.dfail('admin', m, conn);
          throw false;
        }
      }
      chat.antiArab = isEnable;
      break;
    case 'antiarabes2':
      if (m.isGroup) {
        if (!(isAdmin || isOwner)) {
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
  conn.sendMessage(m.chat, {text: `🗂️ الخيار: ${type}\n🎚️ ولايه: ${isEnable ? 'شغال' : 'قافل'}\n📣 ل: ${isAll ? 'هذا البوت' : isUser ? '' : 'هذا الدردشه'}`}, {quoted: m});
};
handler.help = ['en', 'dis'].map((v) => v + 'able <option>');
handler.tags = ['group', 'owner'];
handler.command = /^((en|dis)able|ا(فتح|قفل)|(turn)?[01])$/i;
export default handler;
