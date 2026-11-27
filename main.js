process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import './api.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, unlinkSync, existsSync, readFileSync, watch } from 'fs';
import yargs from 'yargs';
import { spawn } from 'child_process';
import lodash from 'lodash';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import { format } from 'util';
import pino from 'pino';
import Pino from 'pino';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './src/libraries/simple.js';
import { initializeSubBots } from './src/libraries/subBotManager.js';
import { Low, JSONFile } from 'lowdb';
import store from './src/libraries/store.js';

import { clearTmp, deleteCoreFiles, shouldLogError, clockString } from './src/libraries/functions.js';
const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser } = await import("baileys");
// Baileys 7 ya no exporta PHONENUMBER_MCC: lista local de prefijos telefónicos
// internacionales (códigos de país E.164) para validar el número antes de pedir
// el código de emparejamiento. Solo se usan las claves, como antes.
const PHONENUMBER_MCC = Object.fromEntries([
  '1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40',
  '41', '43', '44', '45', '46', '47', '48', '49', '51', '52', '53', '54',
  '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81',
  '82', '84', '86', '90', '91', '92', '93', '94', '95', '98', '211', '212',
  '213', '216', '218', '220', '221', '222', '223', '224', '225', '226', '227', '228',
  '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240',
  '241', '242', '243', '244', '245', '246', '247', '248', '249', '250', '251', '252',
  '253', '254', '255', '256', '257', '258', '260', '261', '262', '263', '264', '265',
  '266', '267', '268', '269', '290', '291', '297', '298', '299', '350', '351', '352',
  '353', '354', '355', '356', '357', '358', '359', '370', '371', '372', '373', '374',
  '375', '376', '377', '378', '379', '380', '381', '382', '383', '385', '386', '387',
  '389', '420', '421', '423', '500', '501', '502', '503', '504', '505', '506', '507',
  '508', '509', '590', '591', '592', '593', '594', '595', '596', '597', '598', '599',
  '670', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682',
  '683', '684', '685', '686', '687', '688', '689', '690', '691', '692', '800', '808',
  '850', '852', '853', '855', '856', '870', '871', '872', '873', '874', '878', '880',
  '881', '882', '883', '886', '888', '960', '961', '962', '963', '964', '965', '966',
  '967', '968', '970', '971', '972', '973', '974', '975', '976', '977', '979', '992',
  '993', '994', '995', '996', '998',
].map((code) => [code, true]));
import readline from 'readline';
import NodeCache from 'node-cache';
import qrcode from 'qrcode-terminal';
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
let stopped = 'close';
protoType();
serialize();
const msgRetryCounterMap = new Map();
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true));
}; global.__require = function require(dir = import.meta.url) {
  return createRequire(dir);
};
global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '');
global.timestamp = { start: new Date };
global.videoList = [];
global.videoListXXX = [];
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[#!/.]')
// cloudDBAdapter no existe en lowdb ni en el repo: la rama remota reventaba
// con ReferenceError al arrancar si se pasaba --db con URL. Sin adaptador
// remoto disponible se usa el JSON local y se avisa.
if (/https?:\/\//.test(opts['db'] || '')) console.warn('[ ⚠️ ] Base de datos remota no soportada (falta cloudDBAdapter); se usará database.json local.');
global.db = new Low(new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`));

global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function () {
      if (!global.db.READ) {
        clearInterval(this);
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
      }
    }, 1 * 1000));
  }
  if (global.db.data !== null) return;
  global.db.READ = true;
  await global.db.read().catch(console.error);
  global.db.READ = null;
  global.db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(global.db.data || {}),
  };
  global.db.chain = chain(global.db.data);
};
await loadDatabase();
const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
// Baileys 7: sin versión actual de WhatsApp Web no se puede conectar de forma
// fiable; el fallback viejo ([2, 3000, 1033893291], de 2024) provoca 405/loggedOut.
let version;
for (let attempt = 1; attempt <= 3 && !version; attempt++) {
  try {
    const versionInfo = await fetchLatestBaileysVersion();
    console.log(versionInfo);
    version = versionInfo?.version;
  } catch (e) {
    console.error(`[ ⚠️ ] No se pudo obtener la versión de WhatsApp Web (intento ${attempt}/3):`, e?.message || e);
    await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
  }
}
if (!version) {
  throw new Error('No se pudo obtener la versión actual de WhatsApp Web (fetchLatestBaileysVersion). Revisa tu conexión e inténtalo de nuevo; conectar con una versión vieja provoca 405/loggedOut.');
}
let phoneNumber = global.botnumber || process.argv.find(arg => arg.startsWith('--phone='))?.split('=')[1];
const methodCodeQR = process.argv.includes('--method=qr');
const methodCode = !!phoneNumber || process.argv.includes('--method=code');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

let opcion;
if (methodCodeQR) opcion = '1';
if (!methodCodeQR && !methodCode && !existsSync(`./${global.authFile}/creds.json`)) {
  do {
    opcion = await question('[ ℹ️ ] Seleccione una opción:\n1. Con código QR\n2. Con código de texto de 8 dígitos\n---> ');
    if (!/^[1-2]$/.test(opcion)) {
      console.log('[ ⚠️ ] Por favor, seleccione solo 1 o 2.\n');
    }
  } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${global.authFile}/creds.json`));
}

