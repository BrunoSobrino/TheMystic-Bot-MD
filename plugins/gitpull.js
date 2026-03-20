import { execSync } from 'child_process';
import fs from 'fs';

const handler = async (m, { conn, text }) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.propietario.actualizar

  await conn.reply(m.chat, '🔍 Verificando actualizaciones en el repositorio...', m);

  try {
    // Primero hacer fetch para obtener los cambios más recientes
    console.log('Verificando actualizaciones remotas...');
    execSync('git fetch origin', { stdio: 'pipe' });
    
    // Verificar si hay commits nuevos en el remoto
    const localCommit = execSync('git rev-parse HEAD').toString().trim();
    const remoteCommit = execSync('git rev-parse origin/main').toString().trim();
    
    if (localCommit === remoteCommit) {
      await conn.reply(m.chat, '✅ ' + (tradutor.texto1 || 'Ya estás actualizado. No hay cambios nuevos.'), m);
      return;
    }
    
    // Mostrar cuántos commits hay pendientes
    const commitCount = execSync('git rev-list --count HEAD..origin/main').toString().trim();
    await conn.reply(m.chat, `🔄 Encontrados ${commitCount} commit(s) nuevos. Iniciando actualización...`, m);
    
    // Hacer el pull
    const stdout = execSync('git pull origin main' + (m.fromMe && text ? ' ' + text : ''));
    let messager = stdout.toString();
    
    if (messager.includes('Already up to date.')) {
      messager = '✅ ' + (tradutor.texto1 || 'Ya estás actualizado.');
    } else if (messager.includes('Updating')) {
      messager = '🎉 ' + (tradutor.texto2 || 'Actualización completada:\n') + '\n```\n' + stdout.toString() + '\n```';
    }
    
    await conn.reply(m.chat, messager, m);
    
    // Opcional: reiniciar el bot automáticamente después de la actualización
    if (messager.includes('Updating')) {
      await conn.reply(m.chat, '♻️ Reiniciando bot para aplicar cambios...', m);
      process.exit(0); // Esto reiniciará el bot si tienes PM2 o similar
    }
    
  } catch (error) {
    console.error('Error en git pull:', error);
    
    try {
      // Verificar si hay archivos en conflicto
      const status = execSync('git status --porcelain');
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            // Filtrar archivos temporales o de cache
            if (line.includes('.npm/') || 
                line.includes('.cache/') || 
                line.includes('tmp/') || 
                line.includes('MysticSession/') || 
                line.includes('npm-debug.log') ||
                line.includes('node_modules/')) {
              return null;
            }
            return '*→ ' + line.slice(3) + '*';
          })
          .filter(Boolean);
          
        if (conflictedFiles.length > 0) {
          const errorMessage = `⚠️ ${tradutor.texto3 || 'Archivos modificados localmente'}\n\n${conflictedFiles.join('\n')}`;
          await conn.reply(m.chat, errorMessage, m);
          
          // Opción para forzar la actualización
          await conn.reply(m.chat, '💡 Solución: Elimina o respalda los archivos modificados y ejecuta el comando nuevamente', m);
        }
      }
    } catch (statusError) {
      console.error('Error checking git status:', statusError);
      let errorMessage2 = '❌ ' + (tradutor.texto4 || 'Error durante la actualización');
      if (error.message) {
        errorMessage2 += '\n*- Mensaje de error:* ' + error.message;
      }
      await conn.reply(m.chat, errorMessage2, m);
    }
  }
};

// Función para verificar actualizaciones automáticamente (opcional)
export const checkAutoUpdate = async (conn) => {
  try {
    execSync('git fetch origin', { stdio: 'pipe' });
    const localCommit = execSync('git rev-parse HEAD').toString().trim();
    const remoteCommit = execSync('git rev-parse origin/main').toString().trim();
    
    if (localCommit !== remoteCommit) {
      const commitCount = execSync('git rev-list --count HEAD..origin/main').toString().trim();
      // Enviar notificación al owner
      const ownerNumber = global.owner[0][0] + '@s.whatsapp.net';
      await conn.sendMessage(ownerNumber, {
        text: `🔔 *Actualización disponible*\n\n📝 ${commitCount} commit(s) nuevos encontrados.\n\n💡 Usa el comando *gitpull2* para actualizar.`
      });
    }
  } catch (error) {
    console.error('Error checking auto update:', error);
  }
};

handler.help = ['gitpull2'];
handler.tags = ['owner'];
handler.command = /^(gitpull2)$/i;
handler.rowner = true;

export default handler;
