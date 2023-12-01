import { generateWAMessageFromContent } from "@whiskeysockets/baileys";
import os from "os";
import util from "util";
import sizeFormatter from "human-readable";
import MessageType from "@whiskeysockets/baileys";
import fs from "fs";
import { performance } from "perf_hooks";
const handler = async (m, { conn, usedPrefix }) => {
  const _uptime = process.uptime() * 1000;
  const uptime = clockString(_uptime);
  const totalusrReg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
  const totalusr = Object.keys(global.db.data.users).length;
  const chats = Object.entries(conn.chats).filter(
    ([id, data]) => id && data.isChats,
  );
  const groupsIn = chats.filter(([id]) => id.endsWith("@g.us"));
  const groups = chats.filter(([id]) => id.endsWith("@g.us"));
  const used = process.memoryUsage();
  const { restrict, antiCall, antiprivado, modejadibot } =
    global.db.data.settings[conn.user.jid] || {};
  const { autoread, gconly, pconly, self } = global.opts || {};
  const old = performance.now();
  const neww = performance.now();
  const speed = (neww - old).toFixed(7);
  const wm = 'The Mystic Bot';
  const info = ` _*< INFO - ESTADO />*_

 ▢ *Prop.:* Bruno Sobrino
 ▢ *WA:* +5219992095479
 ▢ *Bot 1:* +5219991402134
 ▢ *Bot 2:* +5219993404349
 ▢ *PayPal:* paypal.me/TheShadowBrokers133
 
 ▢ *Usuarios regs.:* ${totalusrReg}
 ▢ *Usuarios totales:* ${totalusr}
 ▢ *Prefijo:* ${usedPrefix}
 ▢ *Uptime:* ${uptime}
 ▢ *Ping:* ${speed}
 ▢ *Modo:* ${self ? "privado" : "público"}
 ▢ *Tipo de bot:* ${(conn.user.jid == global.conn.user.jid ? '' : `Sub-bot de:\n ▢ +${global.conn.user.jid.split`@`[0]}`) || 'No es sub-bot'}
 
 ▢ *Chats privados:* ${chats.length - groups.length}
 ▢ *Grupos:* ${groups.length}
 ▢ *Chats totales:* ${chats.length}
 
 ▢ *Autoread:* ${autoread ? "activo" : "desactivado"}
 ▢ *Restrict:* ${restrict ? "activo" : "desactivado"}
 ▢ *PCOnly:* ${pconly ? "activado" : "desactivado"}
 ▢ *GPOnly:* ${gconly ? "activado" : "desactivado"}
 ▢ *AntiPrivado:* ${antiprivado ? "activado" : "desactivado"}
 ▢ *AntiLlamada:* ${antiCall ? "activado" : "desactivado"}
 ▢ *ModeJadiBot:* ${modejadibot ? "activado" : "desactivado"}`.trim();
conn.sendMessage(m.chat, {
  contextInfo: {
    forwardingScore: 200,
    isForwarded: true,
    externalAdReply: {
      mediaType: 2,
      title: "By Bruno Sobrino",
      body: wm,
      thumbnail: imagen1,
      sourceUrl: "https://www.youtube.com/channel/UCSTDMKjbm-EmEovkygX-lCA",
    },
  },
  caption: info,
  footer: wm,
  headerType: 6,
}, { quoted: m });

handler.command = /^(ping|speed|infobot)$/i;
export default handler;

function clockString(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor(ms / 60000) % 60;
  const s = Math.floor(ms / 1000) % 60;
  console.log({ ms, h, m, s });
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
}
