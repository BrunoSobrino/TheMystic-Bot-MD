import { exec, execSync } from 'child_process';
import { writeFile, chmod, access, constants } from 'fs/promises';
import { existsSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Configuración de efectos
const PLAY_SOUND = true; // Cambiar a false para desactivar sonidos
const DELAY = 150; // Tiempo entre animaciones en ms

// Sonidos básicos (usando beep si sox no está disponible)
async function playSound(type) {
  if (!PLAY_SOUND) return;
  
  try {
    const sounds = {
      start: 'play -q -n synth 0.1 sine 800 vol 0.5',
      success: 'play -q -n synth 0.2 sine 1000 vol 0.5',
      error: 'play -q -n synth 0.3 sine 400 vol 0.5',
      progress: 'play -q -n synth 0.05 sine 1200 vol 0.3'
    };
    execSync(sounds[type] || 'echo -n "\a"');
  } catch {
    // Fallback a beep básico
    process.stdout.write('\x07');
  }
}

// Animación de carga personalizada
async function animateText(text, frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'], delay = 100) {
  let i = 0;
  const spinner = setInterval(() => {
    process.stdout.write(`\r${frames[i]} ${text}`);
    i = (i + 1) % frames.length;
  }, delay);

  return {
    stop: () => {
      clearInterval(spinner);
      process.stdout.write('\r'.padEnd(text.length + 3, ' ') + '\r');
    }
  };
}

// Instalar dependencias npm si no existen
async function ensureDependencies() {
  const deps = ['nanospinner', 'chalk', 'gradient-string'];
  let needInstall = false;

  const checking = await animateText('Verificando dependencias...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  for (const dep of deps) {
    try {
      require.resolve(dep);
    } catch {
      needInstall = true;
      break;
    }
  }

  checking.stop();

  if (needInstall) {
    const installing = await animateText('Instalando paquetes necesarios...');
    await playSound('progress');
    
    try {
      await new Promise((resolve, reject) => {
        exec(`npm install ${deps.join(' ')}`, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      installing.stop();
      console.log('✔ Dependencias instaladas');
      await playSound('success');
      return true;
    } catch (error) {
      installing.stop();
      console.log('✖ Error instalando dependencias');
      await playSound('error');
      return false;
    }
  }
  return true;
}

// Cargar dependencias visuales
async function loadVisualDeps() {
  try {
    const { default: chalk } = await import('chalk');
    const { default: gradient } = await import('gradient-string');
    const { createSpinner } = await import('nanospinner');
    
    return {
      chalk,
      gradient,
      createSpinner,
      banner: () => {
        console.log(gradient.rainbow('════════════════════════════════════════'));
        console.log(gradient.pastel('       INSTALADOR AVANZADO YT-DLP       '));
        console.log(gradient.rainbow('════════════════════════════════════════\n'));
      }
    };
  } catch (error) {
    return null;
  }
}

// Ejecutar comando con spinner
async function runCommand(command, description, visual) {
  if (visual) {
    const spinner = visual.createSpinner(
      visual.chalk.cyan(description)
    ).start();
    
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
      spinner.error({ text: visual.chalk.red(error.message) });
      return false;
    }
  } else {
    console.log(`▶ ${description}...`);
    try {
      await new Promise((resolve, reject) => {
        exec(command, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      return true;
    } catch (error) {
      console.log(`✖ Error: ${error.message}`);
      return false;
    }
  }
}

// Instalación principal
async function installYtDlp() {
  await playSound('start');
  
  // Verificar e instalar dependencias
  const depsOk = await ensureDependencies();
  const visual = depsOk ? await loadVisualDeps() : null;
  
  if (visual) {
    visual.banner();
    await new Promise(resolve => setTimeout(resolve, DELAY));
  }

  // Descargar yt-dlp
  const downloadStep = visual 
    ? visual.createSpinner(visual.chalk.yellow('Obteniendo yt-dlp...')).start()
    : { stop: () => {}, fail: () => {} };

  try {
    // Intentar con curl primero
    try {
      await runCommand(
        'curl -sSL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./yt-dlp',
        'Descargando con curl',
        visual
      );
    } catch {
      // Fallback a fetch si curl falla
      if (visual) {
        downloadStep.text = visual.chalk.yellow('Descargando con Node.js...');
      } else {
        console.log('⬇ Descargando con Node.js...');
      }
      
      const response = await fetch('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp');
      const data = await response.arrayBuffer();
      await writeFile('./yt-dlp', Buffer.from(data));
    }

    // Hacer ejecutable
    await chmod('./yt-dlp', 0o755);
    downloadStep.stop();
    
    // Verificar versión
    const version = await new Promise(resolve => {
      exec('./yt-dlp --version', (error, stdout) => {
        resolve(error ? '?' : stdout.trim());
      });
    });

    if (visual) {
      console.log(visual.gradient.morning(`\n✔ Versión instalada: ${version}\n`));
      console.log(visual.chalk.green.bold('¡Instalación completada con éxito! 🎉'));
      console.log(visual.chalk.blue('Usa: ') + visual.chalk.white.bgBlue('./yt-dlp [URL]'));
    } else {
      console.log(`\n✔ Versión: ${version}`);
      console.log('✅ yt-dlp instalado correctamente');
      console.log('💡 Usa: ./yt-dlp [URL]');
    }

    await playSound('success');
  } catch (error) {
    downloadStep.fail();
    if (visual) {
      console.log(visual.chalk.red.bold('\n✖ Error durante la instalación:'));
      console.log(visual.chalk.yellow(error.message));
      console.log(visual.chalk.cyan('\n📌 Solución alternativa:'));
      console.log('1. Descarga manual desde:');
      console.log(visual.chalk.blue('   https://github.com/yt-dlp/yt-dlp/releases'));
      console.log('2. Súbelo como "yt-dlp"');
      console.log('3. Ejecuta: ' + visual.chalk.white('chmod +x yt-dlp'));
    } else {
      console.log('\n❌ Error:', error.message);
      console.log('📌 Solución alternativa:');
      console.log('1. Descarga manual desde https://github.com/yt-dlp/yt-dlp/releases');
      console.log('2. Súbelo como "yt-dlp"');
      console.log('3. Ejecuta: chmod +x yt-dlp');
    }
    await playSound('error');
  }
}

// Iniciar proceso
installYtDlp();
