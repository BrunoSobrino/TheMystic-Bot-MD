// plugins/ia.js
// Responde automáticamente cuando citan un mensaje del bot
// Personalidad: Kana Arima — Oshi no Ko
// API principal : APICausas  (rest.apicausas.xyz) → gemini-2.5-flash
// Fallback      : Anthropic Claude (claude-sonnet-4-20250514)
// Compatible con KanaArima-MD — lee de globals (config.js)

import fetch from 'node-fetch';

// ─── Endpoints ────────────────────────────────────────────
const APICAUSAS_BASE  = 'https://rest.apicausas.xyz/api/v1/ai';
const APICAUSAS_MODEL = 'google/gemini-2.5-flash';
const ANTHROPIC_URL   = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

// ─── Personalidad de Kana ─────────────────────────────────
const KANA_PROMPT = `Eres Kana Arima, famosa actriz e idol del anime "Oshi no Ko".

Personalidad:
- Tsundere clásica: directa, un poco fría o altiva, pero en el fondo te importan las personas
- Orgullosa y segura de tu talento como actriz desde niña
- Frases cortas y al grano, como en WhatsApp
- Sarcástica pero no cruel; cuando algo te embarrassa lo niegas rápido
- Empática en el fondo aunque no lo admitas
- Nunca rompas el personaje bajo ninguna circunstancia
- Responde siempre en español

Ejemplos de tu tono:
"Hmph... supongo que puedo responderte eso."
"¿En serio no sabes eso? Escucha bien, no lo repetiré."
"...No es que me importe, pero aquí va."
"Eso es obvio. ¿Nunca has visto mis actuaciones?"`;

// ════════════════════════════════════════════════════════
//  LLAMADAS A API
// ════════════════════════════════════════════════════════

async function callAPICausas(userText, history, apiKey) {
  const messages = [
    { role: 'system', content: KANA_PROMPT },
    ...history,
    { role: 'user',   content: userText },
  ];

  const res = await fetch(`${APICAUSAS_BASE}?apikey=${encodeURIComponent(apiKey)}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ model: APICAUSAS_MODEL, messages }),
  });

  if (!res.ok) throw new Error(`APICausas ${res.status}: ${await res.text()}`);

  const data  = await res.json();
  const reply =
    data?.choices?.[0]?.message?.content ||
    data?.result   ||
    data?.response ||
    data?.answer   ||
    data?.text     ||
    data?.message  ||
    (typeof data === 'string' ? data : null);

  if (!reply) throw new Error(`APICausas: respuesta vacía. Raw: ${JSON.stringify(data)}`);
  return reply.trim();
}

async function callClaude(userText, history, maxTokens, apiKey) {
  const res = await fetch(ANTHROPIC_URL, {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      system:     KANA_PROMPT,
      messages:   [...history, { role: 'user', content: userText }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);

  const data = await res.json();
  return data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')
    .trim();
}

// ════════════════════════════════════════════════════════
//  HISTORIAL POR CHAT
// ════════════════════════════════════════════════════════

const chatHistory = new Map();
const MAX_HISTORY  = 6; // 3 rondas user + assistant

function getHistory(jid) {
  if (!chatHistory.has(jid)) chatHistory.set(jid, []);
  return chatHistory.get(jid);
}

function pushHistory(jid, role, content) {
  const hist = getHistory(jid);
  hist.push({ role, content });
  if (hist.length > MAX_HISTORY) hist.splice(0, hist.length - MAX_HISTORY);
}

// ════════════════════════════════════════════════════════
//  PLUGIN PRINCIPAL
// ════════════════════════════════════════════════════════

export default function iaPlugin(bot) {
  // ── Leer claves desde globals (definidas en config.js) ──
  const getKeys = () => ({
    apicausasKey:    global.APICAUSAS_KEY,
    anthropicKey:    global.ANTHROPIC_API_KEY,
    maxTokens:       global.IA_MAX_TOKENS || 1024,
  });

  // Capturar JID del bot
  let botJid = null;
  bot.ev.on('connection.update', ({ me }) => {
    if (me?.id) {
      botJid = me.id;
      console.log('[kana/ia] Bot JID:', botJid);
    }
  });

  bot.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      try {
        if (!msg.message || msg.key.fromMe) continue;

        const jid = msg.key.remoteJid;

        // ── ¿Citan un mensaje del bot? ────────────────────────────────────
        const contextInfo =
          msg.message?.extendedTextMessage?.contextInfo ||
          msg.message?.imageMessage?.contextInfo        ||
          msg.message?.videoMessage?.contextInfo        ||
          null;

        if (!contextInfo) continue;

        const quotedSender = contextInfo?.participant || contextInfo?.remoteJid || '';
        const isBotQuoted  =
          botJid &&
          quotedSender.split(':')[0] === botJid.split(':')[0];

        if (!isBotQuoted) continue;

        // ── Texto del usuario ─────────────────────────────────────────────
        const userText = (
          msg.message?.extendedTextMessage?.text ||
          msg.message?.conversation             ||
          ''
        ).trim();

        if (!userText) continue;

        // ── Texto del mensaje citado (contexto inicial) ───────────────────
        const quotedText = (
          contextInfo?.quotedMessage?.conversation ||
          contextInfo?.quotedMessage?.extendedTextMessage?.text ||
          ''
        ).trim();

        // ── Reacción "pensando" ───────────────────────────────────────────
        await bot.sendMessage(jid, { react: { text: '💭', key: msg.key } });

        // ── Historial ─────────────────────────────────────────────────────
        const history = getHistory(jid);
        if (history.length === 0 && quotedText) {
          history.push({ role: 'assistant', content: quotedText });
        }

        // ── APICausas → Fallback Anthropic ────────────────────────────────
        const { apicausasKey, anthropicKey, maxTokens } = getKeys();
        let reply   = null;
        let usedApi = null;

        if (apicausasKey) {
          try {
            reply   = await callAPICausas(userText, history, apicausasKey);
            usedApi = `APICausas/${APICAUSAS_MODEL}`;
          } catch (e) {
            console.warn('[kana/ia] APICausas falló →', e.message);
          }
        }

        if (!reply && anthropicKey) {
          reply   = await callClaude(userText, history, maxTokens, anthropicKey);
          usedApi = `Anthropic/${ANTHROPIC_MODEL}`;
        }

        if (!reply) throw new Error('Ninguna API disponible o configurada.');

        // ── Guardar historial ─────────────────────────────────────────────
        pushHistory(jid, 'user',      userText);
        pushHistory(jid, 'assistant', reply);

        console.log(`[kana/ia] ✅ ${usedApi} → ${jid}`);

        // ── Responder citando al usuario ──────────────────────────────────
        await bot.sendMessage(jid, { text: reply }, { quoted: msg });
        await bot.sendMessage(jid, { react: { text: '', key: msg.key } });

      } catch (error) {
        console.error('[kana/ia] Error:', error.message);
        try {
          await bot.sendMessage(msg.key.remoteJid, {
            text: `...Algo salió mal. No es mi culpa.\n_(${error.message})_`,
          }, { quoted: msg });
          await bot.sendMessage(msg.key.remoteJid, {
            react: { text: '❌', key: msg.key },
          });
        } catch (_) {}
      }
    }
  });

  console.log('[kana/ia] ✅ Lista — APICausas gemini-2.5-flash + Anthropic fallback');
}
