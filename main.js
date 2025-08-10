process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import './api.js';
import { createRequire } from 'module';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import fs, { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch } from 'fs';
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
import LidResolver from './src/libraries/LidResolver.js';

const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, PHONENUMBER_MCC } = await import("baileys");
import readline from 'readline';
import NodeCache from 'node-cache';
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
global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`));

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
loadDatabase();

/* ------------------------------------------------*/

/**
 * Procesa texto para resolver LIDs en menciones (@) - VERSION MEJORADA
 */
async function processTextMentions(text, groupId) {
  if (!text || !groupId || !text.includes('@')) return text;

  const mentionRegex = /@(\d{8,20})/g;
  const mentions = [...text.matchAll(mentionRegex)];

  if (!mentions.length) return text;

  let processedText = text;
  const processedMentions = new Set(); // Evitar procesar la misma mención múltiples veces

  for (const mention of mentions) {
    const [fullMatch, lidNumber] = mention;
    
    // Evitar duplicados
    if (processedMentions.has(lidNumber)) continue;
    processedMentions.add(lidNumber);
    
    const lidJid = `${lidNumber}@lid`;

    try {
      const resolvedJid = await global.lidResolver.resolveLid(lidJid, groupId);
      if (resolvedJid && resolvedJid !== lidJid) {
        const resolvedNumber = resolvedJid.split('@')[0];
        
        // Reemplazar TODAS las ocurrencias de esta mención en el texto
        const globalRegex = new RegExp(`@${lidNumber}`, 'g');
        processedText = processedText.replace(globalRegex, `@${resolvedNumber}`);
      }
    } catch (error) {
      console.error(`❌ Error procesando mención LID ${lidNumber}:`, error.message);
    }
  }

  return processedText;
}

/**
 * Intercepta y procesa mensajes antes del handler
 */
async function interceptMessages(messages) {
  if (!Array.isArray(messages)) return messages;

  const processedMessages = [];
  for (const message of messages) {
    try {
      const processedMessage = await global.lidResolver.processMessage(message);
      processedMessages.push(processedMessage);
    } catch (error) {
      console.error('❌ Error interceptando mensaje:', error);
      processedMessages.push(message);
    }
  }

  return processedMessages;
}

/**
 * Obtener información de usuario por LID
 */
global.getUserInfoByLid = function(lidNumber) {
  if (!global.lidResolver) return null;
  return global.lidResolver.getUserInfo(lidNumber);
};

/**
 * Obtener información de usuario por JID
 */
global.getUserInfoByJid = function(jid) {
  if (!global.lidResolver) return null;
  return global.lidResolver.getUserInfoByJid(jid);
};

/**
 * Obtener LID de un JID (búsqueda inversa)
 */
global.findLidByJid = function(jid) {
  if (!global.lidResolver) return null;
  return global.lidResolver.findLidByJid(jid);
};

/**
 * Listar todos los usuarios en caché
 */
global.getAllCachedUsers = function() {
  if (!global.lidResolver) return [];
  return global.lidResolver.getAllUsers();
};

/**
 * Obtener estadísticas del caché LID
 */
global.getLidStats = function() {
  if (!global.lidResolver) return null;
  return global.lidResolver.getStats();
};

/**
 * Analizar y corregir números telefónicos en caché
 */
global.analyzePhoneNumbers = function() {
  if (!global.lidResolver) return null;
  return global.lidResolver.analyzePhoneNumbers();
};

/**
 * Corregir automáticamente números telefónicos
 */
global.autoCorrectPhoneNumbers = function() {
  if (!global.lidResolver) return null;
  return global.lidResolver.autoCorrectPhoneNumbers();
};

/**
 * Obtener usuarios por país
 */
global.getUsersByCountry = function() {
  if (!global.lidResolver) return {};
  return global.lidResolver.getUsersByCountry();
};

/**
 * Validar si un string es un número telefónico
 */
global.validatePhoneNumber = function(phoneNumber) {
  if (!global.lidResolver) return false;
  return global.lidResolver.phoneValidator.isValidPhoneNumber(phoneNumber);
};

/**
 * Detectar si un LID es realmente un número telefónico
 */
global.detectPhoneInLid = function(lidString) {
  if (!global.lidResolver) return { isPhone: false };
  return global.lidResolver.phoneValidator.detectPhoneInLid(lidString);
};

/**
 * Forzar guardado del caché LID
 */
global.forceSaveLidCache = function() {
  if (!global.lidResolver) return false;
  global.lidResolver.forceSave();
  return true;
};

/**
 * Función para mostrar estadísticas del caché LID
 */
global.getLidCacheInfo = function() {
  if (!global.lidResolver) {
    return 'Sistema LID no inicializado';
  }
  
  const stats = global.lidResolver.getStats();
  const analysis = global.lidResolver.analyzePhoneNumbers();
  
  return `📱 *ESTADÍSTICAS DEL CACHÉ LID*

