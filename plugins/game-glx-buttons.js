import fs from 'fs';
export async function before(m, { conn }) {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.game_glx_buttons

    const usedPrefix = '.'
    const msg = m.msg?.contextInfo?.quotedMessage?.buttonsMessage?.buttons[0].buttonId

    const selectedId = m?.msg?.selectedButtonId



    let data = global.db.data.users[m.sender].gameglx



    switch (selectedId) {
        case 'glx_start_game':
            await conn.sendMessage(m.sender, {
                text: `${tradutor.texto1[0]}${m.pushName}${tradutor.texto1[1]}${data.perfil.carteira.currency}${tradutor.texto1[2]}${usedPrefix}${tradutor.texto1[3]}${usedPrefix}${tradutor.texto1[4]}${usedPrefix}${tradutor.texto1[5]}${usedPrefix}${tradutor.texto1[6]}${usedPrefix}${tradutor.texto1[7]}${usedPrefix}${tradutor.texto1[8]}${usedPrefix}${tradutor.texto1[9]}${usedPrefix}${tradutor.texto1[10]}${usedPrefix}${tradutor.texto1[11]}${usedPrefix}${tradutor.texto1[12]}${usedPrefix}${tradutor.texto1[13]}${usedPrefix}${tradutor.texto1[14]}${usedPrefix}${tradutor.texto1[15]}`,
                footer: tradutor.texto3,
                buttons: [
                    { buttonId: 'glx_start_game', buttonText: { displayText: tradutor.texto2 }, type: 1 }
                ],
                headerType: 1
            })
            break
    }


}
