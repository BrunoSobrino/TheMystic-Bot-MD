import fs from 'fs';
import { generateWAMessageFromContent } from 'baileys';
export async function before(m, { conn }) {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.game_glx_buttons

    const usedPrefix = '.'
    // El toque llega como buttonsResponseMessage (botones viejos) o como
    // interactiveResponseMessage (botones quick_reply nuevos).
    let selectedId = m?.msg?.selectedButtonId
    if (!selectedId) {
        try {
            selectedId = JSON.parse(m?.msg?.nativeFlowResponseMessage?.paramsJson || '{}')?.id
        } catch {}
    }



    let data = global.db.data.users[m.sender].gameglx



    switch (selectedId) {
        case 'glx_start_game': {
            // buttonsMessage está descontinuado: se responde con
            // interactiveMessage (quick_reply), mismo patrón que search-yts.
            const msg = generateWAMessageFromContent(m.sender, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            body: { text: `${tradutor.texto1[0]}${m.pushName}${tradutor.texto1[1]}${data.perfil.carteira.currency}${tradutor.texto1[2]}${usedPrefix}${tradutor.texto1[3]}${usedPrefix}${tradutor.texto1[4]}${usedPrefix}${tradutor.texto1[5]}${usedPrefix}${tradutor.texto1[6]}${usedPrefix}${tradutor.texto1[7]}${usedPrefix}${tradutor.texto1[8]}${usedPrefix}${tradutor.texto1[9]}${usedPrefix}${tradutor.texto1[10]}${usedPrefix}${tradutor.texto1[11]}${usedPrefix}${tradutor.texto1[12]}${usedPrefix}${tradutor.texto1[13]}${usedPrefix}${tradutor.texto1[14]}${usedPrefix}${tradutor.texto1[15]}` },
                            footer: { text: tradutor.texto3 },
                            header: { hasMediaAttachment: false },
                            nativeFlowMessage: {
                                buttons: [
                                    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: tradutor.texto2, id: 'glx_start_game' }) },
                                ],
                                messageParamsJson: '',
                            },
                        },
                    },
                },
            }, { userJid: conn.user.id });
            await conn.relayMessage(m.sender, msg.message, { messageId: msg.key.id });
            break
        }
    }


}
