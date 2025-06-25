import { exec } from 'child_process';
import { writeFile, chmod, access, constants } from 'fs/promises';
import { existsSync } from 'fs';

async function verifyDependencies() {
  if (!existsSync('./node_modules') || !existsSync('./package-lock.json')) {
    try {
      await new Promise((resolve, reject) => {
        exec('npm install --package-lock --silent', (error) => {
          error ? reject(error) : resolve();
        });
      });
    } catch (error) {
      throw new Error('Error al instalar dependencias');
    }
  }
}

async function downloadBinary() {
  try {
    await exec('curl -sSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp');
  } catch {
    const response = await fetch('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp');
    await writeFile('./yt-dlp', Buffer.from(await response.arrayBuffer()));
  }
}

async function install() {
  try {
    await verifyDependencies();
    await downloadBinary();
    await chmod('./yt-dlp', 0o755);
    
    const version = await new Promise(resolve => {
      exec('./yt-dlp --version', (error, stdout) => {
        resolve(error ? 'unknown' : stdout.trim());
      });
    });
    
    console.log(`yt-dlp ${version} instalado`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

install();
