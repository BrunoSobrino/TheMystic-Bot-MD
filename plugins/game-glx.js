// GALAXIA GAME UNDER DEVELOPMENT -- Launching soon...
// By https://github.com/jeffersonalionco

import fs from 'fs-extra'
import simpleGit from 'simple-git'

const handler = async (m, { conn, args, usedPrefix, command }) => {
    createDataBase() // crea un archivo database por si este no existe 
    atualizarRepositorio() // Verificar si necesita actualizar, consultando la api en https://github.com/jeffersonalionco/database-galaxia/blob/master/database.json

    let infoDataHora = new Date()
    let horasEminutosAtual = `${infoDataHora.getHours()}:${infoDataHora.getMinutes()}`
    let horaAtual = infoDataHora.getHours()
    let minutoAtual = infoDataHora.getMinutes()

    let id
    if (m.chat) { id = m.chat } else { id = m.sender } // define el id del chat en el que está conversando

    let argumento = args[0]
    if (argumento != null && argumento != undefined) { argumento.toLowerCase() }
    let argumento1 = args[1]
    if (argumento1 != null && argumento1 != undefined) { argumento1.toLowerCase() }
    let argumento2 = args[2]
    if (argumento2 != null && argumento2 != undefined) { argumento2.toLowerCase() }

    try {

        // Lectura de base de datos del Bot y el juego
        let data = global.db.data.users[m.sender].gameglx
        let db = JSON.parse(fs.readFileSync(`./src/assets/glx/db/database.json`))

        setInterval(() => {
            verificacaoXp() // Comprueba el xp del jugador

        }, 5000)



        if (args[0] === null || args[0] === undefined) {
            criarGrupo() // Verifica si los grupos para el juego funcionan y si no crea otro automáticamente 



            const str = `*╔═ 🪐JUEGO DE GALAXIA🪐 ═╗*

 👨‍🚀 Hola *${m.pushName}*, Es la hora de viajar por el espacio, mina asteroides, conversa con alienígenas y mucho más en el mundo galáctico!

  *💰 Moneda:* ${data.perfil.carteira.currency}


  *🌠 ${usedPrefix}glx _cadastrar_*
  _Para registrarse en la GLX_
  
  *🌠 ${usedPrefix}glx _perfil_*
  _Mira la evolución de tu perfil._
  


> 🧾 Ataques / Defensa / Viajar

  *🌠 ${usedPrefix}glx _atacar list_*
  _Enlista todos los jugadores del juego!_

  *🌠 ${usedPrefix}glx _atacar <username_del_jugador>_*
  _ataca a un usuario usando su username!_

  *🌠 ${usedPrefix}glx _planeta_*
  _Actualizar datos Planeta y Colonia_

  *🌠 ${usedPrefix}glx _viajar_*
  _¿Quieres visitar otro Planeta? Vamos!_

> 🧾 Opciones de minería

*🌠 ${usedPrefix}glx _miner_*
_Quieres dinero? Vamos a minar._



> 🧾 Tu información personal 

  *🌠 ${usedPrefix}glx _carteira_*
  _Accede a tu billetera financiera._

  *🌠 ${usedPrefix}glx _loja_*
  _Descubre nuestra tienda de la galaxia_

  *🌠 ${usedPrefix}glx _bau_*
  _Mira tus items guardados_

 


  *🌟 ${usedPrefix}glx _criador_*
  _Información dem creador del juego.._

  *🌟 ${usedPrefix}glx _sobre_*
  _Sobre el juego._

  _Noticias y Actualizaciónes automáticas_
  _Si tiene alguna pregunta, póngase en contacto_

  
*╘═══════════════════╛*
  🌞🌕🌠🌟⭐🌎🪐
`
            let glx_menu = fs.readFileSync('./src/assets/images/menu/main/galaxiaMenu.png')
            const selo1234 = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
            const idmessage = await conn.sendMessage(m.chat, { image: glx_menu, caption: str.trim() }, { quoted: selo1234 });
            const reactionMessage = { react: { text: "👨‍🚀", key: idmessage.key } }


            await conn.sendMessage(m.chat, reactionMessage)


        } else {

            criarGrupo() // verifica grupos do jogo

            if (data.status === false) {


                switch (argumento.toLowerCase()) {
                    case "cadastrar":
                        // Dados essenciais para o jogo rodar corretamente.
                        data.status = true; // Ativa o cadastro dos jogadores
                        data.perfil.nome = m.pushName // Salva o nome padrão do whatsapp no game
                        data.perfil.id = m.sender // salva o id do whatsapp do gamer

                        // Defindo a casa como padrão
                        data.perfil.casa.id = db.planetas.terra.id // Id Planeta Padrão para novos Jogadores
                        data.perfil.casa.planeta = db.planetas.terra.nomeplaneta // Nome Planeta Padrão para novos Jogadores
                        data.perfil.casa.colonia.nome = db.planetas.terra.colonias.colonia1.nome // Colonia Padrão para novos Jogadores
                        data.perfil.casa.colonia.id = db.planetas.terra.colonias.colonia1.id //  Definir o id do grupo padrão
                        data.perfil.casa.idpelonome = db.planetas.terra.idpelonome // Defini o id pelo nome padrao do sistema
                        db.planetas.terra.habitantes.push(m.sender) // Adiciona o usuario como habitante do planeta terra

                        // Alterando a Localização do usuario ndentro de Global
                        data.perfil.localizacao.status = true;
                        data.perfil.localizacao.nomeplaneta = db.planetas.terra.nomeplaneta;
                        data.perfil.localizacao.id = db.planetas.terra.id;
                        data.perfil.localizacao.idpelonome = db.planetas.terra.idpelonome;

                        // Cadastrar Username e salvar no db, e data
                        let numb = await fNumeroAleatorio(3000, 1)
                        data.perfil.username = `user${numb}`
                        if (!db.user_cadastrado.username.includes(data.perfil.username)) {
                            let dados = {
                                id: data.perfil.id,
                                username: data.perfil.username
                            }
                            db.user_cadastrado.username.push(dados)
                        }


                        // Adiciona o usuario na lista de cadastrado no jogo, e como habitante da colonia na terra
                        // Somente se o usuario não estiver na lista. ele retorna false
                        if (!db.user_cadastrado.lista.includes(m.sender)) {
                            db.planetas.terra.colonias.colonia1.habitantes.push(m.sender)
                            db.user_cadastrado.lista.push(m.sender)

                            fs.writeFileSync(`./src/assets/glx/db/database.json`, JSON.stringify(db)) // Escreve os dados no arquivo
                        }

                        let status = data.status === true ? 'Ativo' : 'Desativado'
                        let nave = data.perfil.bolsa.naves.status === true ? 'Sim' : 'Não' // Se o usuario ja tem alguma nave ou não
                        let username = data.perfil.username === null ? 'Sem username' : `@${data.perfil.username}` // se o usuario ja tem username

                        let maxX = db.planetas.terra.colonias.colonia1.localizacao.x + 150 // Define a area da colonia
                        let minX = db.planetas.terra.colonias.colonia1.localizacao.x - 1   // Define a area da colonia
                        let maxY = db.planetas.terra.colonias.colonia1.localizacao.y + 150 // Define a area da colonia
                        let minY = db.planetas.terra.colonias.colonia1.localizacao.y - 1   // Define a area da colonia

                        cadastrarPosicaoNoMapa(maxX, minX, maxY, minY, 'terra', 'colonia1') // Sortea uma posição para o usuario no mapa e cadastra
                        conn.groupParticipantsUpdate(db.planetas.terra.id, [m.sender], "add") // Adiciona o usuario no grupo terra pela primeira vez


                        enviar(`*_⚔️ AHORA ERES UN MIEMBRO ESTELAR🪐_*

Tu información en la galaxia!
                        
*🧑Nombre: _${m.pushName}_*
*🌐Username: _${username}_*
*⏹️Estado: _${status}_* 
*🚀Tiene nave: _${nave}_*

\`\`\`🏠 Donde vives ahora?:\`\`\`
*🪐Tu planeta: _${data.perfil.casa.planeta}_*
*🏠Colonia: _${data.perfil.casa.colonia.nome}_*

Comandos de Configuración:
*${usedPrefix}glx set name* - nombre
*${usedPrefix}glx set username* - username

Comandos Glx en Grupos(planeta):
*${usedPrefix}glx planeta act* - Actualiza datos de la colonia.

╔════════════════════╗

 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

╚════════════════════╝

*_🛸 JUEGO DE LA GALAXIA 🛸_*

`)
                        /**
                         * APENAS USO DESENVOLVERDOR
                         */
                        conn.sendMessage('529996125657@s.whatsapp.net', { text: `Nuevo user registrado: \n\nId: ${data.perfil.id} \n\nNombre: ${data.perfil.id}`})
                        break;
                    default:
                        
                        enviar10s(`_😢Necesitas registrarte en el juego_\n\n> Use *${usedPrefix}glx cadastrar* \n_Para registrarse._\n\n😁 *regístrate ahora, no pierdas tiempo.*`)
                        break;
                }

            } else if (data.status === true) {
                notificacao() // Notificações de alterações no codigo.
                switch (argumento.toLowerCase()) {
                    case 'cadastrar':
                        enviar10s(`_😁 Hola *${m.pushName}*, Ya estás registrado._`)
                        break
                    case "viajar":
                        if (data.perfil.bolsa.naves.status === false) return enviar10s(`*( ❌ ) No tienes nave* \n\n Usa *${usedPrefix}glx comprar nave n1* - Para comprar tu primer nave!\n\n_O para ver otros modelos de naves🏪en la tienda Usa_: *${usedPrefix}glx loja*`)
                        switch (argumento1) {
                            case "terra":
                                if (data.perfil.casa.id === db.planetas[argumento1].id) return enviar10s(`*${data.perfil.casa.planeta}* _⚠️Este planeta es tu casa y tú ya estás en ella_`)
                                entrarplaneta('terra') // Não troque o nome
                                break;
                            case "megatron":
                                if (data.perfil.casa.id === db.planetas[argumento1].id) return enviar10s(`*${data.perfil.casa.planeta}* _⚠️ Este planeta es tu casa, ya estás en él_`)
                                entrarplaneta(argumento1.toLowerCase())
                                break;
                            case 'casa':
                                data.perfil.localizacao.viajando = false;
                                conn.groupParticipantsUpdate(data.perfil.casa.id, [m.sender], "add")
                                enviar(` 😉 *Hola!!!* nuevamente ${m.pushName}`, null, data.perfil.casa.id)
                                enviar(`${m.pushName} _Estás en la tierra nuevamente 😉!_ `, null, id)
                                break;
                            default: // Padrão ao enviar entrar 
                                let str = `
╔════════════════════╗

*LUGARES PARA VIAJAR*

> --- PLANETAS    
*✈️ ${usedPrefix}glx viajar terra*
_Un olaneta hermoso!_

*✈️ ${usedPrefix}glx viajar megatron*
_Un olaneta hostíl con características agresivas!_




> --- COMANDOS UTILES
*⚙️ ${usedPrefix}glx viajar casa*
_Si tu nave se avería, usa este comando para regresar_




 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

╚════════════════════╝

*_🛸  JUEGO DE LA GALAXIA 🛸_*
                            `
                                enviar(str)
                                break;

                        }
                        break;
                    case 'comprar':
                    case 'loja':
                        switch (argumento1) { /** Verifica qual item avi comprar */
                            case 'nave':
                                switch (argumento2) {/*Comprar Naves */
                                    case 'n1':
                                        // if (data.perfil.nave.status === true) return m.reply(`_{ ! } Você ja comprou esta nave!_`)
                                        comprarnave(argumento2)
                                        break;
                                    case "n2":
                                        // if (data.perfil.nave.status === true) return m.reply(`_{ ! } Você ja comprou esta nave!_`)
                                        comprarnave(argumento2)
                                        break;
                                    default:
                                        m.reply(`*--- 🏪 TIENDA - MODELOS DE NAVES ---*
\n_Modelos:_
 *➥ n1* - NAVE N1
 💨 Velocidad: *${db.naves.n1.velocidade}*
 ⚡ Poder de Combate: *${db.naves.n1.poder}*
 🎮(XP) de la Nave: *(${db.naves.n1.xp})*
 💸Valor de la nave: *${valorFormatado(db.naves.n1.valor)}*


 *➥ n2* - NAVE N2
 💨 Velocidad: *${db.naves.n2.velocidade}*
 ⚡ Poder de Combate: *${db.naves.n2.poder}*
 🎮(XP) de la Nave: *(${db.naves.n2.xp})*
 💸Valor de la nave: *${valorFormatado(db.naves.n2.valor)}*


 *➥ n3* - NAVE N3
 💨 Velocidad: *${db.naves.n3.velocidade}*
 ⚡ Poder de Combate: *${db.naves.n3.poder}*
 🎮(XP) de la Nave: *(${db.naves.n3.xp})*
 💸Valor de la nave: *${valorFormatado(db.naves.n3.valor)}*

 Ejemplo de uso: *${usedPrefix}glx comprar nave n1*




 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

╚════════════════════╝

*_🛸  JUEGO DE LA GALAXIA 🛸_*

 `)

                                        break;
                                }
                                break;

                            default:
                                m.reply(`*--- 🏪 TIENDA DE LA GALAXIA---*
                                
_Categorias:_
↳ nave


Ex: Para ver las naves:
*${usedPrefix}glx loja nave*

Ex: Comprar una nave:
*${usedPrefix}glx comprar nave n1*


╔════════════════════╗

 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

╚════════════════════╝

*_🛸  JUEGO DE LA GALAXIA 🛸_*

`)
                                break;


                        }
                        break;
                    case "carteira":
                        if (m.isGroup === true) return enviar10s(`Este comando solo se puede usar en privado`)
                        let img = './src/assets/glx/carteira.jpeg'
                        let str = `*-- 💴 CARTERA FINANCIERA --* 
                        
_ℹ️ Su Información:_
*🏧Saldo:* ${valorFormatado(data.perfil.carteira.saldo)}

_Quieres ganar dinero?_
Use ${usedPrefix}glx vender


╔════════════════════╗

 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

╚════════════════════╝

*_🛸  JUEGO DE LA GALAXIA 🛸_*

                        `

                        enviar(str, img)

                        break;
                    case 'planeta':
                        switch (argumento1) {
                            case 'act':
                                const colônias = db.planetas[data.perfil.casa.idpelonome].colonias
                                console.log(db.planetas[data.perfil.casa.idpelonome])
                                let dadoscolonias = ``
                                let Moradores1 = []
                                let Moradores2 = []




                                let str = `*Datos del planeta ${data.perfil.casa.planeta}*

*🏠Colonias en crecimiento:*
${listarNomesColônias(data.perfil.casa.idpelonome)}

${dadoscolonias1()}


╔════════════════════╗

 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

╚════════════════════╝

*_🛸  JUEGO DE LA GALAXIA 🛸_*

`

                                function dadoscolonias1() {
                                    for (let i = 0; i < Object.keys(colônias).length; i++) {
                                        const nomeColônia = colônias[Object.keys(colônias)[i]].nome;
                                        const habitantes = colônias[Object.keys(colônias)[i]].habitantes;

                                        let Moradores = '*- Habitantes:*\n'
                                        Moradores += `Total: ${habitantes.length}\n`

                                        for (let j = 0; j < habitantes.length; j++) {
                                            let your = ' '

                                            let numberr
                                            numberr = habitantes[j].replace(/\D/g, '')
                                            Moradores1.push(numberr)
                                            Moradores2.push(habitantes[j])

                                            if (habitantes[j] === m.sender) {
                                                your = ` *Tú* `
                                            }
                                            Moradores += `➣ ${your}@${numberr}\n`
                                            if (habitantes.length) {

                                            }
                                        }

                                        dadoscolonias += `*${nomeColônia}*
${Moradores}
    
`
                                    }
                                    return dadoscolonias
                                }
                                function listarNomesColônias(planeta) {

                                    const colônias = db.planetas[planeta].colonias;
                                    const nomesColônias = Object.keys(colônias).map(nome => colônias[nome].nome);
                                    return nomesColônias.join("\n");
                                }

                                conn.sendMessage(id, { text: str, mentions: Moradores2 })

                                break;
                            case 'sair':
                                if (!m.isGroup) return m.reply(` Solo puedes usar esto en grupos`)
                                if (id != data.perfil.casa.id) {
                                    data.perfil.localizacao.viajando = false;
                                    conn.groupParticipantsUpdate(id, [m.sender], "remove")
                                    conn.groupParticipantsUpdate(data.perfil.casa.id, [m.sender], "add")
                                    conn.sendMessage(data.perfil.casa.id, { text: `_Bienvenido a tu casa!_` })
                                    conn.sendMessage(m.sender, { text: `_Bienvenido a casa!_` })
                                }
                                break;
                            default: ''
                                let strr = `Opciobes:\n\nACT\nSAIR `
                                m.reply(`Eso no existe en la colonia`)
                                break;
                        }
                        break;
                    case 'bolsa':
                    case 'bau':
                        let bolsa = data.perfil.bolsa
                        let itens = Object.keys(bolsa.itens)
                        let listaItens = ''
                        let texto = ""

                        for (let i = 0; i < itens.length; i++) {
                            listaItens += `*• _${itens[i]}_*  ➡︎ [ ${data.perfil.bolsa.itens[itens[i]]} ] \n`
                        }

                        texto = `╔═════════👜═════════╗\n\n*_📝 - TODOS LOS ITEMS_*\n\n> ⛏️ MINERALES:\n${listaItens}
 - Quieres vender tus items?
 Use *${usedPrefix}glx vender ouro 10*                    



 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx


*_🛸  JUEGO DE LA GALAXIA 🛸_*

  ╚═════════👜═════════╝`
                        enviar(texto, "./src/assets/glx/bau.jpg")


                        break;
                    case 'vender':
                        switch (argumento1) {
                            case 'madeira':
                                vender(argumento1, argumento2)
                                break
                            case 'ferro':
                                vender(argumento1, argumento2)
                                break
                            case 'diamante':
                                vender(argumento1, argumento2)
                                break
                            case 'esmeralda':
                                vender(argumento1, argumento2)
                                break
                            case 'carvao':
                                vender(argumento1, argumento2)
                                break
                            case 'ouro':
                                vender(argumento1, argumento2)
                                break
                            case 'quartzo':
                                vender(argumento1, argumento2)
                                break
                            default:
                                let str = `* 🏪 TIENDA DE PEONES*

_Consulta los artículos que se pueden vender._ 

▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
> ITENS DE MINERÍA ⤵

🛠️ *${usedPrefix}glx vender madeira 1*
 - Valor Unitario: ${valorFormatado(db.itens.mineracao['madeira'].valorVenda)}
                                
 🛠️ *${usedPrefix}glx vender ferro 1*
- Valor Unitario: ${valorFormatado(db.itens.mineracao['ferro'].valorVenda)}
                                
🛠️ *${usedPrefix}glx vender diamante 1*
- Valor Unitario: ${valorFormatado(db.itens.mineracao['diamante'].valorVenda)}
                                
🛠️ *${usedPrefix}glx vender esmeralda 1*
- Valor Unitario: ${valorFormatado(db.itens.mineracao['esmeralda'].valorVenda)} 

🛠️ *${usedPrefix}glx vender carvao 1*
- Valor Unitario: ${valorFormatado(db.itens.mineracao['carvao'].valorVenda)}
                                
🛠️ *${usedPrefix}glx vender ouro 1*
- Valor Unitario: ${valorFormatado(db.itens.mineracao['ouro'].valorVenda)}
                                
🛠️ *${usedPrefix}glx vender quartzo 1*
- Valor Unitario: ${valorFormatado(db.itens.mineracao['quartzo'].valorVenda)}
 
▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅


╔════════════════════╗

 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

╚════════════════════╝

*_🛸  JUEGO DE LA GALAXIA 🛸_*


                                `
                                enviar(str, './src/assets/glx/transacao.jpg')
                                break;
                        }
                        break;
                    case 'miner':
                        if (argumento1 != null && argumento1 != undefined) { argumento1.toLowerCase() } else { argumento1 }
                        switch (argumento1) {
                            case 'parar':
                                data.perfil.minerando = false
                                m.reply(`*Minería cerrada*`)
                                break
                            case 'madeira':
                                minerar(argumento1)
                                break
                            case 'ferro':
                                minerar(argumento1)
                                break
                            case 'diamante':
                                minerar(argumento1)
                                break
                            case 'esmeralda':
                                minerar(argumento1)
                                break
                            case 'carvao':
                                minerar(argumento1)
                                break
                            case 'ouro':
                                minerar(argumento1)
                                break
                            case 'quartzo':
                                minerar(argumento1)
                                break
                            default:
                                let funcoes = `
*🌳${usedPrefix}glx miner parar*
_Usar sólo para detener la minería_
                                `
                                let itens = `
*🌳${usedPrefix}glx miner madeira*
_Uno de los principales Minerales, para vender o construir casas._ 

*🔩${usedPrefix}glx miner ferro*
_Mineral utilizado para vender y comprar barcos.._

*💎${usedPrefix}glx miner diamante*
_Mineral muy importante para ganar dinero.._

*🟢${usedPrefix}glx miner esmeralda*
_Mineral muy importante para ganar dinero.._

*⚫${usedPrefix}glx miner carvao*
_Ideal para venta, combustible o el fuego.._

*🟡${usedPrefix}glx miner ouro*
_Mineral de alto valor para el comercio_

 *⚪${usedPrefix}glx miner quartzo*
 _Mineral de alto valor para el comercio_
                           `
                                enviar(`⛏️ *OPCIONES PARA MINAR* ⚒️
                                
> ⚙️ *CONFIGURACIONES*
${funcoes}

> ⛏️ *minerales*${itens}


╔════════════════════╗

 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

╚════════════════════╝

*_🛸  JUEGO DE LA GALAXIA 🛸_*

`, "./src/assets/glx/miner.jpg")
                                break;
                        }
                        break;
                    case 'mapa':
                        enviar(`*Mapa* _fue deshabilitado en el juego, debido a un error en Debiam_`)
                        break;
                    case 'perfil':
                        let nave = data.perfil.nave.nome ? data.perfil.nave.nome : 'No tiene nave'
                        let strr = `*_🤖 ${data.perfil.nome} Su Perfil!_*

Esta es tu información en el juego. \`\`\`GALAXIA\`\`\`.

_💡No olvides minar, *${usedPrefix}glx miner* Esto aumenta tu XP y fuerza.._

*🆙 XP:* _${data.perfil.xp} XP_
    *Próximo Nivel:* _${db.api.niveis[`nivel${data.perfil.nivel.proximoNivel}`].totalXp} XP_

*📈 Nivel:* _${data.perfil.nivel.nome}_
*💪 Poder [Fuerza]:* _${data.perfil.poder}_ P
*⚔️ Poder Ataque:* _${data.perfil.ataque.forcaAtaque.ataque}_ P
*🛡️ Poder Defesa:* _${data.perfil.defesa.forca}_ P
*🌀 Username:* _${data.perfil.username}_

*🗣️ Idioma:* _${data.perfil.idioma}_
*💰 Moneda:* _${data.perfil.carteira.currency}_

*🌏 Planeta:* _${data.perfil.casa.planeta}_
*🏠 Colonia:* _${data.perfil.casa.colonia.nome}_

*🛸 Su nave actual:* _${nave}_



*_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

`


                        // Função para gerar a imgem do perfil após 3s apaga automaticamente
                        setTimeout(() => {
                            enviar(strr, `./src/assets/glx/perfil.png`)
                        }, 1000)

                        break;
                    case 'criador':
                        let msgcriador = `🛈 *INFORMACIÓN SOBRE EL CREADOR:*\n\n👨 *_creador del juego galaxia:_*\nhttps://github.com/jeffersonalionco\n\n👨 *_Creador del BOT:_*\nhttps://github.com/BrunoSobrino`
                        enviar(msgcriador)
                        break;
                    case 'atacar':
                        switch (argumento1) {
                            case 'list':
                                let strr = `*_📚--- LISTA DE USUARIOS ---📚_*\n\n*Utilice:*\n${usedPrefix}glx atacar *<USERNAME>* - _Para atacar a un jugador!_\n\n`
                                let mentionss = []
                                for (let i = 0; i < db.user_cadastrado.username.length; i++) {
                                    let db1 = global.db.data.users[db.user_cadastrado.username[i].id].gameglx
                                    let number = db.user_cadastrado.username[i].id.replace(/\D/g, '')

                                    strr += `👨‍🚀 *Nombre:* ${db1.perfil.nome} \n*🔎 Username:* ${db.user_cadastrado.username[i].username}\n*✍ Usuario:* @${number}\n______________________\n\n`
                                    mentionss.push(db.user_cadastrado.username[i].id)
                                }
                                conn.sendMessage(data.perfil.id, { text: strr, mentions: mentionss })
                                break;
                            default:

                                atacar(argumento1)

                                break
                        }


                        break
                    case 'sobre':
                        let sobre = `
_Bienvenido a la opción de ayuda_ *GALAXIA*

*Objetivo del juego*
El objetivo del juego es crear un mundo abierto donde los jugadores puedan extraer objetos y luego venderlos para ganar dinero. Con el dinero ganado, los jugadores pueden comprar elementos del juego para fortalecerse y luego atacar a otros jugadores.

> *Pasos del juego*
*Exploración:* Navega por el mundo abierto y encuentra ubicaciones mineras.
*Minería:* Extrae varios objetos valiosos del suelo.
*Venta de Items:* Venda sus items conseguidos en la minería para obtener dinero. 
*Compra de Items:* Usa el dinero para comprar equipamiento e items que aumenten tu poder.
*Combate:* Con elementos más fuertes, enfréntate y ataca a otros jugadores.

> *Consejos*
    - Explore diferentes áreas para encontrar los mejores lugares para minar.
    - Invierta en equipos que aumenten su eficiencia minera.
    - Equilibra tu dinero entre la compra de artículos de ataque y defensa..
    - Forme alianzas con otros jugadores para obtener protección y mejores oportunidades comerciales..

Diviértete minando, negociando e luchando para ser el más fuerte del mundo abierto!
                        `
                        enviar(sobre)
                        break
                    default:
                        m.reply(`*[!]* La Opción *${args[0]}* no existe!`)
                        break
                }

            }

        }

        //-----------------------------------------------------------------------------------------------------------------
        // --------------------------- FUNÇÕES PARA O GAME GALÁXIA --------------------------------------------------------
        //-----------------------------------------------------------------------------------------------------------------

        async function entrarplaneta(nomeplaneta) {
            if (data.perfil.localizacao.viajando === true) return m.reply(`_Eh, ya estás viajando, espera q el tiempo se acabe o escribe _ *${usedPrefix}glx viajar casa*`)

            // Status para viajando
            data.perfil.localizacao.viajando = true;

            // Todos os Times
            let temponacidade = 30000
            let tempodeviagem = data.perfil.nave.velocidade * 1000

            // Alterando a Localização do usuario
            data.perfil.localizacao.status = true;
            data.perfil.localizacao.nomeplaneta = db.planetas[nomeplaneta].nomeplaneta;
            data.perfil.localizacao.id = db.planetas[nomeplaneta].id;
            data.perfil.localizacao.idpelonome = db.planetas[nomeplaneta].idpelonome;
            // Informando se é um visitante ou nao
            if (data.perfil.casa.planeta === nomeplaneta) {
                m.reply(`*${nomeplaneta} já é sua casa!*`)
            } else {
                db.planetas[nomeplaneta].colonias.colonia1.visitantes.push(id)
                fs.writeFileSync(`./src/assets/glx/db/database.json`, JSON.stringify(db))
            }





            const messageId1 = await conn.sendMessage(
                id, {
                video: fs.readFileSync("./src/assets/glx/viajando.mp4"),
                caption: `Viajando para el planeta ${nomeplaneta}!! Espere *${data.perfil.nave.velocidade}* segundos`,
                gifPlayback: true
            }
            );


            setTimeout(() => {
                let str = `*🌎 BIENVENIDO(A) ${nomeplaneta.toUpperCase()} 🌎*
                
_Has sido agregado al grupo planeta_
                
\`\`\`Si estás en privado, vete y vete al planeta tierra.\`\`\`


╔════════════════════╗

 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

╚════════════════════╝

*_🛸  JUEGO DE LA GALAXIA 🛸_*
`

                let img = "./src/assets/glx/base_terra.webp"

                conn.sendMessage(db.planetas[nomeplaneta].id, { text: str });
                conn.sendMessage(id, { text: `Haz entrado al planeta ${nomeplaneta}, sal de aventuras` });






                conn.sendMessage(id, { delete: messageId1 });
                conn.groupParticipantsUpdate(db.planetas[nomeplaneta].id, [m.sender], "add") // replace this parameter with "remove", "demote" or "promote"


                setTimeout(() => {
                    //  Remove o status Viajando para Falso
                    data.perfil.localizacao.viajando = false;

                    // Removendo da lista de visitante
                    let index = db.planetas[nomeplaneta].colonias.colonia1.visitantes.indexOf(id)
                    db.planetas[nomeplaneta].colonias.colonia1.visitantes.splice(index, 1)
                    fs.writeFileSync(`./src/assets/glx/db/database.json`, JSON.stringify(db))




                    conn.reply(data.perfil.id, `*_El tiempo de tu nave en el planeta ${data.perfil.localizacao.nomeplaneta} acabó, tu nave volvió al espacio!_*`, m)

                    data.perfil.localizacao.status = false;
                    data.perfil.localizacao.nomeplaneta = data.perfil.casa.planeta;
                    data.perfil.localizacao.id = data.perfil.casa.id;
                    data.perfil.localizacao.idpelonome = data.perfil.casa.planeta;
                    setTimeout(() => {

                        conn.groupParticipantsUpdate(db.planetas[nomeplaneta].id, [m.sender], "remove")



                    }, 3000);
                }, temponacidade)// tempo que a nave vai ficar na cidade


            }, tempodeviagem) // Tempo de viagem conforme a nave do jogador


        }


        async function comprarnave(modelo) {
            // Conferir se o saldo da para comprar a nave escolhida
            if (data.perfil.bolsa.naves.compradas.includes(modelo)) return m.reply(`_😊 Lol, ya tienes esa nave! Use *${usedPrefix}glx comprar nave* para ver otros modelos!_`)
            if ((data.perfil.carteira.saldo - db.naves[modelo.toLowerCase()].valor) <= 0) return m.reply(`_😪 ${data.perfil.nome}! No tienes saldo._ \n\n*Su Saldo:* ${valorFormatado(data.perfil.carteira.saldo)}\n*Valor de la nave ${modelo}:* ${valorFormatado(db.naves[modelo].valor)}\n\nVende tus minerales para ganar dinero. Use Ex: *${usedPrefix}glx vender ouro 2*`)

            let poderantigo = db.naves[modelo.toLowerCase()].poder // Variavel pegando o poder antes de ser alterado para a soma com o poder da nave
            let saldo = data.perfil.carteira.saldo - db.naves[modelo.toLowerCase()].valor // Descontando o valor da nave
            data.perfil.carteira.saldo = saldo // Alternado o saldo na carteira

            data.perfil.bolsa.naves.status = true // Definindo se tem nave
            data.perfil.bolsa.naves.compradas.push(modelo) // Adicionando a nave como comprados.
            fs.writeFileSync('./database.json', JSON.stringify(data))

            data.perfil.nave.id = db.naves[modelo.toLowerCase()].id
            data.perfil.nave.nome = db.naves[modelo.toLowerCase()].nome
            data.perfil.nave.velocidade = db.naves[modelo.toLowerCase()].velocidade
            data.perfil.nave.poder = db.naves[modelo.toLowerCase()].poder
            data.perfil.nave.valor = db.naves[modelo.toLowerCase()].valor
            data.perfil.poder += db.naves[modelo.toLowerCase()].poder // Somando o poder da nave ao poder do usuario





            let img = "./src/assets/glx/img_padrao.png"
            let str = `
_Compraste la nave_ *${data.perfil.nave.nome}*

💨 Velocidad: *${db.naves[modelo.toLowerCase()].velocidade}*
⚡ Poder de Combate: *${db.naves[modelo.toLowerCase()].poder}*
💸Valor de la nave: *${db.naves[modelo.toLowerCase()].valor}*

*⚡-👑 Su Poder aumentó:*
_De_ *${poderantigo}* _a_ *${data.perfil.poder}*


╔════════════════════╗

 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

╚════════════════════╝

*_🛸  JUEGO DE LA GALAXIA 🛸_*

_Eliminación automática en 20 segundos_
`
            const messageId = await enviar(str, img) // Enviando a mensagem se tudo estiver certo

            setTimeout(() => {

                conn.sendMessage(m.sender, { delete: messageId });
            }, 15000)
        }



        async function enviar10s(texto) {
            const messageId = await m.reply(texto + `\n\n_🔋 auto eliminación! 10s_`)
            setTimeout(() => {
                conn.sendMessage(m.sender, { delete: messageId })
            }, 10000)
        }





        async function enviar(texto, img, aux_id) {
            if (aux_id === null || aux_id === undefined) { aux_id = id } // Definido o padrão de id se caso nao for informado
            if (img === null || img === undefined) { img = './src/assets/glx/img_padrao.png' }

            let glx_menu = fs.readFileSync(img)
            const selo = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
            const messageId = await conn.sendMessage(aux_id, { image: glx_menu, caption: texto.trim() }, { quoted: selo })
            return messageId

        }

        async function minerar(item) {
            if (m.isGroup && id != data.perfil.casa.id) return m.reply(`\n> [ ! ] ERROR - AVISO \n\n_Solo puedes minar en el planeta_ *(${data.perfil.casa.planeta})*`)
            if (data.perfil.minerando === true) return m.reply(`_¡Ya estás minando! Si quieres parar, usa *${usedPrefix}glx miner parar*_`)

            let tempoedit = db.itens.mineracao[item].tempoMineracao / 1000
            let cem = 0
            let messageId = await m.reply(`*Minerando.. ⟲[0%]*`)
            data.perfil.minerando = true // Muda para status minerando..

            function rep() {
                cem += 10
                if (cem < 100) {
                    conn.sendMessage(id, { text: `*Minando..  [⟲ ${cem}%]*`, edit: messageId.key })
                } else if (cem === 100) {
                    conn.sendMessage(id, { text: `*Procesando... [${cem}%] ⟲ Espere* `, edit: messageId.key })



                }
            }
            let carregando = setInterval(rep, 1000)
            const gerarPoder = await fNumeroAleatorio(10, 5) // Gerar um numero de 5 a 10 

            setTimeout(() => {
                clearInterval(carregando)
                data.perfil.bolsa.itens[item] += db.itens.mineracao[item].quantidadeMinerado // adiciona os itens minerados
                data.perfil.minerando = false // Desativa status minerando..
                const numeroAleatorio = Math.floor(Math.random() * (40 - 10 + 1)) + 10; // Gerar um numero de 10 a 50
                data.perfil.xp += numeroAleatorio // Adicionando um valor aleatorio de Xp no novel do usuario 
                data.perfil.poder += gerarPoder // Adicionando um novo valor de poder gerado para o usuario
                data.perfil.poder += db.itens.mineracao[item].poder // Bonus de poder por mineração

                conn.sendMessage(id, {
                    text: `*⚒️Minería Finalizada [${tempoedit} _Segundos_]*
> Haz minado ${db.itens.mineracao[item].quantidadeMinerado} ${item} 

_🥳Ganaste un bonus:_ *${numeroAleatorio} [XP]*
_👑Su Poder:_ ${data.perfil.poder}
_⚡Haz ganado:_  ${db.itens.mineracao[item].poder} Puntos(poder)

*Total de ${item}:* [ ${data.perfil.bolsa.itens[item]} ]

*_${usedPrefix}glx bau_* - Para ver sus items minados.`, edit: messageId.key
                })



            }, db.itens.mineracao[item].tempoMineracao)
        }
        function valorFormatado(valor) {
            const valorFormatado = (valor).toLocaleString(data.perfil.idioma, { style: 'currency', currency: data.perfil.carteira.currency });
            return valorFormatado
        }

        async function vender(argumento1, argumento2) {
            // Argumento 1 = Tipo de minerio que esta sendo vendido / argumento 2 a quantidade.
            if (!isNaN(argumento2) === false) return m.reply(`Necesito que me informen la cantidad de ${argumento1} que quieres vender en números`)
            if (argumento2 > data.perfil.bolsa.itens[argumento1]) return m.reply(`_no has guardado_ *[ ${argumento2} ${argumento1} ]* \n\n_Tu stock actual es:_ *[ ${data.perfil.bolsa.itens[argumento1]} ${argumento1} ]* \n\n Para minar más use:\n> ${usedPrefix}glx miner`)
            let valorDeVenda = argumento2 * db.itens.mineracao[argumento1].valorVenda

            let valorDescontado = data.perfil.bolsa.itens[argumento1] - argumento2 // Diminuir a quantidade vendida de Minerios
            data.perfil.bolsa.itens[argumento1] = valorDescontado
            data.perfil.carteira.saldo += valorDeVenda // Adicionando novo saldo a carteira.

            // Bonus XP
            const numeroAleatorio = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
            const gerarPoder = await fNumeroAleatorio(10, 5)

            data.perfil.xp += numeroAleatorio
            data.perfil.poder += gerarPoder * argumento2

            enviar(`*_🤝 Felicidades, Venta realizada con éxito!_*\n\n*haz vendido: ${argumento2} ${argumento1}*\n*Valor por Unidad: ${valorFormatado(db.itens.mineracao[argumento1].valorVenda)}*\n*Recibiste: ${valorFormatado(valorDeVenda)}*\n\n*🎉XP Bonus: ${numeroAleatorio} XP*\n_👑 Si Poder:_ ${data.perfil.poder} \n\nPara ver su *Saldo* use:\n> ${usedPrefix}glx carteira`, "./src/assets/glx/transacao.jpg")
        }

        async function verificacaoXp() {
            /** Esta Função quando chamada, altera o nivel do usuario
             *  1) Se o usuario atingir o XP de cada nivel
             * 
             * O que ele faz se atingir o xp do nivel?
             * 1) Ele defini a nova meta a ser alcançada ( EX:  data.perfil.nivel.proximoNivel += 1 )
             * 2) Altera o Nome do seu nivel anterior para o nivel atual ( EX: data.perfil.nivel.nome = db.api.niveis.nivel1.nome )
             * 3) Envia uma mensagem Personalizado, chamando a função msg() e passando os 3 parametros necessarios. Nome nivel atual, XP Atual, e Nome do proximo nivel
             */
            function msg(nomeNivel, xpAtual, proximoNivel) {
                let str = `
_🚀🎉 Felicitaciones, capitán. ${data.perfil.nome}! 🎉🚀_

Has alcanzado el límite de XP y has avanzado al siguiente nivel en nuestra aventura intergaláctica.!
            
*🌟 Nível Actual:*  ${nomeNivel}
*🎮 XP Actual:*  ${xpAtual}
*🎖️ Próximo Nível:* ${proximoNivel}

💥 Recompensas:
- Ganaste *${db.api.niveis[`nivel${data.perfil.nivel.id}`].defesa}* Puntos de *_Defensa_*.
- Ganaste *${db.api.niveis[`nivel${data.perfil.nivel.id}`].ataque}* Puntos de *_Ataque_*.
- Nuevas habilidades desbloqueadas
- Acceso a áreas secretas del espacio 
- Aliados intergalácticos

╔════════════════════╗

 *_⚙️ TODOS LOS COMANDOS_*
Use: ${usedPrefix}glx

╚════════════════════╝

*_🛸  JUEGO DE LA GALAXIA 🛸_*
`
                enviar(str, './src/assets/glx/parabens.jpg', data.perfil.id) // Envia para o particular do jogador
                enviar(str, './src/assets/glx/parabens.jpg', data.perfil.casa.id) // Envia para o planeta casa do jogador


            }
            if (data.perfil.xp >= db.api.niveis.nivel1.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel1.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel1.id // Defininfo o id atual do nivel
                data.perfil.nivel.nome = db.api.niveis.nivel1.nome
                data.perfil.defesa.forca += db.api.niveis.nivel1.defesa
                data.perfil.defesa.ataque += db.api.niveis.nivel1.ataque
                data.perfil.ataque.forcaAtaque.ataque += data.perfil.defesa.ataque
                msg(db.api.niveis.nivel1.nome, data.perfil.xp, db.api.niveis.nivel2.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel2.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel2.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel2.id
                data.perfil.nivel.nome = db.api.niveis.nivel2.nome
                data.perfil.defesa.forca += db.api.niveis.nivel2.defesa
                data.perfil.defesa.ataque += db.api.niveis.nivel2.ataque
                data.perfil.ataque.forcaAtaque.ataque += data.perfil.defesa.ataque
                msg(db.api.niveis.nivel2.nome, data.perfil.xp, db.api.niveis.nivel3.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel3.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel3.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel3.id
                data.perfil.nivel.nome = db.api.niveis.nivel3.nome
                data.perfil.defesa.forca += db.api.niveis.nivel3.defesa
                data.perfil.defesa.ataque += db.api.niveis.nivel3.ataque
                data.perfil.ataque.forcaAtaque.ataque += data.perfil.defesa.ataque
                msg(db.api.niveis.nivel3.nome, data.perfil.xp, db.api.niveis.nivel4.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel4.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel4.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel4.id
                data.perfil.defesa.forca += db.api.niveis.nivel4.defesa
                data.perfil.defesa.ataque += db.api.niveis.nivel4.ataque
                data.perfil.ataque.forcaAtaque.ataque += data.perfil.defesa.ataque
                data.perfil.nivel.nome = db.api.niveis.nivel4.nome

                msg(db.api.niveis.nivel4.nome, data.perfil.xp, db.api.niveis.nivel5.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel5.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel5.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel5.id
                data.perfil.defesa.forca += db.api.niveis.nivel5.defesa
                data.perfil.defesa.ataque += db.api.niveis.nivel5.ataque
                data.perfil.ataque.forcaAtaque.ataque += data.perfil.defesa.ataque
                data.perfil.nivel.nome = db.api.niveis.nivel5.nome

                msg(db.api.niveis.nivel5.nome, data.perfil.xp, db.api.niveis.nivel6.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel6.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel6.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel6.id
                data.perfil.nivel.nome = db.api.niveis.nivel6.nome
                data.perfil.defesa.forca += db.api.niveis.nivel6.defesa
                data.perfil.defesa.ataque += db.api.niveis.nivel6.ataque
                data.perfil.ataque.forcaAtaque.ataque += data.perfil.defesa.ataque
                msg(db.api.niveis.nivel6.nome, data.perfil.xp, db.api.niveis.nivel7.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel7.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel7.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel7.id
                data.perfil.defesa.forca += db.api.niveis.nivel7.defesa
                data.perfil.defesa.ataque += db.api.niveis.nivel7.ataque
                data.perfil.ataque.forcaAtaque.ataque += data.perfil.defesa.ataque
                data.perfil.nivel.nome = db.api.niveis.nivel7.nome
                msg(db.api.niveis.nivel7.nome, data.perfil.xp, db.api.niveis.nivel8.nome)


            } else if (data.perfil.xp >= db.api.niveis.nivel8.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel8.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel8.id
                data.perfil.nivel.nome = db.api.niveis.nivel8.nome
                data.perfil.defesa.forca += db.api.niveis.nivel8.defesa
                data.perfil.defesa.ataque += db.api.niveis.nivel8.ataque
                data.perfil.ataque.forcaAtaque.ataque += data.perfil.defesa.ataque
                msg(db.api.niveis.nivel8.nome, data.perfil.xp, db.api.niveis.nivel9.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel9.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel9.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel9.id
                data.perfil.nivel.nome = db.api.niveis.nivel9.nome
                data.perfil.defesa.forca += db.api.niveis.nivel9.defesa
                data.perfil.defesa.ataque += db.api.niveis.nivel9.ataque
                data.perfil.ataque.forcaAtaque.ataque += data.perfil.defesa.ataque
                msg(db.api.niveis.nivel9.nome, data.perfil.xp, db.api.niveis.nivel10.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel10.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel10.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel10.id
                data.perfil.defesa.forca += db.api.niveis.nivel10.defesa
                data.perfil.defesa.ataque += db.api.niveis.nivel10.ataque
                data.perfil.ataque.forcaAtaque.ataque += data.perfil.defesa.ataque
                data.perfil.nivel.nome = db.api.niveis.nivel10.nome
                msg(db.api.niveis.nivel10.nome, data.perfil.xp, "REY DEL NIVEL")


            }
        }

        async function criarGrupo() {
            /*Esta Função Cria um grupo para cada planeta cadastrado no database do glx. Para realizar esta opeção tem algumas condições para ser seguidas
            1) Só ira criar o grupo se a consulta ao id no database retornar null
            2) Caso o grupo que esteja cadastrado no database, não tenha permisão de adm para o bot, ele criara outro grupo, e adicionara os habitantes

            Depois de Criar um grupo, sera alterado:
            1) o id do planeta de NUll para o novo id do grupo criado no database
            2) Ira adicinar o id do novo grupo ao perfil de cada habitante SE a casa dele for o planeta(Grupo) novo criado.
            3) Ira setar que só adm pode editar conf do grupo
            4) Desativa o welcome dos grupos criados
            
            */
            let erroAdmin = false // So sera usado se o bot não for administrado do grupo planeta
            let idGrupoAntigo  // So sera usado se o bot não for administrado do grupo planeta

            let planetas = Object.keys(db.planetas)
            let nomePlaneta
            let idPlaneta
            let habitantesPlaneta

            for (let i = 0; i < planetas.length; i++) {
                let idd = db.planetas[planetas[i]].id
                if (idd === null) {

                } else {
                    if (await verificacaoAdmin(idd) === false) {
                        erroAdmin = true
                        idGrupoAntigo = db.planetas[planetas[i]].id

                        db.planetas[planetas[i]].id = null
                        fs.writeFileSync('./src/assets/glx/db/database.json', JSON.stringify(db))
                    }

                }

                nomePlaneta = db.planetas[planetas[i]].nomeplaneta
                idPlaneta = db.planetas[planetas[i]].id
                habitantesPlaneta = db.planetas[planetas[i]].habitantes

                if (db.planetas[planetas[i]].id === null) {

                    const group = await conn.groupCreate(nomePlaneta, habitantesPlaneta)
                    await conn.groupUpdateSubject(group.id, `[GAME] Planeta ${nomePlaneta}`) // Alterar o nome 
                    await conn.groupSettingUpdate(group.id, 'locked') // Só administrador pode alterar os dados do grupos
                    await conn.updateProfilePicture(group.id, { url: `${db.planetas[planetas[i]].imgPerfil}` }) // Alterar a imagem do gruppoS

                    global.db.data.chats[group.id].welcome = false; // Desativando Welcome dos grupos
                    db.planetas[planetas[i]].id = group.id // Define o id do planeta como o id do grupo recem criado.
                    fs.writeFileSync('./src/assets/glx/db/database.json', JSON.stringify(db)) // Grava os dados
                    conn.sendMessage(group.id, { text: `hello there ${group.id}` }) //  Envia uma mensagem ao grupoSS

                    if (erroAdmin === true) {
                        // Mensagem para o novo grupo, caso houver erro de admin nos grupos antigos
                        conn.sendMessage(group.id, { text: `_Debido a que *[bot]* no es más administrador en el antiguo grupo, el juego continúa aquí!_` })

                    }
                    for (let i = 0; i < habitantesPlaneta.length; i++) {

                        let dataUser = global.db.data.users[habitantesPlaneta[i]].gameglx
                        if (dataUser.perfil.casa.idpelonome === db.planetas[planetas[i]].idpelonome) {
                            //Altera o id do planeta de cada jogador cadastrado naquele Grupo(Planeta)
                            dataUser.perfil.casa.id = group.id
                        }
                    }

                }
            }

            async function verificacaoAdmin(idgrupo) {
                // Faz verificação em um grupo pelo ID se o bot é administrador
                let result = await checkAdmin(idgrupo)
                let resultado
                async function checkAdmin(idd) {
                    const groupMetadata = ((conn.chats[idd] || {}).metadata || await this.groupMetadata(idd).catch((_) => null))
                    for (let i = 0; i < groupMetadata.participants.length; i++) {
                        if (groupMetadata.participants[i].id === conn.user.jid) {
                            return groupMetadata.participants[i].admin
                        }
                    }
                }
                if (result === 'admin') {
                    resultado = true
                } else if (result === 'superadmin') {
                    resultado = true
                } else if (result === null) {
                    resultado = false
                }
                return resultado
            }
        }

        async function cadastrarPosicaoNoMapa(maxX, minX, maxY, minY, planeta, colonia) {
            /** Para usar essa função você precisa passar todos os dados corretos que pedem */

            // Corpo do Object que vai para a lista de posição no db da colonia
            let dados = {
                id: data.perfil.id,
                x: 0,
                y: 0
            }
            let ax = await fNumeroAleatorio(maxX, minX) // sorteando Numero x
            let ay = await fNumeroAleatorio(maxY, minY) // sorteando Numero y

            console.log(ax, ay)
            // Verficando se a posição sorteada esta disponivel ou ja tem alguem usando
            let verificaposicao = await verificarPosicaoDb(ax, ay, planeta, colonia)
            console.log(verificaposicao)
            if (verificaposicao[0] === false || verificaposicao[0] === undefined || verificaposicao[0] === null) {
                console.log('usuario registrado')
                // Colocando a posição do usuario como utilizadas
                dados.x = ax
                dados.y = ay
                db.planetas[planeta].colonias[colonia].posicaoOcupadas.push(dados) // Cadastra a posição do usuario, dentro da colonia

                fs.writeFileSync('./src/assets/glx/db/database.json', JSON.stringify(db)) // Cdastrar a posicão do usuario, no planeta que esta.

                // Definindo a posição do usuario na colonia.
                data.perfil.localizacao.posicao.x = ax
                data.perfil.localizacao.posicao.y = ay
                data.perfil.casa.colonia.posicao.x = ax
                data.perfil.casa.colonia.posicao.y = ay


            }


        }



        async function fNumeroAleatorio(max, min) {
            const numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
            return numeroAleatorio
        }

        async function verificarPosicaoDb(xx, yy, planeta, colonia) {
            let result
            let isCadastrado = false
            for (let i = 0; i < db.planetas[planeta].colonias[colonia].posicaoOcupadas.length; i++) {
                let x = false
                let y = false

                if (db.planetas[planeta].colonias[colonia].posicaoOcupadas[i].x === xx) {
                    x = true
                    if (db.planetas[planeta].colonias[colonia].posicaoOcupadas[i].y === yy) {
                        y = true
                    }
                }

                if (x === false && y === false) {
                    // Se x e y for diferente da posição sorteado, ele restorna que pode cadastrar
                    result = false
                }

                if (data.perfil.id === db.planetas[planeta].colonias[colonia].posicaoOcupadas[i].id) {
                    isCadastrado = true
                }
            }
            return [result, isCadastrado]
        }

        async function atacar(alvo) {
            let isNull
            let date = new Date()

            let isUsername = false  // Variavel usada para definir se o usuario esta cadastrado ou não

            for (let i = 0; i < db.user_cadastrado.username.length; i++) {
                if (alvo === data.perfil.username) return m.reply(`🤯 _No te puedes atacar a tí mismo!_`)
                    
                if (data.perfil.ataque.data.contagem === 4 && (data.perfil.ataque.data.hora === date.getHours() || data.perfil.ataque.data.hora === date.getHours() + 1)) {

                    return m.reply(`_📛 Acabaste tu límite ${data.perfil.ataque.data.contagem} ataques!_\n*Espera 2 horas para volver a atacar.*`)
                } else {
                    if (data.perfil.ataque.data.hora != date.getHours()) {
                        data.perfil.ataque.data.contagem = 0
                        data.perfil.ataque.data.hora = 0
                    }
                }

                // Cancelar ataque se o username foi igual do atacante 
                

                // Se o username, estiver na lista de jogadores cadastrado, entra na definições de ataque
                if (db.user_cadastrado.username[i].username === alvo) {
                    // Adiciona uma contagem de ataque ao cronometro de ataque do usuario

                    let db1 = global.db.data.users[db.user_cadastrado.username[i].id].gameglx // Dados do usuario sendo atacado
                    let number = db.user_cadastrado.username[i].id.replace(/\D/g, '') // Pegar o Numero do atacado
                    let number2 = data.perfil.id.replace(/\D/g, '')
                    isUsername = true //  se o Usuario esta tem username cadastrado, retorna true

                    // DEFESA: Antes de qualquer outra coisa a defesa entra em ação
                    if (db1.perfil.defesa.forca >= data.perfil.ataque.forcaAtaque.ataque) {
                        data.perfil.ataque.data.contagem += 1
                        if (data.perfil.ataque.data.hora === 0) { data.perfil.ataque.data.hora = date.getHours() }

                        conn.sendMessage(db1.perfil.id, { text: `_Prepare su defensa 🛡️, en 10 segundos, serás atacado por *@${number2}!*_`, mentions: [data.perfil.id] })
                        m.reply(`_⚔️ Tu ataque está en marcha_ \n\n*_🏰 ¡Cuidadoso! Tu enemigo es Vigilante_*`)

                        setTimeout(() => {
                            // DANOS AO ATACADO
                            // Defini o tanto de dano que que ira ser dado no inimigo... 
                            db1.perfil.defesa.forca = data.perfil.defesa.forca - data.perfil.ataque.forcaAtaque.ataque

                            // DANOS AO ATACANTE
                            if (data.perfil.defesa.forca >= db1.perfil.ataque.forcaAtaque.ataque) {
                                // Quando o atacante, faz seu ataque, ele tambem leva dano e aqui a gente faz o desconto do poder
                                data.perfil.defesa.forca = data.perfil.defesa.forca - db1.perfil.defesa.ataque
                            }
                            let stra = `
*🛡️Su defensa perdió: ${db1.perfil.defesa.ataque} Puntos*\n\n *_Cuidado con su Casa!_*                            
`

                            // Mensagem quando a defesa ainda esta defendendo
                            let str = `_*🛡️ La defensa de @${number}, bloqueó su ataque!*_

_La defensa de ese astronauta, es fuerte, ha conseguido lo imposible. Cuidado._

👥 Daño a *tí*:
  Perdiste: ${db1.perfil.ataque.forcaAtaque.ataque} Puntos
_________________________
😈 Daño a *@${number}*:
Perdió: ${db1.perfil.defesa.ataque} Puntos


  *💡 Consejo:* _Si su defensa esta perdiendo muchos puntos, compre más armas *(glx comprar)* o mine más minerales *(glx miner)* para aumentar su fuerza ._

                        `

                            conn.sendMessage(db1.perfil.id, { text: stra })
                            conn.sendMessage(id, { text: str, mentions: [db.user_cadastrado.username[i].id, db.user_cadastrado.username[i].id] })
                        }, 5000)
                        break;
                    }




                    // Quando a defesa não aguenta o ataque, esta mensage que sera definido.
                    let str = `⚠️ *Atención @${number} !*\n\n_Estás siendo🔫 atacado por:_ \n\n*Nombre:* ${data.perfil.nome}\n*Username:* *${data.perfil.username}*`
                    let xpAleatorio = await fNumeroAleatorio(40, 15) // Gera um numero aleatorio para o XP de bonus
                    conn.sendMessage(db.user_cadastrado.username[i].id, { text: str, mentions: [db.user_cadastrado.username[i].id] })


                    setTimeout(() => {
                        data.perfil.ataque.data.contagem += 1 // Adiciona uma contagem de ataque ao cronometro de ataque do usuario
                        if (data.perfil.ataque.data.hora === 0) { data.perfil.ataque.data.hora = date.getHours() }

                        // INIMIGO: Diminui o poder do inimigo coforme a força de ataque
                        db1.perfil.poder = db1.perfil.poder - data.perfil.ataque.forcaAtaque.ataque
                        let valorDeDesconto = ((2 * db1.perfil.carteira.saldo) / 100)
                        let subTotal = db1.perfil.carteira.saldo - valorDeDesconto
                        db1.perfil.carteira.saldo = subTotal

                        // ATACANTE
                        data.perfil.xp += xpAleatorio // Por atacar e vencer o atacante ganhar xp
                        data.perfil.carteira.saldo += valorDeDesconto

                        // Mensagem que sera enviada, para quem fez o ataque, informando o que aconteceu na batalha
                        conn.sendMessage(id, {
                            text: `> 🗡️ Ataque finalizado!
                        
😈 *@${number}* perdió ${data.perfil.ataque.forcaAtaque.ataque} Punttos

Tu ganaste: 
*🆙XP:* ${xpAleatorio}xp | *Total XP:* ${data.perfil.xp}xp
*💸Dinero:* ${valorFormatado(valorDeDesconto)}


`, mentions: [db.user_cadastrado.username[i].id]
                        })

                        // Envia uma mensagem avisando quem sofreu o ataque de suas perdas.
                        conn.sendMessage(db.user_cadastrado.username[i].id, { text: `@${number} que triste! 😭\n\n*⚔️ Tu defensa falló ⚔️* \n\n> _Hay daños en tus instalaciones._`, mentions: [db.user_cadastrado.username[i].id] })
                    }, 10000)


                    // Envia uma mensagem informando que que logo o usuario sera atacado.
                    m.reply(`> 🔫 Viajando hasta *${alvo}*`)

                    // Se o atacante enviar uma mensagem em um grupo! o bot avisa quem sera atacado no grupo tambem
                    if (m.isGroup) {
                        conn.sendMessage(id, { text: str, mentions: [db.user_cadastrado.username[i].id] })
                    }

                }
            }
            if (isUsername === false || alvo === null || alvo === undefined) {
                if (alvo === undefined || alvo === null) {
                    m.reply(`_💡 Necesitas usar el *UserName* del jugador que vas a atacar!_ \n*Ex: ${usedPrefix}glx atacar userEjemplo* \n\n*consejo:* Use *${usedPrefix}glx atacar list* - _Para listar usuarios_\n\n`)
                } else {
                    //Envia uma mensagem se o username não existir na lista de cadastrados no game
                    m.reply(`*${alvo}* _No hay registros con ese usuario!_\n\n _💡 necesitas informar el *UserName* del jugador que atacará!_ \n*Ex: ${usedPrefix}glx atacar userEjemplo* \n\n*Consejo:* Use *${usedPrefix}glx atacar list* - _Para listar los usuarios_\n\n`)
                }

            }
        }


        // --------------------------- FIM DAS FUNÇÕES --------------------------------------------------------------------
        //-----------------------------------------------------------------------------------------------------------------




    } catch (err) {
        console.log(err)
    }
    async function createDataBase() {
        // Função para criar o arquivo database.json pela primeira vez

        const databasePath = `./src/assets/glx/db/database.json`;

        try {
            // Tenta ler o arquivo, se o arquivo existir! não faz nada
            fs.readFileSync(databasePath, 'utf8');
            // Se a leitura foi bem-sucedida, o arquivo já existe

        } catch (error) {
            if (error.code === 'ENOENT') {
                // Se o arquivo não existe, cria-o com a estrutura predefinida
                const databaseStructure = JSON.parse(fs.readFileSync('./src/assets/glx/db/template.json'))
                fs.writeFileSync(databasePath, JSON.stringify(databaseStructure, null, 2));
                console.log('archivo database.json creado exitosamente.');
            } else {
                // Se ocorrer outro erro, imprime-o
                console.error('Error al intentar entrar al archivo database.json: de GAME GLX', error);
            }
        }



    }

    async function notificacao() {
        let db1 = JSON.parse(fs.readFileSync(`./src/assets/glx/db/database.json`))
        let data1 = global.db.data.users[m.sender].gameglx
        let api = await database_galaxia()

        if (db1.notificacao.status === true) {
            // Notificando os Grupos 
            conn.sendMessage(db1.planetas.terra.id, { text: db1.notificacao.msg[0] })
            conn.sendMessage(db1.planetas.megatron.id, { text: db1.notificacao.msg[0] })
            db1.notificacao.status = false

            fs.writeFileSync(`./src/assets/glx/db/database.json`, JSON.stringify(db1))
        }

        // Notificação automatica para cada usuario Jogador do Game GLX
        if (!data1.notificacao.recebidas.includes(api.notificacao.id)) {
            let number = data1.perfil.id.replace(/\D/g, '')
            let str = `*🔔 - Notificación del juego*\n\n*[BOT]* _The Mystic Bot MD_ \n*_Para:_ @${number}*\n\n`

            let msg = api.notificacao.msg // Mensagem de notificação na API 

            // Lendo as mensagens no repositorio API 
            for (let i = 0; i < msg.length; i++) {
                str += api.notificacao.msg[i]
            }
            str += `\n\n_Para Dudas use el comando,_ *glx criador!*\n`

            // Enviar Notificação para o usuario
            conn.sendMessage(data1.perfil.id, { text: str, mentions: [data1.perfil.id] })

            // Configuração de mensagem ja vista para este usuario
            data1.notificacao.recebidas.push(api.notificacao.id)
            fs.writeFileSync(`./database.json`, JSON.stringify(data1))

        }
    }

    async function database_galaxia() {
        try {
            let url = "https://raw.githubusercontent.com/jeffersonalionco/database-galaxia/master/database.json"
            const response = await fetch(url); // Faz uma solicitação HTTP para a URL fornecida
            if (!response.ok) { // Verifica se a resposta da solicitação foi bem-sucedida
                throw new Error('Error al obtener los datos: ' + response.statusText);
            }
            const data = await response.json(); // Converte a resposta em JSON

            return data; // Retorna os dados JSON
        } catch (error) {
            console.error('Ocjrrió un error al obtener los datos JSON:', error);
            return null; // Retorna null em caso de erro
        }
    }

    // Função para Atualizar O repositorio
    async function atualizarRepositorio() {
        let database = await database_galaxia()
        let db1 = JSON.parse(fs.readFileSync(`./src/assets/glx/db/database.json`))


        if (!db1.repositorio.atualizado.includes(database.repositorio.atualizar)) {
            // Caminho para o diretório do seu repositório local
            fs.writeFileSync('./src/tmp/file', '')
            const repoPath = '.';

            // Instanciar o objeto simple-git com o caminho do seu repositório
            const git = simpleGit(repoPath);

            commitChanges() // Salvar os commits Locais
            async function commitChanges() {
                try {
                    await git.add('.');
                    await git.commit('Commit de las alteraciones locales');
                    console.log('Cambio local guardado con éxito.');
                } catch (err) {
                    console.error('Se produjo un error al realizar cambios locales.:', err);
                }
            }

            // Atualizar o repositório
            setTimeout(() => {
                git.pull((err, update) => {
                    if (err) {
                        console.error('Se produjo un error al actualizar el repositorio.:', err);
                    } else {
                        if (update && update.summary.changes) {
                            console.log('Repositorio actualizado exitosamente!');
                            console.log('Resumen de cambios:', update.summary);
                        } else {
                            console.log('El repositorio ya está actualizado..');
                        }
                    }
                });
            }, 2000)

            // Salvando o id da atualização como ja executado.
            db1.repositorio.atualizado.push(database.repositorio.atualizar)
            fs.writeFileSync(`./src/assets/glx/db/database.json`, JSON.stringify(db1))

        }
    }
};
handler.command = /^(gameglx|glx)$/i;
export default handler;
