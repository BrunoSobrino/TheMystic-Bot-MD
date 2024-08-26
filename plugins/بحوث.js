import cp, { exec as _exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const exec = promisify(_exec).bind(cp);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (m, { conn, isROwner, usedPrefix, command, text }) => {
  const pluginDir = path.join(__dirname, '../plugins');
  const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));

  if (!text) throw `*❆━━━═⏣⊰🔱⊱⏣═━━━❆*\n\n*يرجى إدخال الكلمة التي ترغب في البحث عنها في الأكواد الموجودة*\n\n*❆━━━═⏣⊰🔱⊱⏣═━━━❆*`;

  let foundFiles = [];

  for (let file of files) {
    const filePath = path.join(pluginDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    if (content.includes(text)) {
      foundFiles.push(filePath);
    }
  }

  if (foundFiles.length === 0) {
    return m.reply(`*❆━━━═⏣⊰🔱⊱⏣═━━━❆*\n\n*لم يتم العثور على الكلمة* *"${text}"* *في أي ملف من الملفات الموجودة.*\n\n*❆━━━═⏣⊰🔱⊱⏣═━━━❆*`);
  }

  for (let file of foundFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const fileName = path.basename(file);

    await conn.sendMessage(m.chat, { text: content }, { quoted: m });
    await conn.sendMessage(m.chat, { document: fs.readFileSync(file), mimetype: 'application/javascript', fileName }, { quoted: m });
  }
};

handler.help = ['ابحث'].map(v => v + ' *<الكلمة>*');
handler.tags = ['owner'];
handler.command = /^(بحوث|sp)$/i;
handler.owner = true;

export default handler;