📊 *General:*
• Total de entradas: ${stats.total}
• Entradas válidas: ${stats.valid}
• No encontradas: ${stats.notFound}
• Con errores: ${stats.errors}
• En procesamiento: ${stats.processing}

📞 *Números telefónicos:*
• Detectados: ${stats.phoneNumbers}
• Corregidos: ${stats.corrected}
• Problemáticos: ${analysis.stats.phoneNumbersProblematic}

🗂️ *Caché:*
• Archivo: ${stats.cacheFile}
• Existe: ${stats.fileExists ? 'Sí' : 'No'}
• Cambios pendientes: ${stats.isDirty ? 'Sí' : 'No'}
• Mapeos JID: ${stats.jidMappings}

🌍 *Países detectados:*
${Object.entries(global.lidResolver.getUsersByCountry())
  .slice(0, 5)
  .map(([country, users]) => `• ${country}: ${users.length} usuarios`)
  .join('\n')}`;
};

/**
 * Función para forzar corrección de números telefónicos
 */
global.forcePhoneCorrection = function() {
  if (!global.lidResolver) {
    return 'Sistema LID no inicializado';
  }
  
  try {
    const result = global.lidResolver.autoCorrectPhoneNumbers();
    
    if (result.corrected > 0) {
      return `✅ Se corrigieron ${result.corrected} números telefónicos automáticamente.`;
    } else {
      return '✅ No se encontraron números telefónicos que requieran corrección.';
    }
  } catch (error) {
    return `❌ Error en corrección automática: ${error.message}`;
  }
};

const { state, saveCreds } = await useMultiFileAuthState(global.authFile);
const { version } = await fetchLatestBaileysVersion();
let phoneNumber = global.botnumber || process.argv.find(arg => arg.startsWith('--phone='))?.split('=')[1];
const methodCodeQR = process.argv.includes('--method=qr');
const methodCode = !!phoneNumber || process.argv.includes('--method=code');
const MethodMobile = process.argv.includes("mobile");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

let opcion;
if (methodCodeQR) opcion = '1';
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.authFile}/creds.json`)) {
  do {
    opcion = await question('[ ℹ️ ] Seleccione una opción:\n1. Con código QR\n2. Con código de texto de 8 dígitos\n---> ');
    if (!/^[1-2]$/.test(opcion)) {
      console.log('[ ❗ ] Por favor, seleccione solo 1 o 2.\n');
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
  printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
  mobile: MethodMobile,
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
  version: [2, 3000, 1023223821],
  keepAliveIntervalMs: 55000,
  maxIdleTimeMs: 60000,
};

global.conn = makeWASocket(connectionOptions);
global.lidResolver = new LidResolver(global.conn);

// Ejecutar análisis y corrección automática al inicializar (SILENCIOSO)
setTimeout(async () => {
  try {
    if (global.lidResolver) {
      // Ejecutar corrección automática de números telefónicos (sin logs)
      global.lidResolver.autoCorrectPhoneNumbers();
    }
  } catch (error) {
    console.error('❌ Error en análisis inicial:', error.message);
  }
}, 5000);

if (!fs.existsSync(`./${global.authFile}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2';
    if (!conn.authState.creds.registered) {
      if (MethodMobile) throw new Error('No se puede usar un código de emparejamiento con la API móvil');

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
conn.logger.info(`[ㅤℹ️­ㅤ] Cargando...\n`);

if (!opts['test']) {
  if (global.db) {
    setInterval(async () => {
      if (global.db.data) await global.db.write();
      if (opts['autocleartmp'] && (global.support || {}).find) {
        const tmp = [os.tmpdir(), 'tmp', 'jadibts'];
        tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']));
      }
    }, 30 * 1000);
  }
}

if (opts['server']) (await import('./server.js')).default(global.conn, PORT);

function clearTmp() {
  const tmp = [join(__dirname, './src/tmp')];
  const filename = [];
  tmp.forEach((dirname) => readdirSync(dirname).forEach((file) => filename.push(join(dirname, file))));
  return filename.map((file) => {
    const stats = statSync(file);
    if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) return unlinkSync(file);
    return false;
  });
}

const dirToWatchccc = path.join(__dirname, './');
function deleteCoreFiles(filePath) {
  const coreFilePattern = /^core\.\d+$/i;
  const filename = path.basename(filePath);
  if (coreFilePattern.test(filename)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error eliminando el archivo ${filePath}:`, err);
    });
  }
}
fs.watch(dirToWatchccc, (eventType, filename) => {
  if (eventType === 'rename') {
    const filePath = path.join(dirToWatchccc, filename);
    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) deleteCoreFiles(filePath);
    });
  }
});

