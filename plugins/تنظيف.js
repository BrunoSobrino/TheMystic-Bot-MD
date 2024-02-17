/* Codigo hecho por @Fabri115 y mejorado por BrunoSobrino */

import { readdirSync, unlinkSync, existsSync, promises as fs, rmSync } from 'fs';
import path from 'path';

const handler = async (m, { conn, usedPrefix }) => {
  if (global.conn.user.jid !== conn.user.jid) {
    return conn.sendMessage(m.chat, {text: '*[❗] استخدم هذا الأمر مباشرة في العدد الرئيسي من الروبوت.*'}, {quoted: m});
  }
  await conn.sendMessage(m.chat, {text: '*[❗] بدء حذف عملية جميع ملفات الجلسة ، باستثناء ملف creds.json...*'}, {quoted: m});
  const sessionPath = './MysticSession/';
  try {
    if (!existsSync(sessionPath)) {
      return await conn.sendMessage(m.chat, {text: '*[❗] مجلد 𝑁𝐴𝑇𝑺𝑈 غير موجود أو فارغ.*'}, {quoted: m});
    }
    const files = await fs.readdir(sessionPath);
    let filesDeleted = 0;
    for (const file of files) {
      if (file !== 'creds.json') {
        await fs.unlink(path.join(sessionPath, file));
        filesDeleted++;
      }
    }
    if (filesDeleted === 0) {
      await conn.sendMessage(m.chat, {text: '*[❗] لم يتم العثور على أي ملف لحذفه في مجلد 𝑁𝐴𝑇𝑺𝑈.*'}, {quoted: m});
    } else {
      await conn.sendMessage(m.chat, {text: `*[❗] تم حذف ${filesDeleted} ملفات الجلسة ، باستثناء ملف creds.json.*`}, {quoted: m});
    }
  } catch (err) {
    console.error('خطأ في قراءة المجلد أو ملفات الجلسة:', err);
    await conn.sendMessage(m.chat, {text: '*[❗] حدث خطأ عند إزالة ملفات الجلسة.*'}, {quoted: m});
  }
  await conn.sendMessage(m.chat, {text: `*👋 ¡Hola! Ahora me ves?*\n\n*[❗] اذا لم يرد البوت علي الامر جرب تبعت امر صغير 3 مرات*\n\n*—◉ مثلا:*\n${usedPrefix}s\n${usedPrefix}s\n${usedPrefix}s`}, {quoted: m});
};
handler.help = ['del_reg_in_session_owner'];
handler.tags = ['owner'];
handler.command = /^(del_reg_in_session_owner|تنظيف)$/i;
handler.rowner = true
export default handler;
