import express from 'express';
import {createServer} from 'http';
import path from 'path';
import {Socket} from 'socket.io';
import {toBuffer} from 'qrcode';
import fetch from 'node-fetch';

function connect(conn, PORT) {
  const app = global.app = express();
  console.log(app);
  const server = global.server = createServer(app);
  let _qr = 'El código QR es invalido, posiblemente ya se escaneo el código QR.';

  conn.ev.on('connection.update', function appQR({qr}) {
    if (qr) _qr = qr;
  });

  app.use(async (req, res) => {
    res.setHeader('content-type', 'image/png');
    res.end(await toBuffer(_qr));
  });

  server.listen(PORT, () => {
    console.log('[ ℹ️ ] La aplicación está escuchando el puerto', PORT, '(ignorar si ya escaneo el código QR)');
    if (opts['keepalive']) keepAlive();
  });
}

function pipeEmit(event, event2, prefix = '') {
  const old = event.emit;
  event.emit = function(event, ...args) {
    old.emit(event, ...args);
    event2.emit(prefix + event, ...args);
  };
  return {
    unpipeEmit() {
      event.emit = old;
    }};
}

function keepAlive() {
  const url = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
  if (/(\/\/|\.)undefined\./.test(url)) return;
  setInterval(() => {
    fetch(url).catch(console.error);
  }, 5 * 1000 * 60);
}

export default connect;