function purgeSession() {
  let prekey = [];
  let directorio = readdirSync("./MysticSession");
  let filesFolderPreKeys = directorio.filter(file => file.startsWith('pre-key-'));
  prekey = [...prekey, ...filesFolderPreKeys];
  filesFolderPreKeys.forEach(files => unlinkSync(`./MysticSession/${files}`));
}

function purgeSessionSB() {
  try {
    let listaDirectorios = readdirSync('./jadibts/');
    let SBprekey = [];
    listaDirectorios.forEach(directorio => {
      if (statSync(`./jadibts/${directorio}`).isDirectory()) {
        let DSBPreKeys = readdirSync(`./jadibts/${directorio}`).filter(fileInDir => fileInDir.startsWith('pre-key-'));
        SBprekey = [...SBprekey, ...DSBPreKeys];
        DSBPreKeys.forEach(fileInDir => unlinkSync(`./jadibts/${directorio}/${fileInDir}`));
      }
    });
  } catch (err) {
    console.log(chalk.bold.red(`[ ℹ️ ] Algo salio mal durante la eliminación, archivos no eliminados`));
  }
}

function purgeOldFiles() {
  const directories = ['./MysticSession/', './jadibts/'];
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  directories.forEach(dir => {
    readdirSync(dir, (err, files) => {
      if (err) throw err;
      files.forEach(file => {
        const filePath = path.join(dir, file);
        stat(filePath, (err, stats) => {
          if (err) throw err;
          if (stats.isFile() && stats.mtimeMs < oneHourAgo && file !== 'creds.json') {
            unlinkSync(filePath, err => {
              if (err) throw err;
            });
          }
        });
      });
    });
  });
}