const filterStrings = [
  "Q2xvc2luZyBzdGFsZSBvcGVu",
  "Q2xvc2luZyBvcGVuIHNlc3Npb24=",
  "RmFpbGVkIHRvIGRlY3J5cHQ=",
  "U2Vzc2lvbiBlcnJvcg==",
  "RXJyb3I6IEJhZCBNQUM=",
  "RGVjcnlwdGVkIG1lc3NhZ2U="
];

console.info = () => { };
console.debug = () => { };
['log', 'warn', 'error'].forEach(methodName => {
  const originalMethod = console[methodName];
  console[methodName] = function () {
    const message = arguments[0];
    if (typeof message === 'string' && filterStrings.some(filterString => message.includes(Buffer.from(filterString, 'base64').toString()))) {
      arguments[0] = "";
    }
    originalMethod.apply(console, arguments);
  };
});

process.on('uncaughtException', (err) => {
  if (filterStrings.includes(Buffer.from(err.message).toString('base64'))) return;
  console.error('Uncaught Exception:', err);
});

const connectionOptions = {
  logger: pino({ level: 'silent' }),
  browser: opcion === '1' ? ['TheMystic-Bot-MD', 'Safari', '2.0.0'] : methodCodeQR ? ['TheMystic-Bot-MD', 'Safari', '2.0.0'] : ['Ubuntu', 'Chrome', '20.0.04'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
  },
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async (key) => {
    try {
      let jid = jidNormalizedUser(key.remoteJid);
      let msg = await store.loadMessage(jid, key.id);
      return msg?.message || "";
    } catch (error) {
      return "";
    }
  },
  msgRetryCounterCache: msgRetryCounterCache || new Map(),
  userDevicesCache: userDevicesCache || new Map(),
  defaultQueryTimeoutMs: undefined,
  cachedGroupMetadata: (jid) => global.conn.chats[jid] ?? {},
  keepAliveIntervalMs: 55000,
  maxIdleTimeMs: 60000,
  version,
};

global.conn = makeWASocket(connectionOptions);
//const lidResolver = new LidResolver(global.conn);


if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2';
    if (!conn.authState.creds.registered) {

      let numeroTelefono;
      if (!!phoneNumber) {
        numeroTelefono = phoneNumber.replace(/[^0-9]/g, '');
        if (!Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) {
          console.log(chalk.bgBlack(chalk.bold.redBright("Comience con el código de país de su número de WhatsApp.\nEjemplo: +5219992095479\n")));
          process.exit(0);
        }
      } else {
        while (true) {
          numeroTelefono = await question(chalk.bgBlack(chalk.bold.yellowBright('Por favor, escriba su número de WhatsApp.\nEjemplo: +5219992095479\n')));
          numeroTelefono = numeroTelefono.replace(/[^0-9]/g, '');
          if (numeroTelefono.match(/^\d+$/) && Object.keys(PHONENUMBER_MCC).some(v => numeroTelefono.startsWith(v))) break;
          console.log(chalk.bgBlack(chalk.bold.redBright("Por favor, escriba su número de WhatsApp.\nEjemplo: +5219992095479.\n")));
        }
        rl.close();
      }

      setTimeout(async () => {
        let codigo = await conn.requestPairingCode(numeroTelefono);
        codigo = codigo?.match(/.{1,4}/g)?.join("-") || codigo;
        console.log(chalk.yellow('[ ℹ️ ] introduce el código de emparejamiento en WhatsApp.'));
        console.log(chalk.black(chalk.bgGreen(`Su código de emparejamiento: `)), chalk.black(chalk.white(codigo)));
      }, 3000);
    }
  }
}

