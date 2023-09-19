//g
import { execSync } from 'child_process';

const handler = async (m, { conn, text }) => {
  try {
    if (global.conn.user.jid == conn.user.jid) {
          const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''));
          let messager = stdout.toString()
          if (messager.includes('Already up to date.')) messager = '*[❗] Tienes todo actualiado.*'
          conn.reply(m.chat, messager, m);
    }
  } catch {      
 try {    
      const status = execSync('git status --porcelain');
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            if (line.includes('.npm/') || line.includes('.cache/') || line.includes('tmp/') || line.includes('MysticSession/')) {
              return null;
            }
            return '*◉ ' + line.slice(3) + '*';
          })
          .filter(Boolean);
        if (conflictedFiles.length > 0) {
          const errorMessage = `*[❗] Se han hecho cambios en los archivos del Bot en local y causa conflictos al actualizar ya que igual se han modificado en el repositorio oficial.*\n\n*—◉ Archivos con conflicto:*\n${conflictedFiles.join('\n')}\n\n*—◉ Si deseas actualizar el Bot, deberás reinstalar el Bot o hacer las actualizaciones manualmente.*`;
          await conn.reply(m.chat, errorMessage, m);  
        }
      }
  } catch (error) {
    console.error(error);
    let errorMessage2 = 'An error occurred while executing the command.';
    if (error.message) {
      errorMessage2 += '\nError message: ' + error.message;
    }
    await conn.reply(m.chat, errorMessage2, m);
  }
 }
};
handler.help = ['update'];
handler.tags = ['owner'];
handler.command = /^(update2|actualizar)$/i;
handler.rowner = true;
export default handler;
