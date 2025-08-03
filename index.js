import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import cfonts from 'cfonts';
import readline from 'readline';
import yargs from 'yargs';
import chalk from 'chalk';
import fs from 'fs';
import './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { say } = cfonts;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let isRunning = false;
let childProc = null;

const ask = (text) => new Promise((resolve) => rl.question(text, resolve));

console.log(chalk.yellow.bold('—◉ㅤStarting system...'));

function ensureAuthFolder() {
  const authPath = join(__dirname, global.authFile);
  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }
}

function checkCredsJson() {
  const credsPath = join(__dirname, global.authFile, 'creds.json');
  return fs.existsSync(credsPath);
}

function formatPhoneNumber(number) {
  let formatted = number.replace(/[^\d+]/g, '');
  if (formatted.startsWith('+52') && !formatted.startsWith('+521')) {
    formatted = formatted.replace('+52', '+521');
  } else if (formatted.startsWith('52') && !formatted.startsWith('521')) {
    formatted = `+521${formatted.slice(2)}`;
  } else if (formatted.startsWith('52') && formatted.length >= 12) {
    formatted = `+${formatted}`;
  } else if (!formatted.startsWith('+')) {
    formatted = `+${formatted}`;
  }
  return formatted;
}

function isValidPhoneNumber(phone) {
  const regex = /^\+\d{7,15}$/;
  return regex.test(phone);
}

async function start(file) {
  if (isRunning) return;
  isRunning = true;

  say('The Mystic\nBot', {
    font: 'chrome',
    align: 'center',
    gradient: ['red', 'magenta'],
  });

  say('Bot created by Bruno Sobrino', {
    font: 'console',
    align: 'center',
    gradient: ['red', 'magenta'],
  });

  ensureAuthFolder();

  if (checkCredsJson()) {
    const args = [join(__dirname, file), ...process.argv.slice(2)];
    setupMaster({ exec: args[0], args: args.slice(1) });
    launchChild(file);
    return;
  }

  const option = await ask(
    chalk.yellowBright.bold('—◉ㅤSelect an option (just the number):\n') +
    chalk.white.bold('1. With QR code\n2. With 8-digit text code\n—> ')
  );

  if (option === '2') {
    const phoneInput = await ask(
      chalk.yellowBright.bold('\n—◉ㅤEnter your WhatsApp number:\n') +
      chalk.white.bold('◉ㅤExample: +5219992095479\n—> ')
    );
    const formattedPhone = formatPhoneNumber(phoneInput);

    if (!isValidPhoneNumber(formattedPhone)) {
      console.log(
        chalk.bgRed(
          chalk.white.bold(
            '[ ERROR ] Invalid number. Make sure you entered your number in international format and started with the country code.\n—◉ㅤExample:\n◉ +5219992095479\n'
          )
        )
      );
      process.exit(0);
    }

    process.argv.push('--phone=' + formattedPhone);
    process.argv.push('--method=code');
  } else if (option === '1') {
    process.argv.push('--method=qr');
  }

  const args = [join(__dirname, file), ...process.argv.slice(2)];
  setupMaster({ exec: args[0], args: args.slice(1) });
  launchChild(file);
}

function launchChild(file) {
  childProc = fork();

  childProc.on('message', (data) => {
    console.log(chalk.green.bold('—◉ㅤRECEIVED:'), data);
    switch (data) {
      case 'reset':
        console.log(chalk.yellow.bold('—◉ㅤRestart request received...'));
        childProc.removeAllListeners();
        childProc.kill('SIGTERM');
        isRunning = false;
        setTimeout(() => start(file), 1000);
        break;
      case 'uptime':
        childProc.send(process.uptime());
        break;
    }
  });

  childProc.on('exit', (code, signal) => {
    console.log(chalk.yellow.bold(`—◉ㅤChild process ended (${code || signal})`));
    isRunning = false;
    childProc = null;

    if (code !== 0 || signal === 'SIGTERM') {
      console.log(chalk.yellow.bold('—◉ㅤRestarting process...'));
      setTimeout(() => start(file), 1000);
    }
  });

  const opts = yargs(process.argv.slice(2)).argv;
  if (!opts.test) {
    rl.on('line', (line) => {
      childProc.emit('message', line.trim());
    });
  }
}

try {
  start('main.js');
} catch (error) {
  console.error(chalk.red.bold('[ CRITICAL ERROR ]:'), error);
  process.exit(1);
}