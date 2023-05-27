import { execSync } from 'child_process';

let handler = async (m, { conn, text }) => {
  try {
    if (global.conn.user.jid == conn.user.jid) {
      let stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''));
      conn.reply(m.chat, stdout.toString(), m);
    } 
  } catch (error) {
    console.error(error);
    let errorMessage = "An error occurred while executing the command.";
    if (error.message) {
      errorMessage += "\nError message: " + error.message;
    }
    await conn.reply(m.chat, errorMessage, m);
  }
};

handler.help = ['update']; 
handler.tags = ['owner']; 
handler.command = /^update|actualizar$/i;
handler.rowner = true; 
export default handler; 
