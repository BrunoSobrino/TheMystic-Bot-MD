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

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { say } = cfonts;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let isRunning = false;

const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

console.log(chalk.yellow.bold('—◉ㅤIniciando sistema...'));

async function start(file) {
  if (isRunning) return;
  isRunning = true;

  say('The Mystic', {
    font: 'chrome',
    align: 'center',
    gradient: ['red', 'magenta'],
  });

  say(`Creado por Bruno Sobrino`, {
    font: 'console',
    align: 'center',
    gradient: ['red', 'magenta'],
  });

  const args = [join(__dirname, file), ...process.argv.slice(2)];
  setupMaster({ exec: args[0], args: args.slice(1) });

  const p = fork();

  p.on('message', (data) => {
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