conn.isInit = false;
conn.well = false;
conn.logger.info(`[　ℹ️　] Cargando...\n`);

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data) await global.db.write();
      if (opts['autocleartmp'] && (global.support || {}).find) {
        const tmp = ['tmp', 'jadibts'];//os.tmpdir(), 
        tmp.forEach((filename) => spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']));
      }
    }, 30 * 1000);
  }
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT);

const dirToWatchccc = path.join(__dirname, './');
fs.watch(dirToWatchccc, (eventType, filename) => {
  if (eventType === 'rename') {
    const filePath = path.join(dirToWatchccc, filename);
    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) deleteCoreFiles(filePath);
    });
  }
});


async function connectionUpdate(update) {
  let isFirstConnection = '';
  const { connection, lastDisconnect, isNewLogin } = update;
  stopped = connection;
  if (isNewLogin) conn.isInit = true;
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date;
  }
  if (global.db.data == null) loadDatabase();
  if (update.qr && (opcion == '1' || methodCodeQR)) {
    console.log(chalk.yellow('[　ℹ️　　] Escanea el código QR.'));
    qrcode.generate(update.qr, { small: true });
  }
  if (connection == 'open') {
    console.log(chalk.yellow('[　ℹ️　　] Conectado correctamente.'));
    isFirstConnection = true;
    if (!global.subBotsInitialized) {
      global.subBotsInitialized = true;
      try {
        await initializeSubBots();
      } catch (error) {
        console.error(chalk.red('[ ⚠️ ] Error al inicializar sub-bots:'), error);
      }
    }
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  const lastErrors = {};
  const errorTimers = {};
  const errorCounters = {};
  if (reason == 405) {
    //await fs.unlinkSync("./MysticSession/" + "creds.json");
    console.log(chalk.bold.redBright(`[ ⚠️ ] Metodo no alojado, Por favor espere un momento me voy a reiniciar...\nSi aparecen error vuelve a iniciar con : npm start`));
      await global.reloadHandler(true).catch(console.error);
    //process.send('reset');
  }
  if (connection === 'close') {
    if (reason === DisconnectReason.badSession) {
      if (shouldLogError(errorCounters, 'badSession')) {
        conn.logger.error(`[ ⚠️ ] Sesión incorrecta, por favor elimina la carpeta ${global.authFile} y escanea nuevamente.`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionClosed) {
      if (shouldLogError(errorCounters, 'connectionClosed')) {
        conn.logger.warn(`[ ⚠️ ] Conexión cerrada, reconectando...`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionLost) {
      if (shouldLogError(errorCounters, 'connectionLost')) {
        conn.logger.warn(`[ ⚠️ ] Conexión perdida con el servidor, reconectando...`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionReplaced) {
      if (shouldLogError(errorCounters, 'connectionReplaced')) {
        conn.logger.error(`[ ⚠️ ] Conexión reemplazada, se ha abierto otra nueva sesión. Por favor, cierra la sesión actual primero.`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.loggedOut) {
      if (shouldLogError(errorCounters, 'loggedOut')) {
        conn.logger.error(`[ ⚠️ ] Conexion cerrada, por favor elimina la carpeta ${global.authFile} y escanea nuevamente.`);
      }
    } else if (reason === DisconnectReason.restartRequired) {
      if (isFirstConnection) {
        if (shouldLogError(errorCounters, 'restartRequired')) {
          //conn.logger.info(`[ ⚠️ ] Primer inicio: Ignorando restartRequired (posible falso positivo)`);
        }
        isFirstConnection = false;
      } else {
        if (shouldLogError(errorCounters, 'restartRequired')) {
          conn.logger.info(`[ ⚠️ ] Reinicio necesario, reconectando...`);
        }
        await global.reloadHandler(true).catch(console.error);
      }
    } else if (reason === DisconnectReason.timedOut) {
      if (shouldLogError(errorCounters, 'timedOut')) {
        conn.logger.warn(`[ ⚠️ ] Tiempo de conexión agotado, reconectando...`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else {
      const unknownError = `unknown_${reason || ''}_${connection || ''}`;
      if (shouldLogError(errorCounters, unknownError)) {
        conn.logger.warn(`[ ⚠️ ] Razón de desconexión desconocida. ${reason || ''}: ${connection || ''}`);
      }
      await global.reloadHandler(true).catch(console.error);
    }
  }
}

process.on('uncaughtException', console.error);

let isInit = true;
let handler = await import('./handler.js');

global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
    if (Object.keys(Handler || {}).length) handler = Handler;
  } catch (e) {
    console.error(e);
  }
  if (restatConn) {
    const oldChats = global.conn.chats;
    try {
      global.conn.ws.close();
    } catch { }
    conn.ev.removeAllListeners();
    global.conn = makeWASocket(connectionOptions, { chats: oldChats });
    store?.bind(conn);
    // Reinicializar lidResolver con la nueva conexión
    //lidResolver.conn = global.conn;
    isInit = true;
  }
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler);
    conn.ev.off('group-participants.update', conn.participantsUpdate);
    conn.ev.off('groups.update', conn.groupsUpdate);
    conn.ev.off('message.delete', conn.onDelete);
    conn.ev.off('call', conn.onCall);
    conn.ev.off('connection.update', conn.connectionUpdate);
    conn.ev.off('creds.update', conn.credsUpdate);
  }

  conn.welcome = '👋 ¡Bienvenido/a!\n@user';
  conn.bye = '👋 ¡Hasta luego!\n@user';
  conn.spromote = '*[ ℹ️ ] @user Fue promovido a administrador.*';
  conn.sdemote = '*[ ℹ️ ] @user Fue degradado de administrador.*';
  conn.sDesc = '*[ ℹ️ ] La descripción del grupo ha sido modificada.*';
  conn.sSubject = '*[ ℹ️ ] El nombre del grupo ha sido modificado.*';
  conn.sIcon = '*[ ℹ️ ] Se ha cambiado la foto de perfil del grupo.*';
  conn.sRevoke = '*[ ℹ️ ] El enlace de invitación al grupo ha sido restablecido.*';

  conn.handler = handler.handler.bind(global.conn)
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
  conn.onDelete = handler.deleteUpdate.bind(global.conn);
  conn.onCall = handler.callUpdate.bind(global.conn);
  conn.connectionUpdate = connectionUpdate.bind(global.conn);
  conn.credsUpdate = saveCreds.bind(global.conn, true);

  const currentDateTime = new Date();
  const messageDateTime = new Date(conn.ev);
  if (currentDateTime >= messageDateTime) {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  } else {
    const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
  }

  conn.ev.on('messages.upsert', conn.handler);
  conn.ev.on('group-participants.update', conn.participantsUpdate);
  conn.ev.on('groups.update', conn.groupsUpdate);
  conn.ev.on('message.delete', conn.onDelete);
  conn.ev.on('call', conn.onCall);
  conn.ev.on('connection.update', conn.connectionUpdate);
  conn.ev.on('creds.update', conn.credsUpdate);
  isInit = false;
  return conn;
};


const pluginFolder = global.__dirname(join(__dirname, './plugins/index'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

async function filesInit() {
  for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
      const file = global.__filename(join(pluginFolder, filename));
      const module = await import(file);
      global.plugins[filename] = module.default || module;
    } catch (e) {
      conn.logger.error(e);
      delete global.plugins[filename];
    }
  }
}
filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);

global.reload = async (_ev, filename) => {
  if (pluginFilter(filename)) {
    const dir = global.__filename(join(pluginFolder, filename), true);
    if (filename in global.plugins) {
      if (existsSync(dir)) conn.logger.info(` updated plugin - '${filename}'`);
      else {
        conn.logger.warn(`deleted plugin - '${filename}'`);
        return delete global.plugins[filename];
      }
    } else conn.logger.info(`new plugin - '${filename}'`);
    const err = syntaxerror(readFileSync(dir), filename, {
      sourceType: 'module',
      allowAwaitOutsideFunction: true,
    });
    if (err) conn.logger.error(`syntax error while loading '${filename}'\n${format(err)}`);
    else {
      try {
        const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
        global.plugins[filename] = module.default || module;
      } catch (e) {
        conn.logger.error(`error require plugin '${filename}\n${format(e)}'`);
      } finally {
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
      }
    }
  }
};
Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();

// src/tmp no viene en git (carpeta vacía + gitignore): sin ella el
// autocleartmp reventaba con ENOENT y las descargas que escriben ahí
// (.spotify, .whatmusic, efectos de audio) fallaban. Se crea al arrancar.
fs.mkdirSync(join(__dirname, './src/tmp'), { recursive: true });

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user) return;
  const tmp = [join(__dirname, './src/tmp')];
  clearTmp(tmp);
}, 180000);

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user) return;
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  const bio = `• Activo: ${uptime} | TheMystic-Bot-MD`;
  await conn?.updateProfileStatus(bio).catch((_) => _);
}, 60000);