async function connectionUpdate(update) {
  let isFirstConnection = '';
  let qrAlreadyShown = false;
  let qrTimeout = null;
  const { connection, lastDisconnect, isNewLogin } = update;
  stopped = connection;
  if (isNewLogin) conn.isInit = true;
  const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
  if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
    await global.reloadHandler(true).catch(console.error);
    global.timestamp.connect = new Date;
  }
  if (global.db.data == null) loadDatabase();
  if (update.qr != 0 && update.qr != undefined || methodCodeQR) {
    if (opcion == '1' || methodCodeQR) {
      console.log(chalk.yellow('[ㅤℹ️ㅤㅤ] Escanea el código QR.'));
      qrAlreadyShown = true;
      if (qrTimeout) clearTimeout(qrTimeout);
      qrTimeout = setTimeout(() => qrAlreadyShown = false, 60000);
    }
  }
  if (connection == 'open') {
    console.log(chalk.yellow('[ㅤℹ️ㅤㅤ] Conectado correctamente.'));
    isFirstConnection = true;
    if (!global.subBotsInitialized) {
      global.subBotsInitialized = true;
      try {
        await initializeSubBots();
      } catch (error) {
        console.error(chalk.red('[ ❗ ] Error al inicializar sub-bots:'), error);
      }
    }
  }
  let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
  const lastErrors = {};
  const errorTimers = {};
  const errorCounters = {};
  function shouldLogError(errorType) {
    if (!errorCounters[errorType]) errorCounters[errorType] = { count: 0, lastShown: 0 };
    const now = Date.now();
    const errorData = errorCounters[errorType];
    if (errorData.count >= 5) return false;
    if (now - errorData.lastShown < 2000) return false;
    errorData.count++;
    errorData.lastShown = now;
    return true;
  }
  if (reason == 405) {
    await fs.unlinkSync("./MysticSession/" + "creds.json");
    console.log(chalk.bold.redBright(`[ ⚠ ] Conexión replazada, Por favor espere un momento me voy a reiniciar...\nSi aparecen error vuelve a iniciar con : npm start`));
    process.send('reset');
  }
  if (connection === 'close') {
    if (reason === DisconnectReason.badSession) {
      if (shouldLogError('badSession')) {
        conn.logger.error(`[ ⚠ ] Sesión incorrecta, por favor elimina la carpeta ${global.authFile} y escanea nuevamente.`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionClosed) {
      if (shouldLogError('connectionClosed')) {
        conn.logger.warn(`[ ⚠ ] Conexión cerrada, reconectando...`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionLost) {
      if (shouldLogError('connectionLost')) {
        conn.logger.warn(`[ ⚠ ] Conexión perdida con el servidor, reconectando...`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.connectionReplaced) {
      if (shouldLogError('connectionReplaced')) {
        conn.logger.error(`[ ⚠ ] Conexión reemplazada, se ha abierto otra nueva sesión. Por favor, cierra la sesión actual primero.`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else if (reason === DisconnectReason.loggedOut) {
      if (shouldLogError('loggedOut')) {
        conn.logger.error(`[ ⚠ ] Conexion cerrada, por favor elimina la carpeta ${global.authFile} y escanea nuevamente.`);
      }
    } else if (reason === DisconnectReason.restartRequired) {
      if (isFirstConnection) {
        if (shouldLogError('restartRequired')) {
          //conn.logger.info(`[ ⚠ ] Primer inicio: Ignorando restartRequired (posible falso positivo)`);
        }
        isFirstConnection = false;
      } else {
        if (shouldLogError('restartRequired')) {
          conn.logger.info(`[ ⚠ ] Reinicio necesario, reconectando...`);
        }
        await global.reloadHandler(true).catch(console.error);
      }
    } else if (reason === DisconnectReason.timedOut) {
      if (shouldLogError('timedOut')) {
        conn.logger.warn(`[ ⚠ ] Tiempo de conexión agotado, reconectando...`);
      }
      await global.reloadHandler(true).catch(console.error);
    } else {
      const unknownError = `unknown_${reason || ''}_${connection || ''}`;
      if (shouldLogError(unknownError)) {
        conn.logger.warn(`[ ⚠ ] Razón de desconexión desconocida. ${reason || ''}: ${connection || ''}`);
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
    global.lidResolver = new LidResolver(global.conn);
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

  const originalHandler = handler.handler.bind(global.conn);
  conn.handler = async function (chatUpdate) {
    try {
      if (chatUpdate.messages) {
        // Interceptar y procesar mensajes para resolver LIDs
        chatUpdate.messages = await interceptMessages(chatUpdate.messages);

        for (const message of chatUpdate.messages) {
          if (message?.message && message.key?.remoteJid?.endsWith('@g.us')) {
            const messageTypes = Object.keys(message.message);
            
            for (const msgType of messageTypes) {
              const msgContent = message.message[msgType];
              
              // Procesar texto principal
              if (msgContent?.text) {
                msgContent.text = await processTextMentions(msgContent.text, message.key.remoteJid);
              }
              
              // Procesar caption si existe
              if (msgContent?.caption) {
                msgContent.caption = await processTextMentions(msgContent.caption, message.key.remoteJid);
              }

              // Procesar mensajes citados
              if (msgContent?.contextInfo?.quotedMessage) {
                const quotedTypes = Object.keys(msgContent.contextInfo.quotedMessage);
                
                for (const quotedType of quotedTypes) {
                  const quotedContent = msgContent.contextInfo.quotedMessage[quotedType];
                  
                  if (quotedContent?.text) {
                    quotedContent.text = await processTextMentions(quotedContent.text, message.key.remoteJid);
                  }
                  
                  if (quotedContent?.caption) {
                    quotedContent.caption = await processTextMentions(quotedContent.caption, message.key.remoteJid);
                  }
                }
              }
            }
          }
        }
      }
      
      return await originalHandler(chatUpdate);
    } catch (error) {
      console.error('❌ Error en handler interceptor:', error);
      return await originalHandler(chatUpdate);
    }
  };

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
  return true;
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

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user) return;
  await clearTmp();
}, 180000);

setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user) return;
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  const bio = `• Activo: ${uptime} | TheMystic-Bot-MD`;
  await conn?.updateProfileStatus(bio).catch((_) => _);
}, 60000);

// Limpiar y optimizar caché LID cada 30 minutos
setInterval(async () => {
  if (stopped === 'close' || !conn || !conn?.user || !global.lidResolver) return;
  
  try {
    const stats = global.lidResolver.getStats();
    
    // Si el caché tiene más de 800 entradas, hacer limpieza
    if (stats.total > 800) {
      // Eliminar entradas antiguas (más de 7 días) que no se han encontrado
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      let cleanedCount = 0;
      
      for (const [key, entry] of global.lidResolver.cache.entries()) {
        if (entry.timestamp < sevenDaysAgo && (entry.notFound || entry.error)) {
          global.lidResolver.cache.delete(key);
          if (entry.jid && global.lidResolver.jidToLidMap.has(entry.jid)) {
            global.lidResolver.jidToLidMap.delete(entry.jid);
          }
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        global.lidResolver.markDirty();
      }
    }
    
    // Ejecutar corrección automática ocasionalmente
    if (Math.random() < 0.1) { // 10% de probabilidad
      const correctionResult = global.lidResolver.autoCorrectPhoneNumbers();
    }
  } catch (error) {
    console.error('❌ Error en limpieza de caché LID:', error.message);
  }
}, 30 * 60 * 1000); // Cada 30 minutos

function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000);
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24;
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [d, 'd ️', h, 'h ', m, 'm ', s, 's '].map((v) => v.toString().padStart(2, 0)).join('');
}

// Manejo mejorado de salida del proceso
const gracefulShutdown = () => {
  if (global.lidResolver?.isDirty) {
    try {
      global.lidResolver.forceSave();
    } catch (error) {
      console.error('❌ Error guardando caché LID:', error.message);
    }
  }
};

process.on('exit', gracefulShutdown);

process.on('SIGINT', () => {
  gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  gracefulShutdown();
  process.exit(0);
});

// Manejo de errores no capturadas relacionadas con LID
process.on('unhandledRejection', (reason, promise) => {
  if (reason && reason.message && reason.message.includes('lid')) {
    console.error('❌ Error no manejado relacionado con LID:', reason);
  }
});

async function _quickTest() {
  const test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version']),
  ].map((p) => {
    return Promise.race([
      new Promise((resolve) => {
        p.on('close', (code) => {
          resolve(code !== 127);
        });
      }),
      new Promise((resolve) => {
        p.on('error', (_) => resolve(false));
      })]);
  }));
  const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
  Object.freeze(global.support);
}
