//CREADO POR @gata_dios

let fila, columna, sopaNube, sopaPalabra, sopaDir, userSP, cambioLetra, diamante = null
let intentos = 0
let handler = async (m, { conn, text, usedPrefix, command }) => {
    const datas = global
    const idioma = datas.db.data.users[m.sender].language
    const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
    const tradutor = _translate.plugins.game_sopa_de_letras


    if (!userSP) {
        userSP = m.sender.split("@")[0]
        await conn.reply(m.chat, `*@${m.sender.split("@")[0]} ${tradutor.texto1}`, m, { mentions: [m.sender] })
    }

    async function generarSopaDeLetras() {
        const LADO = 16 // Si es alto o bajo, puede dar error, deja como esta
        let sopaDeLetras = new Array(LADO);

        for (let i = 0; i < LADO; i++) {
            sopaDeLetras[i] = new Array(LADO)
        }

        const PALABRAS = tradutor.texto2
        const PALABRA = PALABRAS[Math.floor(Math.random() * PALABRAS.length)]

        let filaInicial = Math.floor(Math.random() * LADO)
        let columnaInicial = Math.floor(Math.random() * LADO)
        const DIRECCIONES = ["horizontal", "vertical", "diagonalDerecha", "diagonalIzquierda"]
        const DIRECCION = DIRECCIONES[Math.floor(Math.random() * DIRECCIONES.length)]

        let palabraAgregada = false
        while (!palabraAgregada) {
            filaInicial = Math.floor(Math.random() * LADO)
            columnaInicial = Math.floor(Math.random() * LADO)

            // Algoritmo para garantizar la palabra 
            let palabraEntra = true;
            for (let i = 0; i < PALABRA.length; i++) {
                if (DIRECCION === "horizontal" && (columnaInicial + i >= LADO)) {
                    palabraEntra = false
                    break;
                } else if (DIRECCION === "vertical" && (filaInicial + i >= LADO)) {
                    palabraEntra = false
                    break;
                } else if (DIRECCION === "diagonalDerecha" && (filaInicial + i >= LADO || columnaInicial + i >= LADO)) {
                    palabraEntra = false
                    break;
                } else if (DIRECCION === "diagonalIzquierda" && (filaInicial + i >= LADO || columnaInicial - i < 0)) {
                    palabraEntra = false
                    break;
                }
            }

            // Si la palabra entra, agregar a la sopa de letras
            if (palabraEntra) {
                for (let i = 0; i < PALABRA.length; i++) {
                    if (DIRECCION === "horizontal") {
                        sopaDeLetras[filaInicial][columnaInicial + i] = PALABRA.charAt(i)
                    } else if (DIRECCION === "vertical") {
                        sopaDeLetras[filaInicial + i][columnaInicial] = PALABRA.charAt(i)
                    } else if (DIRECCION === "diagonalDerecha") {
                        sopaDeLetras[filaInicial + i][columnaInicial + i] = PALABRA.charAt(i)
                    } else {
                        sopaDeLetras[filaInicial + i][columnaInicial - i] = PALABRA.charAt(i)
                    }
                }
                palabraAgregada = true;
            }
        }

        // Diseño 
        const LETRAS_POSIBLES = "ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓜⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ"
        const numerosUni = ["⓿", "❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾", "❿", "⓫", "⓬", "⓭", "⓮", "⓯", "⓰", "⓱", "⓲", "⓳", "⓴"]
        let sopaDeLetrasConBordes = ""
        sopaDeLetrasConBordes += "     " + [...Array(LADO).keys()].map(num => numerosUni[num]).join(" ") + "\n"
        //sopaDeLetrasConBordes += "   *╭" + "┄".repeat(LADO) + '┄┄' + "╮*\n"

        for (let i = 0; i < LADO; i++) {
            let fila = numerosUni[i] + " "

            for (let j = 0; j < LADO; j++) {
                if (sopaDeLetras[i][j]) {
                    fila += sopaDeLetras[i][j] + " "
                } else {
                    let letraAleatoria = LETRAS_POSIBLES.charAt(Math.floor(Math.random() * LETRAS_POSIBLES.length))
                    fila += letraAleatoria + " "
                }
            }
            fila += ""
            sopaDeLetrasConBordes += fila + "\n"
        }
        //sopaDeLetrasConBordes += "   *╰" + "┄".repeat(LADO) + '┄┄' + "╯*"
        sopaDeLetrasConBordes = sopaDeLetrasConBordes.replace(/[a-zA-Z]/g, letra => LETRAS_POSIBLES[letra.charCodeAt() - 65] || letra)

        await m.reply(`${tradutor.texto3[0]}
${tradutor.texto3[1]} \`\`\`"${PALABRA}"\`\`\`
${tradutor.texto3[2]}

${tradutor.texto3[3]} _"${PALABRA.charAt(0)}"_ ${tradutor.texto3[4]} _"${PALABRA}"_ ${tradutor.texto3[5]} _${intentos}_ ${tradutor.texto3[6]}

${tradutor.texto3[7]}
❇️ \`\`\`${usedPrefix + command} 28\`\`\`
➡️ \`\`\`${tradutor.texto3[8]}\`\`\`    ⬇️ \`\`\`${tradutor.texto3[9]}\`\`\``.trim())
        await m.reply(`🔠 *${PALABRA.split("").join(" ")}* 🔠\n\n` + sopaDeLetrasConBordes.trimEnd())
        fila = filaInicial
        columna = columnaInicial
        sopaNube = sopaDeLetrasConBordes
        sopaPalabra = PALABRA
        sopaDir = DIRECCION.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())
    }

    // Condiciones del juego
    cambioLetra = sopaDir
    let tagUser = userSP + '@s.whatsapp.net'
    if (userSP != m.sender.split("@")[0]) {
        await conn.reply(m.chat, `*@${tagUser.split("@")[0]} ${tradutor.texto4}`, m, { mentions: [tagUser] })
        return
    }
    if (intentos === 0) {
        intentos = 3
        generarSopaDeLetras()
        resetUserSP(sopaDir)

        async function resetUserSP() {
            await new Promise((resolve) => setTimeout(resolve, 2 * 60 * 1000)) // 2 min
            if (intentos !== 0) {
                await conn.reply(m.chat, `*@${m.sender.split("@")[0]} ${tradutor.texto5}`, m, { mentions: [m.sender] })
            }
            await new Promise((resolve) => setTimeout(resolve, 3 * 60 * 1000)) // 3 min
            if (intentos !== 0) {
                await conn.reply(m.chat, `*@${m.sender.split("@")[0]} ${tradutor.texto6[0]} _"${sopaPalabra}"_ ${tradutor.texto6[1]} _${sopaDir}_ ${tradutor.texto6[2]} _${fila}_ ${tradutor.texto6[2]} _${columna}_*`, m, { mentions: [m.sender] })
                fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
                intentos = 0
            }
        }
    } else {
        if (`${fila}${columna}` == text) {
            if (sopaPalabra.length <= 4) {
                diamante = 4
            } else if (sopaPalabra.length <= 8) {
                diamante = 8
            } else if (sopaPalabra.length <= 11) {
                diamante = 24
            } else {
                diamante = 32
            }
            global.db.data.users[m.sender].limit += diamante

            await m.reply(`\`\`\`${tradutor.texto7[0]} ${diamante} ${rpgshop.emoticon('limit')}!!\`\`\`\n\n${tradutor.texto7[1]} _"${sopaPalabra}"_ ${tradutor.texto7[2]} _${cambioLetra}_ ${tradutor.texto7[3]} _${fila}_ ${tradutor.texto7} _${columna}_*`)
            fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
            intentos = 0
            return
        } else {
            if (intentos === 1) {
                fila = null, columna = null, sopaNube = null, sopaPalabra = null, sopaDir = null, userSP = null, cambioLetra = null
                intentos = 0
                await m.reply(`${tradutor.texto8[0]} _"${sopaPalabra}"_ ${tradutor.texto8[1]} _${cambioLetra}_ ${tradutor.texto8[2]} _${fila}_ ${tradutor.texto8[2]} _${columna}_*`)
                return
            } else {
                intentos -= 1
                await m.reply(`${tradutor.texto9[0]} _${intentos}_ ${tradutor.texto9[1]}${intentos === 1 ? '' : `\n${tradutor.texto9[2]} \`\`\`${sopaPalabra}\`\`\``}\n\n${intentos === 1 ? `\`\`\`${tradutor.texto9[3]}\`\`\`\n${tradutor.texto9[4]} _${sopaPalabra}_ ${tradutor.texto9[5]} _"${cambioLetra}"_*\n\n` : ''}${sopaNube}`)
                return
            }
        }
    }
}

handler.command = /^(buscarpalabra|sopa|soup|wordsearch|wordfind|spdeletras|spletras|sppalabras|spalabras|spdepalabras)$/i
export default handler
