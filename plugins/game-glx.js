// GALAXIA GAME UNDER DEVELOPMENT -- Launching soon...
// By https://github.com/jeffersonalionco

import fs from 'fs-extra'
import { createCanvas, loadImage } from 'canvas'
const { Baileys } = (await import('@whiskeysockets/baileys'));

let tes = `

`



const handler = async (m, { conn, args, usedPrefix, command }) => {

    let infoDataHora = new Date()
    let horasEminutosAtual = `${infoDataHora.getHours()}:${infoDataHora.getMinutes()}`
    let horaAtual = infoDataHora.getHours()
    let minutoAtual = infoDataHora.getMinutes()

    let id
    if (m.chat) { id = m.chat } else { id = m.sender } // Definindo o id do chat em que esta conversando

    let argumento = args[0]
    if (argumento != null && argumento != undefined) { argumento.toLowerCase() }
    let argumento1 = args[1]
    if (argumento1 != null && argumento1 != undefined) { argumento1.toLowerCase() }
    let argumento2 = args[2]
    if (argumento2 != null && argumento2 != undefined) { argumento2.toLowerCase() }

    try {

        let data = global.db.data.users[m.sender].gameglx
        let db = JSON.parse(fs.readFileSync(`./src/glx/db/database.json`))




        let notificacao = 350
        let contador = 0
        setInterval(() => {

            // Verifica se os grupos ja estão criados
            verificacaoXp() // Fica verificando se o  xp do jogador
            if (contador === notificacao) {


                conn.sendMessage(db.planetas.terra.id, { text: `Vamos Minerar a *${db.planetas.terra.nomeplaneta}* precisa de Dinheiro para crescer \n\nHora da notificação: ${horasEminutosAtual}` })


                notificacao += 350

            }
            contador += 3
        }, 3000)



        if (args[0] === null || args[0] === undefined) {
            criarGrupo() /// verifica grupos do jogo



            const str = `*╔═ 🪐GAME DA GALAXIA🪐 ═╗*

 👨‍🚀 Olá *${m.pushName}*, está na hora de viajar pelo espaço, minerar asteroides, conversar com alienígenas e muito mais no mundo galático!

  *💰 Moeda:* ${data.perfil.carteira.currency}


  *🌠 ${usedPrefix}glx _cadastrar_*
  _Para se cadastrar no GLX_

  *🌠 ${usedPrefix}glx _viajar_*
  _Você quer visitar outro Planeta? Bora!_

  *🌠 ${usedPrefix}glx _carteira_*
  _Acesso sua carteira financeira._

  *🌠 ${usedPrefix}glx _mapa_*
  _Mapa das colonias!_

  *🌠 ${usedPrefix}glx _loja_*
  _Conheça nossa loja da galáxia_
  
  *🌠 ${usedPrefix}glx _planeta_*
  _Atualizar dados Planeta e Colonia_

  *🌠 ${usedPrefix}glx _bau_*
  _Veja seus itens guardados_

  *🌠 ${usedPrefix}glx _miner_*
  _Quer ganhar Dinheiro? Vamos minerar._

  

*╘═══════════════════╛*
  🌞🌕🌠🌟⭐🌎🪐
`
            let glx_menu = fs.readFileSync('./src/glx_menu.jpg')
            const selo1234 = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
            const idmessage = await conn.sendMessage(m.chat, { image: glx_menu, caption: str.trim() }, { quoted: selo1234 });
            const reactionMessage = { react: { text: "👨‍🚀", key: idmessage.key } }


            await conn.sendMessage(m.chat, reactionMessage)


        } else {

            criarGrupo() /// verifica grupos do jogo
            if (data.status === false) {

                switch (argumento.toLowerCase()) {
                    case "cadastrar":
                        data.perfil.nome = m.pushName // Salva o nome padrão do whatsapp no game
                        data.perfil.id = m.sender // salva o id do whatsapp do gamer
                        data.status = true; // Ativa o cadastro dos jogadores

                        // Defindo a casa como padrão
                        data.perfil.casa.id = db.planetas.terra.id // Id Planeta Padrão para novos Jogadores
                        data.perfil.casa.planeta = db.planetas.terra.nomeplaneta // Nome Planeta Padrão para novos Jogadores
                        data.perfil.casa.colonia.nome = db.planetas.terra.colonias.colonia1.nome // Colonia Padrão para novos Jogadores
                        data.perfil.casa.colonia.id = db.planetas.terra.colonias.colonia1.id
                        data.perfil.casa.idpelonome = db.planetas.terra.idpelonome
                        db.planetas.terra.habitantes.push(m.sender)

                        // Alterando a Localização do usuario
                        data.perfil.localizacao.status = true;
                        data.perfil.localizacao.nomeplaneta = db.planetas.terra.nomeplaneta;
                        data.perfil.localizacao.id = db.planetas.terra.id;
                        data.perfil.localizacao.idpelonome = db.planetas.terra.idpelonome;



                        if (!db.user_cadastrado.lista.includes(m.sender)) {
                            db.planetas.terra.colonias.colonia1.habitantes.push(m.sender)
                            db.user_cadastrado.lista.push(m.sender)

                            fs.writeFileSync(`./src/glx/db/database.json`, JSON.stringify(db))
                        }

                        let status = data.status === true ? 'Ativo' : 'Desativado'
                        let nave = data.perfil.bolsa.naves.status === true ? 'Sim' : 'Não'
                        let username = data.perfil.username === null ? 'Sem username' : `@${data.perfil.username}`

                        let maxX = db.planetas.terra.colonias.colonia1.localizacao.x + 150
                        let minX = db.planetas.terra.colonias.colonia1.localizacao.x - 1
                        let maxY = db.planetas.terra.colonias.colonia1.localizacao.y + 150
                        let minY = db.planetas.terra.colonias.colonia1.localizacao.y - 1

                        cadastrarPosicaoNoMapa(maxX, minX, maxY, minY, 'terra', 'colonia1')

                        enviar(`*_⚔️ VOCÊ AGORA É UM MEMBRO ESTELAR 🪐_*

Sua informações no Mundo da Galáxia!
                        
*🧑Nome: _${m.pushName}_*
*🌐Username: _${username}_*
*⏹️Status: _${status}_* 
*🚀Tem Nave: _${nave}_*

\`\`\`🏠 Onde você mora?:\`\`\`
*🪐Seu Planeta: _${data.perfil.casa.planeta}_*
*🏠Colonia: _${data.perfil.casa.colonia.nome}_*

Comandos de Configurações:
*${usedPrefix}glx set name* - teste
*${usedPrefix}glx set username* - teste

Comandos Glx nos Grupos(planeta):
*${usedPrefix}glx planeta act* - Atualizar dados da colonia.

`)
                        break;
                    default:
                        enviar10s(`_Você precisa se alistar no comando_ \n\n Use *${usedPrefix}glx cadastrar* - Para se cadastrar.`)
                        break;
                }

            } else if (data.status === true) {
                switch (argumento.toLowerCase()) {
                    case 'cadastrar':
                        enviar10s(`Olá *${m.pushName}*, você já tem cadastro.`)
                        break
                    case "viajar":
                        if (data.perfil.bolsa.naves.status === false) return enviar10s(`*( ❌ ) Você não tem nave* \n\n Utilize *${usedPrefix}glx comprar nave n1* - Para comprar sua primeira nave\n\n_Para ver toda a 🏪loja utilize_ *${usedPrefix}glx comprar*`)
                        switch (argumento1) {
                            case "terra":
                                if (data.perfil.casa.id === db.planetas[argumento1].id) return enviar10s(`*${data.perfil.casa.planeta}* _Este planeta é sua casa, e você ja esta nele_`)
                                entrarplaneta('terra') // Não troque o nome
                                break;
                            case "megatron":
                                if (data.perfil.casa.id === db.planetas[argumento1].id) return enviar10s(`*${data.perfil.casa.planeta}* _Este planeta é sua casa, e você ja esta nele_`)
                                entrarplaneta(argumento1.toLowerCase())
                                break;
                            case 'casa':
                                conn.groupParticipantsUpdate(data.perfil.casa.id, [m.sender], "add")
                                enviar(`Oi de volta ${m.pushName}`, null, data.perfil.casa.id)
                                break;
                            default: // Padrão ao enviar entrar 
                                let str = `*LUGARES PARA VOCÊ VIAJAR*

> --- PLANETAS    

*✈️ ${usedPrefix}glx viajar terra*
_Um planeta belo e bonito!_

*✈️ ${usedPrefix}glx viajar megatron*
_Um planeta hostil com caracteristica agressiva!_

> --- COMANDOS UTIL
*⚙️ ${usedPrefix}glx viajar casa*
_caso sua nave estrague, use este comando para voltar_   
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
                                        m.reply(`*--- 🏪 LOJA - MODELOS NAVE ---*
\n_Modelos:_
 *➥ n1* - NAVE N1
 💨 Velocidade: *${db.naves.n1.velocidade}*
 ⚡ Poder de Comabate: *${db.naves.n1.poder}*
 🎮(XP) da Nave: *(${db.naves.n1.xp})*
 💸Valor da nave: *${valorFormatado(db.naves.n1.valor)}*


 *➥ n2* - NAVE N2
 💨 Velocidade: *${db.naves.n2.velocidade}*
 ⚡ Poder de Comabate: *${db.naves.n2.poder}*
 🎮(XP) da Nave: *(${db.naves.n2.xp})*
 💸Valor da nave: *${valorFormatado(db.naves.n2.valor)}*


 Exemplo de uso: *${usedPrefix}glx comprar nave n1*`)

                                        break;
                                }
                                break;

                            default:
                                m.reply(`*--- 🏪 LOJA DA GALÁXIA ---*\n\n_Categorias:_\n ↳ nave\n ↳ carro \n\nEx: Para ver as naves:\n *${usedPrefix}glx loja nave*\nEx: Se quiser Comprar uma nave:\n*${usedPrefix}glx comprar nave n1*`)
                                break;


                        }
                        break;
                    case "carteira":
                        if (m.isGroup === true) return enviar10s(`Este comando só pode ser usado no Privado`)
                        let img = './src/glx/carteira.jpeg'
                        let str = `*-- 💴 CARTEIRA FINANCEIRA --* 
                        
_ℹ️ Suas Informações:_
*🏧Saldo:* ${valorFormatado(data.perfil.carteira.saldo)}

_Quer Ganhar Dinheiro?_
Use ${usedPrefix}glx vender


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




                                let str = `*Dados do planeta ${data.perfil.casa.planeta}*

*🏠Colonias em crescimento:*
${listarNomesColônias(data.perfil.casa.idpelonome)}

${dadoscolonias1()}

`

                                function dadoscolonias1() {
                                    for (let i = 0; i < Object.keys(colônias).length; i++) {
                                        const nomeColônia = colônias[Object.keys(colônias)[i]].nome;
                                        const habitantes = colônias[Object.keys(colônias)[i]].habitantes;

                                        let Moradores = '*- Moradores:*\n'
                                        Moradores += `Total: ${habitantes.length}\n`

                                        for (let j = 0; j < habitantes.length; j++) {
                                            let your = ' '

                                            let numberr
                                            numberr = habitantes[j].replace(/\D/g, '')
                                            Moradores1.push(numberr)
                                            Moradores2.push(habitantes[j])

                                            if (habitantes[j] === m.sender) {
                                                your = ` *Você* `
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
                                if (!m.isGroup) return m.reply(` Este comando só pode ser usado em grupos`)
                                if (id != data.perfil.casa.id) {
                                    data.perfil.localizacao.viajando = false;
                                    conn.groupParticipantsUpdate(id, [m.sender], "remove")
                                    conn.groupParticipantsUpdate(data.perfil.casa.id, [m.sender], "add")
                                    conn.sendMessage(data.perfil.casa.id, { text: `_Bem vindo na sua casa!_` })
                                    conn.sendMessage(m.sender, { text: `_Bem vindo na sua casa!_` })
                                }
                                break;
                            default: ''
                                let strr = `Opções:\n\nACT\nSAIR `
                                m.reply(`Isso não existe na colonia`)
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

                        texto = `╔═════════👜═════════╗\n\n*_📝 - TODOS OS ITENS_*\n\n> ⛏️ MINERAÇÃO:\n${listaItens}
 - Quer vender seus itens?
 Use *${usedPrefix}glx vender ouro 10*                    

  ╚═════════👜═════════╝`
                        enviar(texto, "./src/glx/bau.jpg")


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
                                let str = `* 🏪 LOJA DE PENHORES*

_Confira os itens que podem ser vendidos_ 

▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
> ITENS DE MINÉRIOS ⤵

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
                                `
                                enviar(str, './src/glx/transacao.jpg')
                                break;
                        }
                        break;
                    case 'miner':
                        if (argumento1 != null && argumento1 != undefined) { argumento1.toLowerCase() } else { argumento1 }
                        switch (argumento1) {
                            case 'parar':
                                data.perfil.minerando = false
                                m.reply(`*Mineração encerrada*`)
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
_Use somente para parar uma mineração_
                                `
                                let itens = `
*🌳${usedPrefix}glx miner madeira*
_Um dos principais Minério, para vender ou construir  casas._ 

*🔩${usedPrefix}glx miner ferro*
_Minerio usado para vender e comprar naves._

*💎${usedPrefix}glx miner diamante*
_Minério muito importante para ganhar Dinheiro._

*🟢${usedPrefix}glx miner esmeralda*
_Minério muito importante para ganhar Dinheiro._

*⚫${usedPrefix}glx miner carvao*
_Otimo para venda, combustivel ou Fogos._

*🟡${usedPrefix}glx miner ouro*
_Minério de alto valor para comercio_

 *⚪${usedPrefix}glx miner quartzo*
 _Minério de alto valor para comercio_
                           `
                                enviar(`⛏️ *Opções para Mineração* ⚒️\n\n> ⚙️ *Configurações*\n${funcoes}\n\n> ⛏️ *Minérios*${itens}`, "./src/glx/miner.jpg")
                                break;
                        }
                        break;
                    case 'mapa':
                        mapa()
                        setTimeout(() => {
                            enviar(`*>>>>>>>>>>> MAPA <<<<<<<<<<<*\n\n _- SEU PLANETA: *${data.perfil.casa.planeta}*_ \n\nPara saber dados das colonias \n> Use: ${usedPrefix}glx planeta act`, './src/glx/mapa_com_posicoes.png')
                        }, 2000)

                        break;
                    case 'teste':

                        console.log(db.planetas.terra.colonias.colonia1.posicaoOcupadas)







                        break;
                    default:
                        m.reply(`*[!]* Opção *${args[0]}* não existe!`)
                        break
                }

            }

        }

        //-----------------------------------------------------------------------------------------------------------------
        // --------------------------- FUNÇÕES PARA O GAME GALÁXIA --------------------------------------------------------
        //-----------------------------------------------------------------------------------------------------------------

        async function entrarplaneta(nomeplaneta) {
            if (data.perfil.localizacao.viajando === true) return m.reply(`Ué, você ja esta viajando. aguarda seu tempo acabar, ou envie ${usedPrefix}glx viajar sair`)

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
                fs.writeFileSync(`./src/glx/db/database.json`, JSON.stringify(db))
            }





            const messageId1 = await conn.sendMessage(
                id, {
                video: fs.readFileSync("./src/glx/viajando.mp4"),
                caption: `Viajando para o planeta ${nomeplaneta}!! Aguarde *${data.perfil.nave.velocidade}* segundos`,
                gifPlayback: true
            }
            );


            setTimeout(() => {
                let str = `*🌎 BEM VINDO(A) ${nomeplaneta.toUpperCase()} 🌎*
                
_Você foi adicionado, ao grupo do planeta_
                
\`\`\`Se estiver no privado saia e va para o planeta terra\`\`\` `

                let img = "./src/glx/base_terra.webp"

                conn.sendMessage(db.planetas[nomeplaneta].id, { text: str });
                conn.sendMessage(id, { text: `Você ja entrou no planeta ${nomeplaneta}, pode ir se aventurar` });






                conn.sendMessage(id, { delete: messageId1 });
                conn.groupParticipantsUpdate(db.planetas[nomeplaneta].id, [m.sender], "add") // replace this parameter with "remove", "demote" or "promote"


                setTimeout(() => {
                    //  Remove o status Viajando para Falso
                    data.perfil.localizacao.viajando = false;

                    // Removendo da lista de visitante
                    let index = db.planetas[nomeplaneta].colonias.colonia1.visitantes.indexOf(id)
                    db.planetas[nomeplaneta].colonias.colonia1.visitantes.splice(index, 1)
                    fs.writeFileSync(`./src/glx/db/database.json`, JSON.stringify(db))




                    conn.reply(data.perfil.id, `*_O tempo de sua nave no planeta ${data.perfil.localizacao.nomeplaneta} acabou agora sua nave voltou para o espaço!_*`, m)

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
            if (data.perfil.bolsa.naves.compradas.includes(modelo)) return m.reply(`_😊 Uau, você já tem esta nave! Use *${usedPrefix}glx comprar nave* para ver outros modelos!_`)
            if ((data.perfil.carteira.saldo - db.naves[modelo.toLowerCase()].valor) <= 0) return m.reply(`_😪 ${data.perfil.nome}! Você não tem saldo._ \n\n*Seu Saldo:* ${valorFormatado(data.perfil.carteira.saldo)}\n*Valor da nave ${modelo}:* ${valorFormatado(db.naves[modelo].valor)}\n\nVenda seus minerios para ganhar dinheiro. Use Ex: *${usedPrefix}glx vender ouro 2*`)


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

            // Somando o Poder da nave, ao poder total do usuario
            data.perfil.poder += db.naves[modelo.toLowerCase()].poder



            let img = "./src/glx/img_padrao.png"
            let str = `
_Você comprou a nave_ *${data.perfil.nave.nome}*

💨 Velocidade: *${db.naves[modelo.toLowerCase()].velocidade}*
⚡ Poder de Comabate: *${db.naves[modelo.toLowerCase()].poder}*
💸Valor da nave: *${db.naves[modelo.toLowerCase()].valor}*


_Delete automatico em 20s_
`
            const messageId = await enviar(str, img) // Enviando a mensagem se tudo estiver certo

            setTimeout(() => {

                conn.sendMessage(m.sender, { delete: messageId });
            }, 15000)
        }



        async function enviar10s(texto) {
            const messageId = await m.reply(texto + `\n\n_🔋 auto delete! 10s_`)
            setTimeout(() => {
                conn.sendMessage(m.sender, { delete: messageId })
            }, 10000)
        }





        async function enviar(texto, img, aux_id) {
            if (aux_id === null || aux_id === undefined) { aux_id = id } // Definido o padrão de id se caso nao for informado
            if (img === null || img === undefined) { img = './src/glx/img_padrao.png' }

            let glx_menu = fs.readFileSync(img)
            const selo = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
            const messageId = await conn.sendMessage(aux_id, { image: glx_menu, caption: texto.trim() }, { quoted: selo })
            return messageId

        }

        async function minerar(item) {
            if (m.isGroup && id != data.perfil.casa.id) return m.reply(`\n> [ ! ] ERRO - AVISO \n\n_Você só pode Minerar no planeta_ *(${data.perfil.casa.planeta})*`)
            if (data.perfil.minerando === true) return m.reply(`_Você ja esta minerando! Se deseja parar, use *${usedPrefix}glx miner parar*_`)

            let tempoedit = db.itens.mineracao[item].tempoMineracao / 1000
            let cem = 0
            let messageId = await m.reply(`*Minerando.. ⟲[0%]*`)
            data.perfil.minerando = true // Muda para status minerando..

            function rep() {
                cem += 10
                if (cem < 100) {
                    conn.sendMessage(id, { text: `*Minerando..  [⟲ ${cem}%]*`, edit: messageId.key })
                } else if (cem === 100) {
                    conn.sendMessage(id, { text: `*Processando... [${cem}%] ⟲ Aguarde* `, edit: messageId.key })



                }
            }
            let carregando = setInterval(rep, 1000)

            setTimeout(() => {
                clearInterval(carregando)
                data.perfil.bolsa.itens[item] += db.itens.mineracao[item].quantidadeMinerado // adiciona os itens minerados
                data.perfil.minerando = false // Desativa status minerando..
                const numeroAleatorio = Math.floor(Math.random() * (40 - 10 + 1)) + 10;
                data.perfil.xp += numeroAleatorio
                conn.sendMessage(id, { text: `*⚒️Mineração Concluida [${tempoedit} _Segundos_]* \n\n_🥳Ganhou um Bônus:_ *${numeroAleatorio} [XP]*\n> Você minerou ${db.itens.mineracao[item].quantidadeMinerado} ${item} \n\n*Total de ${item}:* [ ${data.perfil.bolsa.itens[item]} ]`, edit: messageId.key })



            }, db.itens.mineracao[item].tempoMineracao)
        }
        function valorFormatado(valor) {
            const valorFormatado = (valor).toLocaleString(data.perfil.idioma, { style: 'currency', currency: data.perfil.carteira.currency });
            return valorFormatado
        }

        async function vender(argumento1, argumento2) {
            // Argumento 1 = Tipo de minerio que esta sendo vendido / argumento 2 a quantidade.
            if (!isNaN(argumento2) === false) return m.reply(`Preciso que informe a quantidade de ${argumento1} que deseja vender em numeros`)
            if (argumento2 > data.perfil.bolsa.itens[argumento1]) return m.reply(`_Você não tem guardado_ *[ ${argumento2} ${argumento1} ]* \n\n_Seu Estoque atual é:_ *[ ${data.perfil.bolsa.itens[argumento1]} ${argumento1} ]* \n\n Para minerar mais use:\n> ${usedPrefix}glx miner`)
            let valorDeVenda = argumento2 * db.itens.mineracao[argumento1].valorVenda

            let valorDescontado = data.perfil.bolsa.itens[argumento1] - argumento2 // Diminuir a quantidade vendida de Minerios
            data.perfil.bolsa.itens[argumento1] = valorDescontado
            data.perfil.carteira.saldo += valorDeVenda // Adicionando novo saldo a carteira.

            // Bonus XP
            const numeroAleatorio = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
            data.perfil.xp += numeroAleatorio

            enviar(`*_🤝 Parabéns, Venda realizada com sucesso!_*\n\n*Você Vendeu: ${argumento2} ${argumento1}*\n*Valor por Unidade: ${valorFormatado(db.itens.mineracao[argumento1].valorVenda)}*\n*Você recebeu: ${valorFormatado(valorDeVenda)}*\n\n*🎉XP Bônus: ${numeroAleatorio} XP* \n\nPara ver seu *Saldo* use:\n> ${usedPrefix}glx carteira`, "./src/glx/transacao.jpg")
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
_🚀🎉 Parabéns, Capitão ${data.perfil.nome}! 🎉🚀_

Você alcançou o limite de XP e avançou para o próximo nível em nossa aventura intergaláctica!
            
*🌟 Nível Atual:*  ${nomeNivel}
*🎮 XP Atual:*  ${xpAtual}
*🎖️ Próximo Nível:* ${proximoNivel}

💥 Recompensas:
- Novas habilidades desbloqueadas
- Acesso a áreas secretas no espaço
- Novos aliados intergalácticos            
`
                enviar(str, './src/glx/parabens.jpg', data.perfil.id) // Envia para o particular do jogador
                enviar(str, './src/glx/parabens.jpg', data.perfil.casa.id) // Envia para o planeta casa do jogador


            }
            if (data.perfil.xp >= db.api.niveis.nivel1.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel1.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel1.id // Defininfo o id atual do nivel
                data.perfil.nivel.nome = db.api.niveis.nivel1.nome
                msg(db.api.niveis.nivel1.nome, data.perfil.xp, db.api.niveis.nivel2.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel2.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel2.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel2.id
                data.perfil.nivel.nome = db.api.niveis.nivel2.nome
                msg(db.api.niveis.nivel2.nome, data.perfil.xp, db.api.niveis.nivel3.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel3.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel3.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel3.id
                data.perfil.nivel.nome = db.api.niveis.nivel3.nome
                msg(db.api.niveis.nivel3.nome, data.perfil.xp, db.api.niveis.nivel4.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel4.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel4.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel4.id
                msg(db.api.niveis.nivel4.nome, data.perfil.xp, db.api.niveis.nivel5.nome)
                data.perfil.nivel.nome = db.api.niveis.nivel4.nome

            } else if (data.perfil.xp >= db.api.niveis.nivel5.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel5.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel5.id
                msg(db.api.niveis.nivel5.nome, data.perfil.xp, db.api.niveis.nivel6.nome)
                data.perfil.nivel.nome = db.api.niveis.nivel5.nome

            } else if (data.perfil.xp >= db.api.niveis.nivel6.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel6.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel6.id
                data.perfil.nivel.nome = db.api.niveis.nivel6.nome
                msg(db.api.niveis.nivel6.nome, data.perfil.xp, db.api.niveis.nivel7.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel7.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel7.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel7.id
                msg(db.api.niveis.nivel7.nome, data.perfil.xp, db.api.niveis.nivel8.nome)
                data.perfil.nivel.nome = db.api.niveis.nivel7.nome

            } else if (data.perfil.xp >= db.api.niveis.nivel8.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel8.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel8.id
                data.perfil.nivel.nome = db.api.niveis.nivel8.nome
                msg(db.api.niveis.nivel8.nome, data.perfil.xp, db.api.niveis.nivel9.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel9.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel9.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel9.id
                data.perfil.nivel.nome = db.api.niveis.nivel9.nome
                msg(db.api.niveis.nivel9.nome, data.perfil.xp, db.api.niveis.nivel10.nome)

            } else if (data.perfil.xp >= db.api.niveis.nivel10.totalXp && data.perfil.nivel.proximoNivel === db.api.niveis.nivel10.id) {

                data.perfil.nivel.proximoNivel += 1 // definido id do proximo nivel
                data.perfil.nivel.id = db.api.niveis.nivel10.id
                msg(db.api.niveis.nivel10.nome, data.perfil.xp, "Sem Nivel")
                data.perfil.nivel.nome = db.api.niveis.nivel10.nome

            }
        }

        async function mapa() {
            /*Esta função cria uma imagem de um mapa com os dados especificado de cada planeta
            1) A marcação no mapa de cada planeta ficara no X E Y de cada planeta no database
            2) 
            */
            let planeta = db.planetas[data.perfil.casa.idpelonome]
            let colonias = Object.keys(planeta.colonias)


            // Configurações do mapa
            const largura = 1000;
            const altura = 600;

            // Criar um canvas com as dimensões do mapa
            const canvas = createCanvas(largura, altura);
            const context = canvas.getContext('2d');

            // Carregar a imagem de fundo do mapa
            loadImage('./src/glx/fundomapa.jpg').then((imagemMapa) => {
                // Desenhar a imagem de fundo do mapa
                context.drawImage(imagemMapa, 0, 0, largura, altura);

                /* COLONIA 1
               const xInicio =  300; // Inicio da linha Horizontal da esquerda para direita
               const xFim = 400; // Inicio da linha Horizontal da esquerda para direita
               const yInicio = 160; // inicio da linha vertical de cima para baixo 
               const yFim = 260; // Fim da linha vertical de cima para baixo 
               const larguraBorda = 3;
               context.strokeStyle = 'red'; // Cor da borda
               context.lineWidth = larguraBorda;
               context.strokeRect(xInicio, yInicio, xFim - xInicio, yFim - yInicio);*/


                // Função para desenhar uma caixa de texto com cantos arredondados
                async function drawRoundRect(x, y, largura, altura, raio, corFundo, corBorda, opacidade) {
                    context.beginPath();
                    context.moveTo(x + raio, y);
                    context.arcTo(x + largura, y, x + largura, y + altura, raio);
                    context.arcTo(x + largura, y + altura, x, y + altura, raio);
                    context.arcTo(x, y + altura, x, y, raio);
                    context.arcTo(x, y, x + largura, y, raio);
                    context.closePath();
                    context.fillStyle = `rgba(255, 255, 255, ${opacidade})`; // Fundo branco quase transparente
                    context.strokeStyle = corBorda;
                    context.lineWidth = 1;
                    context.fill();
                    context.stroke();
                }

                let titulos2 = []
                for (let i = 1; i <= Object.keys(planeta.colonias).length; i++) {
                    let template = { nome: 'teste', x: 0, y: 0 }
                    template.nome = planeta.colonias[`colonia${i}`].nome
                    template.x = planeta.colonias[`colonia${i}`].localizacao.x
                    template.y = planeta.colonias[`colonia${i}`].localizacao.y
                    titulos2.push(template)
                }
                // Títulos das cidades
                const titulosCidades = titulos2

                // Desenhar os títulos das cidades
                context.fillStyle = 'white'; // Cor das letras
                context.font = 'bold 20px Arial'; // Estilo da fonte
                titulosCidades.forEach(titulo => {
                    // Determinar a largura do texto para centralizá-lo na caixa
                    const larguraTexto = context.measureText(titulo.nome).width;
                    // Desenhar a caixa de texto com cantos arredondados
                    drawRoundRect(titulo.x - larguraTexto / 2 - 5, titulo.y - 20, larguraTexto + 10, 30, 5, 'white', 'white', 0.3); // Opacidade de 70%
                    // Definir a cor do texto como marrom
                    context.fillStyle = 'white';
                    context.arc(titulosCidades.x, titulosCidades.y, 5, 0, Math.PI * 3);
                    // Escrever o texto dentro da caixa
                    context.fillText(titulo.nome, titulo.x - larguraTexto / 2, titulo.y);
                });

                // Adicione o novo nome com formatação diferente
                const novoNome = data.perfil.nome;
                const novoX = data.perfil.casa.colonia.posicao.x; // Substitua com o valor correto
                const novoY = data.perfil.casa.colonia.posicao.y; // Substitua com o valor correto


                const corOriginal = context.fillStyle;

                // Desenhar o novo nome sem borda ou fundo formatados, apenas a cor do texto
                context.fillStyle = 'yellow'; // Definindo a cor do texto como amarelo
                context.fillText(novoNome, novoX - 50, novoY - 10);
                
                // Restaurar a cor original do contexto
                context.fillStyle = corOriginal;
                
                // Desenhar uma marcação
                context.beginPath();
                context.arc(novoX, novoY, 10, 0, Math.PI * 2); // Desenha um círculo de raio 5 nas coordenadas do novo nome
                context.fillStyle = 'blue'; // Cor da marcação
                context.fill();

                // Salvar o mapa como uma imagem
                const buffer = canvas.toBuffer('image/png');
                return fs.writeFileSync('./src/glx/mapa_com_posicoes.png', buffer);


            }).catch((error) => {
                console.error('Erro ao carregar imagem do mapa:', error);
            });

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
                        fs.writeFileSync('./src/glx/db/database.json', JSON.stringify(db))
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
                    fs.writeFileSync('./src/glx/db/database.json', JSON.stringify(db)) // Grava os dados
                    conn.sendMessage(group.id, { text: `hello there ${group.id}` }) //  Envia uma mensagem ao grupoSS

                    if (erroAdmin === true) {
                        // Mensagem para o novo grupo, caso houver erro de admin nos grupos antigos
                        conn.sendMessage(group.id, { text: `_Devido o *[bot]* não ser mais Administrador no grupo antigo, nosso game será continuado aqui!_` })
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
                let result = await checkAdmin(idgrupo)
                let resultado
                async function checkAdmin(idd) {
                    const groupMetadata = ((conn.chats[idd] || {}).metadata || await this.groupMetadata(idd).catch((_) => null))
                    for (let i = 0; i <= groupMetadata.participants.length; i++) {
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

            if (verificaposicao[0] === false) {
                // Colocando a posição do usuario como utilizadas
                dados.x = ax
                dados.y = ay
                db.planetas[planeta].colonias[colonia].posicaoOcupadas.push(dados)
                fs.writeFileSync('./src/glx/db/database.json', JSON.stringify(db))

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
                    result = false
                }

                if (data.perfil.id === db.planetas[planeta].colonias[colonia].posicaoOcupadas[i].id) {
                    isCadastrado = true
                }
            }
            console.log(result)
            return [result, isCadastrado]
        }
        // --------------------------- FIM DAS FUNÇÕES --------------------------------------------------------------------
        //-----------------------------------------------------------------------------------------------------------------




    } catch (err) {
        console.log(err)
    }
};
handler.command = /^(gameglx|glx)$/i;
export default handler;
