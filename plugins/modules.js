import cp, {
  exec as _exec
} from 'child_process';
import {
  promisify
} from 'util';
import fs from 'fs';
let exec = promisify(_exec).bind(cp);

let handler = async (m, {
  conn,
  isOwner,
  command,
  text
}) => {
  if (global.conn.user.jid != conn.user.jid) return;
  m.reply('Executing...');

  const compressedFilePath = 'node_modules.tar.gz';
  if (!fs.existsSync(compressedFilePath)) {
      try {
          await exec('tar -czf node_modules.tar.gz node_modules');
          m.reply('تم بنجاح إنشاء ملف الموديلز \n node_modules.tar.gz!');
      } catch (e) {
          m.reply('فشل في انشاء\n node_modules.tar.gz');
          return; // Stop execution if tar command failed
      }
  } else {
      m.reply('ملف \n*node_modules.tar.gz*موجود سابقا...');
  }

  // Check again if the file exists after compression attempt
  if (fs.existsSync(compressedFilePath)) {
      const compressedData = fs.readFileSync(compressedFilePath);
      await conn.sendMessage(
          m.chat, {
              document: compressedData,
              mimetype: 'application/gz',
              fileName: 'node_modules.tar.gz',
          }, {
              quoted: m,
          }
      );
  } else {
      m.reply('*لم يتم العثور على الملف. ربما فشل الضغط*.');
  }
};

handler.help = ['modules'];
handler.tags = ['owner'];
handler.command = /^(modules)$/i;
handler.rowner = true;

export default handler;
