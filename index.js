import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import cfonts from 'cfonts';
import readline from 'readline';
import yargs from 'yargs';
import chalk from 'chalk';
import fs from 'fs';
import './config.js'; //max update 2025
import pkg from 'google-libphonenumber';
const { PhoneNumberUtil } = pkg;
const phoneUtil = PhoneNumberUtil.getInstance();

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { say } = cfonts;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let isRunning = false;

const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

console.log(chalk.yellow.bold('—◉ㅤIniciando sistema...'));

function verificarOCrearCarpetaAuth() {
  const authPath = join(__dirname, global.authFile);
  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }
}

function verificarCredsJson() {
  const credsPath = join(__dirname, global.authFile, 'creds.json');
  return fs.existsSync(credsPath);
}

function formatearNumeroTelefono(numero) {
  let formattedNumber = numero.replace(/[^\d+]/g, '');
  if (!formattedNumber.startsWith('+')) {
    formattedNumber = `+${formattedNumber}`;
  }
  return formattedNumber;
}

async function isValidPhoneNumber(number) {
try {
number = number.replace(/\s+/g, '')
if (number.startsWith('+521')) {
number = number.replace('+521', '+52');
} else if (number.startsWith('+52') && number[4] === '1') {
number = number.replace('+52 1', '+52');
}
const parsedNumber = phoneUtil.parseAndKeepRawInput(number)
return phoneUtil.isValidNumber(parsedNumber)
} catch (error) {
return false
}}

async function isValidPhoneNumber(numeroTelefono) {
  // Implement your phone number validation logic here
  return numeroTelefono.length >= 15; // Example: Validating that the number has at least 15 digits
}

async function start(file) {
  if (isRunning) return;
  isRunning = true;

  say('The Mystic\nBot', {
    font: 'chrome',
    align: 'center',
    gradient: ['red', 'magenta'],
  });

  say(`Bot creado por Bruno Sobrino`, {
    font: 'console',
    align: 'center',
    gradient: ['red', 'magenta'],
  });

  verificarOCrearCarpetaAuth();

  if (!fs.existsSync(`./MysticSession/creds.json`)) {
    const args = process.argv.slice(2);
    let opcion;
    let phoneNumber = '';

    if (args.includes('methodCode')) {
      opcion = '2';
    } else {
      opcion = await question(chalk.yellowBright.bold('—◉ㅤSeleccione una opción (solo el número):\n') + chalk.white.bold('1. Con código QR\n2. Con código de texto de 8 dígitos\n—> '));
    }

    if (opcion === '2') {
      if (!conn.authState.creds.registered) {
        let addNumber;
        if (!!phoneNumber) {
          addNumber = phoneNumber.replace(/[^0-9]/g, '');
        } else {
          do {
            phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`[ ❗ ] Por favor, Ingrese el número de WhatsApp.\n${chalk.bold.yellowBright(`Ejemplo: 5289×××××××`)}\n${chalk.bold.magentaBright('---> ')}`)));
            phoneNumber = formatearNumeroTelefono(phoneNumber);
          } while (!await isValidPhoneNumber(phoneNumber));
          rl.close();
          addNumber = phoneNumber.replace(/\D/g, '');
        }

        setTimeout(async () => {
          let codeBot = await conn.requestPairingCode(addNumber);
          codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
          console.log(chalk.bold.white(chalk.bgMagenta(`[ ℹ️ ] Código de vinculación: `)), chalk.bold.white(chalk.white(codeBot)));
        }, 3000);
      }
    }

    process.argv.push(opcion === '1' ? 'qr' : 'code', phoneNumber);
  }

  const args = [join(__dirname, file), ...process.argv.slice(2)];
  setupMaster({ exec: args[0], args: args.slice(1) });

  const p = fork();

  p.on('message', (data) => {
    console.log(chalk.green.bold('—◉ㅤRECIBIDO:'), data);
    switch (data) {
      case 'reset':
        p.process.kill();
        isRunning = false;
        start.apply(this, arguments);
        break;
      case 'uptime':
        p.send(process.uptime());
        break;
    }
  });

  p.on('exit', (_, code) => {
    isRunning = false;
    console.error(chalk.red.bold('[ ERROR ] Ocurrió un error inesperado:'), code);
    p.process.kill();
    isRunning = false;
    start.apply(this, arguments);
    if (process.env.pm_id) {
      process.exit(1);
    } else {
      process.exit();
    }
  });

  const opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
  if (!opts['test']) {
    if (!rl.listenerCount()) {
      rl.on('line', (line) => {
        p.emit('message', line.trim());
      });
    }
  }
}

start('main.js');
