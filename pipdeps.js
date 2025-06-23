import { exec } from 'child_process';
import { writeFile, chmod, access, constants } from 'fs/promises';
import { existsSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Configuración mejorada
const USE_SOUND = false; // Desactivado por defecto para evitar errores
const USE_ANSI_COLORS = true;
const MINIMAL_LOGS = true;

// Polyfill para sonidos seguros
async function playSound() {
  if (!USE_SOUND) return;
  try {
    // Intento con beep nativo de terminal
    process.stdout.write('\x07');
  } catch {
    // Silencio si falla
  }
}

// Cargador seguro de dependencias
async function safeRequire(pkg) {
  try {
    return await import(pkg);
  } catch {
    return null;
  }
}

// Instalador optimizado de dependencias
async function installDeps() {
  if (MINIMAL_LOGS) console.log('🔍 Verificando dependencias...');
  
  const neededDeps = [];
  for (const pkg of ['nanospinner', 'chalk']) {
    try {
      require.resolve(pkg);
    } catch {
      neededDeps.push(pkg);
    }
  }

  if (neededDeps.length === 0) return true;

  if (MINIMAL_LOGS) console.log('📦 Instalando complementos...');
  
  try {
    await new Promise((resolve, reject) => {
      exec(`npm install --omit=dev ${neededDeps.join(' ')}`, 
        { stdio: MINIMAL_LOGS ? 'ignore' : 'inherit' },
        (error) => error ? reject(error) : resolve()
      );
    });
    return true;
  } catch {
    return false;
  }
}

// Instalación principal mejorada
async function installYtDlp() {
  try {
    // Paso 1: Gestionar dependencias
    const depsOk = await installDeps();
    const chalk = depsOk ? (await safeRequire('chalk'))?.default : null;
    const spinner = depsOk ? (await safeRequire('nanospinner'))?.createSpinner : null;

    // Paso 2: Descargar yt-dlp
    const downloadMsg = chalk ? chalk.blue('Descargando yt-dlp...') : 'Descargando yt-dlp...';
    const spinnerObj = spinner ? spinner(downloadMsg).start() : null;
    
    try {
      // Intento con curl (más rápido)
      await new Promise((resolve, reject) => {
        exec('curl -sSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp', 
          (error) => error ? reject(error) : resolve()
        );
      });
    } catch {
      // Fallback a fetch si curl falla
      if (spinnerObj) spinnerObj.text = chalk.blue('Usando método alternativo...');
      const response = await fetch('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp');
      const data = await response.arrayBuffer();
      await writeFile('./yt-dlp', Buffer.from(data));
    }

    // Paso 3: Hacer ejecutable
    await chmod('./yt-dlp', 0o755);
    
    // Paso 4: Verificar versión
    const version = await new Promise(resolve => {
      exec('./yt-dlp --version', (error, stdout) => {
        resolve(error ? 'desconocida' : stdout.trim());
      });
    });

    // Resultado final
    if (spinnerObj) spinnerObj.success({ 
      text: chalk ? chalk.green(`Versión ${version} instalada`) : `Versión ${version} instalada`
    });

    const successMsg = chalk ? 
      chalk.green.bold('✅ Listo! Usa: ') + chalk.white.bgBlue('./yt-dlp [URL]') :
      '✅ Listo! Usa: ./yt-dlp [URL]';
    
    console.log(successMsg);

  } catch (error) {
    const errorMsg = chalk ? 
      chalk.red.bold('❌ Error: ') + chalk.yellow(error.message) + 
      chalk.cyan('\nSolución manual:\n1. Descarga desde https://github.com/yt-dlp/yt-dlp/releases\n2. Súbelo como yt-dlp\n3. Ejecuta: chmod +x yt-dlp') :
      `❌ Error: ${error.message}\nSolución manual:\n1. Descarga desde https://github.com/yt-dlp/yt-dlp/releases\n2. Súbelo como yt-dlp\n3. Ejecuta: chmod +x yt-dlp`;
    
    console.error(errorMsg);
  }
}

installYtDlp().catch(() => {});
