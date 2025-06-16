import { exec } from 'child_process';
import { writeFile, chmod } from 'fs/promises';

async function runCommand(command, description) {
  console.log(`Ejecutando: ${description}...`);
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}

async function installYtDlp() {
  try {
    try {
      await runCommand('curl -sSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp', 'Descargando yt-dlp con curl');
    } catch {
      console.log('curl no disponible, usando Node.js para descargar...');
      const response = await fetch('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp');
      const data = await response.arrayBuffer();
      await writeFile('./yt-dlp', Buffer.from(data));
    }
    await chmod('./yt-dlp', 0o755);
    await runCommand('./yt-dlp --version', 'Verificando yt-dlp');
    console.log('✅ yt-dlp instalado correctamente como binario standalone');
    console.log('Úsalo con: ./yt-dlp [URL]');
  } catch (error) {
    console.error('❌ Error crítico:', error.message);
    console.log('⚠️ Solución alternativa:');
    console.log('1. Descarga manualmente yt-dlp desde:');
    console.log('   https://github.com/yt-dlp/yt-dlp/releases');
    console.log('2. Súbelo a tu servidor como "yt-dlp"');
    console.log('3. Ejecuta: chmod +x yt-dlp');
  }
}

installYtDlp();
