import { exec } from 'child_process';
import { writeFile, chmod, access, constants } from 'fs/promises';
import { existsSync } from 'fs';
import { createSpinner } from 'nanospinner';
import chalk from 'chalk';
import { execSync } from 'child_process'; 

async function runCommand(command, description) {
  const spinner = createSpinner(description).start();
  try {
    await new Promise((resolve, reject) => {
      exec(command, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    spinner.success();
    return true;
  } catch (error) {
    spinner.error({ text: chalk.red(error.message) });
    return false;
  }
}

async function checkDependencies() {
  if (!existsSync('./package-lock.json')) {
    const spinner = createSpinner(chalk.yellow('Generando package-lock.json...')).start();
    if (!await runCommand('npm install --package-lock', '')) {
      spinner.error({ text: chalk.red('Fallo al generar package-lock.json') });
      return false;
    }
    spinner.success();
  }

  try {
    await access('./node_modules', constants.F_OK);
    return true;
  } catch {
    const spinner = createSpinner(chalk.yellow('Instalando dependencias...')).start();
    if (!await runCommand('npm install', '')) {
      spinner.error({ text: chalk.red('Fallo al instalar dependencias') });
      return false;
    }
    spinner.success();
    return true;
  }
}

async function installYtDlp() {
  console.log(chalk.blue.bold('\n✨ Iniciando instalación inteligente ✨\n'));
  
  try { execSync('play -q -n synth 0.1 sine 800 vol 0.5'); } catch {} 

  if (!await checkDependencies()) {
    console.log(chalk.red.bold('\n⚠️  No se puede continuar sin dependencias\n'));
    return;
  }

  const downloadSpinner = createSpinner(chalk.cyan('Preparando yt-dlp...')).start();
  
  try {
    try {
      await runCommand('curl -sSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp', '');
    } catch {
      downloadSpinner.text = chalk.cyan('Descargando con Node.js...');
      const response = await fetch('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp');
      const data = await response.arrayBuffer();
      await writeFile('./yt-dlp', Buffer.from(data));
    }

    await chmod('./yt-dlp', 0o755);
    downloadSpinner.success({ text: chalk.green('Binario preparado') });

    const versionSpinner = createSpinner(chalk.cyan('Verificando versión...')).start();
    const version = await new Promise((resolve) => {
      exec('./yt-dlp --version', (error, stdout) => {
        resolve(error ? '?' : stdout.trim());
      });
    });
    versionSpinner.success({ text: chalk.green(`Versión: ${version}`) });

    console.log(chalk.green.bold('\n✅ Instalación completada con éxito!\n'));
    console.log(chalk.blue('Usa: ') + chalk.white.bgBlue('./yt-dlp [URL]'));
    try { execSync('play -q -n synth 0.2 sine 1000 vol 0.5'); } catch {} 
  } catch (error) {
    downloadSpinner.error({ text: chalk.red('Error crítico') });
    console.log(chalk.red.bold('\n📌 Solución alternativa:'));
    console.log(chalk.yellow('1. Descarga manual desde:'));
    console.log(chalk.blue('   https://github.com/yt-dlp/yt-dlp/releases'));
    console.log(chalk.yellow('2. Súbelo como "yt-dlp"'));
    console.log(chalk.yellow('3. Ejecuta: ') + chalk.white('chmod +x yt-dlp\n'));
    try { execSync('play -q -n synth 0.5 sine 400 vol 0.5'); } catch {} 
  }
}

installYtDlp();
