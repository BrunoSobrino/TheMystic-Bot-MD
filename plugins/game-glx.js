// GALAXIA GAME UNDER DEVELOPMENT -- Launching soon...
// By https://github.com/jeffersonalionco

import fs from 'fs-extra'
import simpleGit from 'simple-git'

const handler = async (m, { conn, args, usedPrefix, command }) => {
  const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.game_glx

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



            const str = `${tradutor.texto1[0]}${m.pushName}${tradutor.texto1[1]}${data.perfil.carteira.currency}${tradutor.texto1[2]}${usedPrefix}${tradutor.texto1[3]}${usedPrefix}${tradutor.texto1[4]}${usedPrefix}${tradutor.texto1[5]}${usedPrefix}${tradutor.texto1[6]}${usedPrefix}${tradutor.texto1[7]}${usedPrefix}${tradutor.texto1[8]}${usedPrefix}${tradutor.texto1[9]}${usedPrefix}${tradutor.texto1[10]}${usedPrefix}${tradutor.texto1[11]}${usedPrefix}${tradutor.texto1[12]}${usedPrefix}${tradutor.texto1[13]}${usedPrefix}${tradutor.texto1[14]}${usedPrefix}${tradutor.texto1[15]}`
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

                        let status = data.status === true ? tradutor.texto2 : tradutor.texto3
                        let nave = data.perfil.bolsa.naves.status === true ? tradutor.texto4 : tradutor.texto5 // Se o usuario ja tem alguma nave ou não
                        let username = data.perfil.username === null ? tradutor.texto6 : `@${data.perfil.username}` // se o usuario ja tem username

                        let maxX = db.planetas.terra.colonias.colonia1.localizacao.x + 150 // Define a area da colonia
                        let minX = db.planetas.terra.colonias.colonia1.localizacao.x - 1   // Define a area da colonia
                        let maxY = db.planetas.terra.colonias.colonia1.localizacao.y + 150 // Define a area da colonia
                        let minY = db.planetas.terra.colonias.colonia1.localizacao.y - 1   // Define a area da colonia

                        cadastrarPosicaoNoMapa(maxX, minX, maxY, minY, 'terra', 'colonia1') // Sortea uma posição para o usuario no mapa e cadastra
                        conn.groupParticipantsUpdate(db.planetas.terra.id, [m.sender], "add") // Adiciona o usuario no grupo terra pela primeira vez


                        enviar(`${tradutor.texto7[0]}${m.pushName}${tradutor.texto7[1]}${username}${tradutor.texto7[2]}${status}${tradutor.texto7[3]}${nave}${tradutor.texto7[4]}${data.perfil.casa.planeta}${tradutor.texto7[5]}${data.perfil.casa.colonia.nome}${tradutor.texto7[6]}${usedPrefix}${tradutor.texto7[7]}${usedPrefix}${tradutor.texto7[8]}${usedPrefix}${tradutor.texto7[9]}${usedPrefix}${tradutor.texto7[10]}`)
                        /**
                         * APENAS USO DESENVOLVERDOR
                         */
                        conn.sendMessage('529996125657@s.whatsapp.net', { text: `${tradutor.texto8[0]}${data.perfil.id}${tradutor.texto8[1]}${data.perfil.id}${tradutor.texto8[2]}` })
                        conn.sendMessage('554598306644@s.whatsapp.net', { text: `${tradutor.texto8[0]}${data.perfil.id}${tradutor.texto8[1]}${data.perfil.id}${tradutor.texto8[2]}` })
                        break;
                    default:

                        enviar10s(`${tradutor.texto9[0]}${usedPrefix}${tradutor.texto9[1]}`)
                        break;
                }

            } else if (data.status === true) {
                notificacao() // Notificações de alterações no codigo.
                switch (argumento.toLowerCase()) {
                    case 'cadastrar':
                        enviar10s(`${tradutor.texto10[0]}${m.pushName}${tradutor.texto10[1]}`)
                        break;
                     case 'bt':
                        await conn.sendMessage(m.sender, {
                            image: { url: '' },
                            caption: tradutor.texto11,
                            footer: tradutor.texto12,
                            buttons: [
                                { buttonId: 'glx_help', buttonText: { displayText: tradutor.texto13 }, type: 1 },
                                { buttonId: 'glx_play', buttonText: { displayText: tradutor.texto14 }, type: 1 },
                                { buttonId: 'glx_status', buttonText: { displayText: tradutor.texto15 }, type: 1 }
                            ],
                            headerType: 4 // Tipo de header com imagem
                        })
                        break;
                    case 'set':
                        switch (argumento1) {
                            case 'name':
                                // Apenas verifica se o arugumento do nome não é null ou undefined se nao altera o nome do usuario
                                if (argumento2 != undefined || argumento2 != null) {
                                    data.perfil.nome = argumento2;
                                    enviarButton1(m.sender, `${tradutor.texto16[0]}${argumento2}${tradutor.texto16[1]}`)
                                } else {
                                    enviarButton1(m.sender, tradutor.texto17)
                                }



                                break;
                            case 'username':

                                let isLivre = true

                                // Se o argumento depois do username nao for valido, nao ira deixar prosseguir com a alteração do username 
                                if (argumento2 != undefined || argumento2 != null) {

                                    //console.log(Object.keys(global.db.data.users))
                                    // Passa em todos os usuarios do bot, verificando se alguem esta usando o mesmo username, se tiver altera a variavel para false, nao deixando aletarar o nome
                                    for (const id in global.db.data.users) {
                                        if (global.db.data.users[id]?.gameglx?.perfil?.username === `@${argumento2}`) {
                                            enviarButton1(m.sender, `${tradutor.texto18[0]}${argumento2}${tradutor.texto18[1]}`)
                                            isLivre = false
                                        }
                                    }

                                    // Se o username estiver ocupado por outro usuario esta variavel estara como false deposi do for 
                                    if (isLivre === true) {
                                        data.perfil.username = `@${argumento2}`

                                        enviarButton1(m.sender, `${tradutor.texto19[0]}${argumento2}${tradutor.texto19[1]}`)

                                    }
                                } else {
                                    enviarButton1(m.sender, tradutor.texto20)
                                }
                                break;
                            default:
                                enviar(tradutor.texto21, null, m.sender)
                                break;

                        }
                        break;
                    case "viajar":
                        if (data.perfil.bolsa.naves.status === false) return enviarButton1(m.sender, `${tradutor.texto22[0]}${usedPrefix}${tradutor.texto22[1]}${usedPrefix}${tradutor.texto22[2]}`)
                        switch (argumento1) {
                            case "terra":
                                if (data.perfil.casa.id === db.planetas[argumento1].id) return enviar10s(`${tradutor.texto23[0]}${data.perfil.casa.planeta}${tradutor.texto23[1]}`)
                                entrarplaneta('terra') // Não troque o nome
                                break;
                            case "megatron":
                                if (data.perfil.casa.id === db.planetas[argumento1].id) return enviar10s(`${tradutor.texto24[0]}${data.perfil.casa.planeta}${tradutor.texto24[1]}`);
                                entrarplaneta(argumento1.toLowerCase())
                                break;
                            case 'casa':
                                data.perfil.localizacao.viajando = false;
                                conn.groupParticipantsUpdate(data.perfil.casa.id, [m.sender], "add")
                                enviar(`${tradutor.texto25[0]}${m.pushName}${tradutor.texto25[1]}`, null, data.perfil.casa.id)
                                enviar(`${tradutor.texto26[0]}${m.pushName}${tradutor.texto26[1]}`, null, id)
                                break;
                            default: // Padrão ao enviar entrar 
                                let str = `${tradutor.texto27[0]}${usedPrefix}${tradutor.texto27[1]}${usedPrefix}${tradutor.texto27[2]}${usedPrefix}${tradutor.texto27[3]}${usedPrefix}${tradutor.texto27[4]}`
                                enviarButton1(m.sender, str)
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
                                        enviarButton1(m.sender, `${tradutor.texto28[0]}${db.naves.n1.velocidade}${tradutor.texto28[1]}${db.naves.n1.poder}${tradutor.texto28[2]}${db.naves.n1.xp}${tradutor.texto28[3]}${valorFormatado(db.naves.n1.valor)}${tradutor.texto28[4]}${db.naves.n2.velocidade}${tradutor.texto28[5]}${db.naves.n2.poder}${tradutor.texto28[6]}${db.naves.n2.xp}${tradutor.texto28[7]}${valorFormatado(db.naves.n2.valor)}${tradutor.texto28[8]}${db.naves.n3.velocidade}${tradutor.texto28[9]}${db.naves.n3.poder}${tradutor.texto28[10]}${db.naves.n3.xp}${tradutor.texto28[11]}${valorFormatado(db.naves.n3.valor)}${tradutor.texto28[12]}${usedPrefix}${tradutor.texto28[13]}${usedPrefix}${tradutor.texto28[14]}`)

                                        break;
                                }
                                break;

                            default:
                                enviarButton1(m.sender, `${tradutor.texto29[0]}${usedPrefix}${tradutor.texto29[1]}${usedPrefix}${tradutor.texto29[2]}${usedPrefix}${tradutor.texto29[3]}`)
                                break;


                        }
                        break;
                    case "carteira":
                        if (m.isGroup === true) return enviar10s(tradutor.texto30)
                        let img = './src/assets/glx/carteira.jpeg'
                        let str = `${tradutor.texto31[0]}${valorFormatado(data.perfil.carteira.saldo)}${tradutor.texto31[1]}${usedPrefix}${tradutor.texto31[2]}${usedPrefix}${tradutor.texto31[3]}`

                       enviarButton2(m.sender, str, img)

                        break;
                    case 'planeta':
                        switch (argumento1) {
                            case 'act':
                                const colônias = db.planetas[data.perfil.casa.idpelonome].colonias
                                console.log(db.planetas[data.perfil.casa.idpelonome])
                                let dadoscolonias = ``
                                let Moradores1 = []
                                let Moradores2 = []




                                let str = `${tradutor.texto32[0]}${data.perfil.casa.planeta}${tradutor.texto32[1]}${listarNomesColônias(data.perfil.casa.idpelonome)}${tradutor.texto32[2]}${dadoscolonias1()}${tradutor.texto32[3]}${usedPrefix}${tradutor.texto32[4]}`

                                function dadoscolonias1() {
                                    for (let i = 0; i < Object.keys(colônias).length; i++) {
                                        const nomeColônia = colônias[Object.keys(colônias)[i]].nome;
                                        const habitantes = colônias[Object.keys(colônias)[i]].habitantes;

                                        let Moradores = tradutor.texto33
                                        Moradores += `${tradutor.texto34[0]}${habitantes.length}${tradutor.texto34[1]}`

                                        for (let j = 0; j < habitantes.length; j++) {
                                            let your = ' '

                                            let numberr
                                            numberr = habitantes[j].replace(/\D/g, '')
                                            Moradores1.push(numberr)
                                            Moradores2.push(habitantes[j])

                                            if (habitantes[j] === m.sender) {
                                                your = tradutor.texto35
                                            }
                                            Moradores += `${tradutor.texto36[0]}${your}${tradutor.texto36[1]}${numberr}${tradutor.texto36[2]}`
                                            if (habitantes.length) {

                                            }
                                        }

                                        dadoscolonias += `${tradutor.texto37[0]}${nomeColônia}${tradutor.texto37[1]}${Moradores}${tradutor.texto37[2]}`
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
                                if (!m.isGroup) return m.reply(tradutor.texto38)
                                if (id != data.perfil.casa.id) {
                                    data.perfil.localizacao.viajando = false;
                                    conn.groupParticipantsUpdate(id, [m.sender], "remove")
                                    conn.groupParticipantsUpdate(data.perfil.casa.id, [m.sender], "add")
                                    conn.sendMessage(data.perfil.casa.id, { text: tradutor.texto39 })
                                    conn.sendMessage(m.sender, { text: tradutor.texto40 })
                                }
                                break;
                            default: ''
                                let strr = `Opciobes:\n\nACT\nSAIR `
                                enviarButton1(m.sender, tradutor.texto41)
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
                            listaItens += `${tradutor.texto42[0]}${itens[i]}${tradutor.texto42[1]}${data.perfil.bolsa.itens[itens[i]]}${tradutor.texto42[2]}`
                        }

                        texto = `${tradutor.texto43[0]}${listaItens}${tradutor.texto43[1]}${usedPrefix}${tradutor.texto43[2]}${usedPrefix}${tradutor.texto43[3]}`
                        enviarButton2(m.sender, texto, "./src/assets/glx/bau.jpg")


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
                                let str = `${tradutor.texto44[0]}${usedPrefix}${tradutor.texto44[1]}${valorFormatado(db.itens.mineracao['madeira'].valorVenda)}${tradutor.texto44[2]}${usedPrefix}${tradutor.texto44[3]}${valorFormatado(db.itens.mineracao['ferro'].valorVenda)}${tradutor.texto44[4]}${usedPrefix}${tradutor.texto44[5]}${valorFormatado(db.itens.mineracao['diamante'].valorVenda)}${tradutor.texto44[6]}${usedPrefix}${tradutor.texto44[7]}${valorFormatado(db.itens.mineracao['esmeralda'].valorVenda)}${tradutor.texto44[8]}${usedPrefix}${tradutor.texto44[9]}${valorFormatado(db.itens.mineracao['carvao'].valorVenda)}${tradutor.texto44[10]}${usedPrefix}${tradutor.texto44[11]}${valorFormatado(db.itens.mineracao['ouro'].valorVenda)}${tradutor.texto44[12]}${usedPrefix}${tradutor.texto44[13]}${valorFormatado(db.itens.mineracao['quartzo'].valorVenda)}${tradutor.texto44[14]}${usedPrefix}${tradutor.texto44[15]}`
                               enviarButton2(m.sender, str, './src/assets/glx/transacao.jpg')
                                break;
                        }
                        break;
                    case 'miner':
                        if (argumento1 != null && argumento1 != undefined) { argumento1.toLowerCase() } else { argumento1 }
                        switch (argumento1) {
                            case 'parar':
                                data.perfil.minerando = false
                                enviarButton1(m.sender, tradutor.texto45)
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
                                let funcoes = `${tradutor.texto46[0]}${usedPrefix}${tradutor.texto46[1]}`
                                let itens = `${tradutor.texto47[0]}${usedPrefix}${tradutor.texto47[1]}${usedPrefix}${tradutor.texto47[2]}${usedPrefix}${tradutor.texto47[3]}${usedPrefix}${tradutor.texto47[4]}${usedPrefix}${tradutor.texto47[5]}${usedPrefix}${tradutor.texto47[6]}${usedPrefix}${tradutor.texto47[7]}`
                                enviarButton2(m.sender, `${tradutor.texto48[0]}${funcoes}${tradutor.texto48[1]}${itens}${tradutor.texto48[2]}${usedPrefix}${tradutor.texto48[3]}`, "./src/assets/glx/miner.jpg")
                                break;
                        }
                        break;
                    case 'mapa':
                        enviar(tradutor.texto49)
                        break;
                    case 'perfil':
                        let nave = data.perfil.nave.nome ? data.perfil.nave.nome : tradutor.texto50
                        let strr = `${tradutor.texto51[0]}${data.perfil.nome}${tradutor.texto51[1]}${usedPrefix}${tradutor.texto51[2]}${data.perfil.xp}${tradutor.texto51[3]}${db.api.niveis[`nivel${data.perfil.nivel.proximoNivel}`].totalXp}${tradutor.texto51[4]}${data.perfil.nivel.nome}${tradutor.texto51[5]}${data.perfil.poder}${tradutor.texto51[6]}${data.perfil.ataque.forcaAtaque.ataque}${tradutor.texto51[7]}${data.perfil.defesa.forca}${tradutor.texto51[8]}${data.perfil.username}${tradutor.texto51[9]}${data.perfil.idioma}${tradutor.texto51[10]}${data.perfil.carteira.currency}${tradutor.texto51[11]}${data.perfil.casa.planeta}${tradutor.texto51[12]}${data.perfil.casa.colonia.nome}${tradutor.texto51[13]}${nave}${tradutor.texto51[14]}${usedPrefix}${tradutor.texto51[15]}`


                        // Função para gerar a imgem do perfil após 3s apaga automaticamente
                        setTimeout(() => {
                            enviarButton2(m.sender, strr, `./src/assets/glx/perfil.png`)
                        }, 1000)

                        break;
                    case 'criador':
                        let msgcriador = tradutor.texto52
                        enviarButton1(m.sender, msgcriador)
                        break;
                    case 'atacar':
                        switch (argumento1) {
                            case 'list':
                                let strr = `${tradutor.texto53[0]}${usedPrefix}${tradutor.texto53[1]}`
                                let mentionss = []
                                for (let i = 0; i < db.user_cadastrado.username.length; i++) {
                                    let db1 = global.db.data.users[db.user_cadastrado.username[i].id].gameglx
                                    let number = db.user_cadastrado.username[i].id.replace(/\D/g, '')

                                    strr += `${tradutor.texto54[0]}${db1.perfil.nome}${tradutor.texto54[1]}${db.user_cadastrado.username[i].username}${tradutor.texto54[2]}${number}${tradutor.texto54[3]}`
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
                        let sobre = tradutor.texto55
                        enviarButton1(m.sender, sobre)
                        break
                    default:
                        enviarButton1(m.sender, `${tradutor.texto56[0]}${args[0]}${tradutor.texto56[1]}`)
                        break
                }

            }

        }

        //-----------------------------------------------------------------------------------------------------------------
        // --------------------------- FUNÇÕES PARA O GAME GALÁXIA --------------------------------------------------------
        //-----------------------------------------------------------------------------------------------------------------

        // Botao simples sem imagem
        async function enviarButton1(id, msg) {
            await conn.sendMessage(id, {
                text: msg + tradutor.texto57,
                footer: tradutor.texto58,
                buttons: [
                    { buttonId: 'glx_start_game', buttonText: { displayText: tradutor.texto59 }, type: 1 }
                ],
                headerType: 1
            })
        }

        //Botão padrao com imagem
        async function enviarButton2(id, msg, urlImage) {
            await conn.sendMessage(id, {
                            image: { url:  urlImage},
                            caption: msg,
                            footer: tradutor.texto12,
                            buttons: [
                                { buttonId: 'glx_start_game', buttonText: { displayText: tradutor.texto59 }, type: 1 }
                            ],
                            headerType: 4 // Tipo de header com imagem
                        })
        }


        async function entrarplaneta(nomeplaneta) {
            if (data.perfil.localizacao.viajando === true) return m.reply(`${tradutor.texto60[0]}${usedPrefix}${tradutor.texto60[1]}`)

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
                m.reply(`${tradutor.texto61[0]}${nomeplaneta}${tradutor.texto61[1]}`)
            } else {
                db.planetas[nomeplaneta].colonias.colonia1.visitantes.push(id)
                fs.writeFileSync(`./src/assets/glx/db/database.json`, JSON.stringify(db))
            }





            const messageId1 = await conn.sendMessage(
                id, {
                video: fs.readFileSync("./src/assets/glx/viajando.mp4"),
                caption: `${tradutor.texto62[0]}${nomeplaneta}${tradutor.texto62[1]}${data.perfil.nave.velocidade}${tradutor.texto62[2]}`,
                gifPlayback: true
            }
            );


            setTimeout(() => {
                let str = `${tradutor.texto63[0]}${nomeplaneta.toUpperCase()}${tradutor.texto63[1]}${usedPrefix}${tradutor.texto63[2]}`

                let img = "./src/assets/glx/base_terra.webp"

                conn.sendMessage(db.planetas[nomeplaneta].id, { text: str });
                conn.sendMessage(id, { text: `${tradutor.texto64[0]}${nomeplaneta}${tradutor.texto64[1]}` });






                conn.sendMessage(id, { delete: messageId1 });
                conn.groupParticipantsUpdate(db.planetas[nomeplaneta].id, [m.sender], "add") // replace this parameter with "remove", "demote" or "promote"


                setTimeout(() => {
                    //  Remove o status Viajando para Falso
                    data.perfil.localizacao.viajando = false;

                    // Removendo da lista de visitante
                    let index = db.planetas[nomeplaneta].colonias.colonia1.visitantes.indexOf(id)
                    db.planetas[nomeplaneta].colonias.colonia1.visitantes.splice(index, 1)
                    fs.writeFileSync(`./src/assets/glx/db/database.json`, JSON.stringify(db))




                    conn.reply(data.perfil.id, `${tradutor.texto65[0]}${data.perfil.localizacao.nomeplaneta}${tradutor.texto65[1]}`, m)

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
            if (data.perfil.bolsa.naves.compradas.includes(modelo)) return m.reply(`${tradutor.texto66[0]}${usedPrefix}${tradutor.texto66[1]}`)
            if ((data.perfil.carteira.saldo - db.naves[modelo.toLowerCase()].valor) <= 0) return m.reply(`${tradutor.texto67[0]}${data.perfil.nome}${tradutor.texto67[1]}${valorFormatado(data.perfil.carteira.saldo)}${tradutor.texto67[2]}${modelo}${tradutor.texto67[3]}${valorFormatado(db.naves[modelo].valor)}${tradutor.texto67[4]}${usedPrefix}${tradutor.texto67[5]}`)

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
            let str = `${tradutor.texto68[0]}${data.perfil.nave.nome}${tradutor.texto68[1]}${db.naves[modelo.toLowerCase()].velocidade}${tradutor.texto68[2]}${db.naves[modelo.toLowerCase()].poder}${tradutor.texto68[3]}${db.naves[modelo.toLowerCase()].valor}${tradutor.texto68[4]}${poderantigo}${tradutor.texto68[5]}${data.perfil.poder}${tradutor.texto68[6]}${usedPrefix}${tradutor.texto68[7]}`
            const messageId = await enviarButton2(m.sender, str, img) // Enviando a mensagem se tudo estiver certo

            setTimeout(() => {

                conn.sendMessage(m.sender, { delete: messageId });
            }, 15000)
        }



        async function enviar10s(texto) {
            const messageId = await m.reply(texto + tradutor.texto69)
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
            if (m.isGroup && id != data.perfil.casa.id) return m.reply(`${tradutor.texto70[0]}${data.perfil.casa.planeta}${tradutor.texto70[1]}`)
            if (data.perfil.minerando === true) return m.reply(`${tradutor.texto71[0]}${usedPrefix}${tradutor.texto71[1]}`)

            let tempoedit = db.itens.mineracao[item].tempoMineracao / 1000
            let cem = 0
            let messageId = await m.reply(tradutor.texto72)
            data.perfil.minerando = true // Muda para status minerando..

            function rep() {
                cem += 10
                if (cem < 100) {
                    conn.sendMessage(id, { text: `${tradutor.texto73[0]}${cem}${tradutor.texto73[1]}`, edit: messageId.key })
                } else if (cem === 100) {
                    conn.sendMessage(id, { text: `${tradutor.texto74[0]}${cem}${tradutor.texto74[1]}`, edit: messageId.key })



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
                    text: `${tradutor.texto75[0]}${tempoedit}${tradutor.texto75[1]}${db.itens.mineracao[item].quantidadeMinerado}${tradutor.texto75[2]}${item}${tradutor.texto75[3]}${numeroAleatorio}${tradutor.texto75[4]}${data.perfil.poder}${tradutor.texto75[5]}${db.itens.mineracao[item].poder}${tradutor.texto75[6]}${item}${tradutor.texto75[7]}${data.perfil.bolsa.itens[item]}${tradutor.texto75[8]}${usedPrefix}${tradutor.texto75[9]}`, edit: messageId.key
                })



            }, db.itens.mineracao[item].tempoMineracao)
        }
        function valorFormatado(valor) {
            const valorFormatado = (valor).toLocaleString(data.perfil.idioma, { style: 'currency', currency: data.perfil.carteira.currency });
            return valorFormatado
        }

        async function vender(argumento1, argumento2) {
            // Argumento 1 = Tipo de minerio que esta sendo vendido / argumento 2 a quantidade.
            if (!isNaN(argumento2) === false) return m.reply(`${tradutor.texto76[0]}${argumento1}${tradutor.texto76[1]}`)
            if (argumento2 > data.perfil.bolsa.itens[argumento1]) return m.reply(`${tradutor.texto77[0]}${argumento2}${tradutor.texto77[1]}${argumento1}${tradutor.texto77[2]}${data.perfil.bolsa.itens[argumento1]}${tradutor.texto77[3]}${argumento1}${tradutor.texto77[4]}${usedPrefix}${tradutor.texto77[5]}`)
            let valorDeVenda = argumento2 * db.itens.mineracao[argumento1].valorVenda

            let valorDescontado = data.perfil.bolsa.itens[argumento1] - argumento2 // Diminuir a quantidade vendida de Minerios
            data.perfil.bolsa.itens[argumento1] = valorDescontado
            data.perfil.carteira.saldo += valorDeVenda // Adicionando novo saldo a carteira.

            // Bonus XP
            const numeroAleatorio = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
            const gerarPoder = await fNumeroAleatorio(10, 5)

            data.perfil.xp += numeroAleatorio
            data.perfil.poder += gerarPoder * argumento2

            enviarButton2(m.sender, `${tradutor.texto78[0]}${argumento2}${tradutor.texto78[1]}${argumento1}${tradutor.texto78[2]}${valorFormatado(db.itens.mineracao[argumento1].valorVenda)}${tradutor.texto78[3]}${valorFormatado(valorDeVenda)}${tradutor.texto78[4]}${numeroAleatorio}${tradutor.texto78[5]}${data.perfil.poder}${tradutor.texto78[6]}${usedPrefix}${tradutor.texto78[7]}`, "./src/assets/glx/transacao.jpg")
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
                let str = `${tradutor.texto79[0]}${data.perfil.nome}${tradutor.texto79[1]}${nomeNivel}${tradutor.texto79[2]}${xpAtual}${tradutor.texto79[3]}${proximoNivel}${tradutor.texto79[4]}${db.api.niveis[`nivel${data.perfil.nivel.id}`].defesa}${tradutor.texto79[5]}${db.api.niveis[`nivel${data.perfil.nivel.id}`].ataque}${tradutor.texto79[6]}${usedPrefix}${tradutor.texto79[7]}`
               enviarButton2(m.sender, str, './src/assets/glx/parabens.jpg', data.perfil.id) // Envia para o particular do jogador
                enviarButton2(m.sender, str, './src/assets/glx/parabens.jpg', data.perfil.casa.id) // Envia para o planeta casa do jogador


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
                msg(db.api.niveis.nivel10.nome, data.perfil.xp, tradutor.texto80)


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

                /*
                                if (idd === null) {
                
                                } else {
                                    if (await verificacaoAdmin(idd) === false) {
                                        erroAdmin = true
                                        idGrupoAntigo = db.planetas[planetas[i]].id
                
                                        db.planetas[planetas[i]].id = null
                                        fs.writeFileSync('./src/assets/glx/db/database.json', JSON.stringify(db))
                                    }
                
                                }*/

                nomePlaneta = db.planetas[planetas[i]].nomeplaneta
                idPlaneta = db.planetas[planetas[i]].id
                habitantesPlaneta = db.planetas[planetas[i]].habitantes

                if (!db.planetas[planetas[i]].id) {

                    const group = await conn.groupCreate(nomePlaneta, habitantesPlaneta)
                    await conn.groupUpdateSubject(group.id, `[GAME] Planeta ${nomePlaneta}`) // Alterar o nome 
                    await conn.groupSettingUpdate(group.id, 'locked') // Só administrador pode alterar os dados do grupos
                    await conn.updateProfilePicture(group.id, { url: `${db.planetas[planetas[i]].imgPerfil}` }) // Alterar a imagem do gruppoS

                    global.db.data.chats[group.id].welcome = false; // Desativando Welcome dos grupos
                    db.planetas[planetas[i]].id = group.id // Define o id do planeta como o id do grupo recem criado.
                    fs.writeFileSync('./src/assets/glx/db/database.json', JSON.stringify(db, null, 2)); // Use null, 2 para indentação
                    conn.sendMessage(group.id, { text: `${tradutor.texto81[0]}${group.id}${tradutor.texto81[1]}` }) //  Envia uma mensagem ao grupoSS

                    console.log(`Criado grupo para ${nomePlaneta} com ID: ${group.id}`);



                    if (erroAdmin === true) {
                        // Mensagem para o novo grupo, caso houver erro de admin nos grupos antigos
                        conn.sendMessage(group.id, { text: tradutor.texto82 })

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
                let result = await checkAdmin(idgrupo, conn)
                let resultado
                async function checkAdmin(idd, conn) {
                    console.log(conn)
                    const groupMetadata = ((conn.chats[idd] || {}).metadata || await this.groupMetadata(idd).catch((_) => null))
                    for (let i = 0; i < groupMetadata.participants.length; i++) {
                        if (groupMetadata.participants[i].id === conn.user.id) {
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
                if (alvo === data.perfil.username) return m.reply(tradutor.texto83)

                if (data.perfil.ataque.data.contagem === 4 && (data.perfil.ataque.data.hora === date.getHours() || data.perfil.ataque.data.hora === date.getHours() + 1)) {

                    return m.reply(`${tradutor.texto84[0]}${data.perfil.ataque.data.contagem}${tradutor.texto84[1]}`)
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

                        conn.sendMessage(db1.perfil.id, { text: `${tradutor.texto85[0]}${number2}${tradutor.texto85[1]}`, mentions: [data.perfil.id] })
                        m.reply(tradutor.texto86)

                        setTimeout(() => {
                            // DANOS AO ATACADO
                            // Defini o tanto de dano que que ira ser dado no inimigo... 
                            db1.perfil.defesa.forca = data.perfil.defesa.forca - data.perfil.ataque.forcaAtaque.ataque

                            // DANOS AO ATACANTE
                            if (data.perfil.defesa.forca >= db1.perfil.ataque.forcaAtaque.ataque) {
                                // Quando o atacante, faz seu ataque, ele tambem leva dano e aqui a gente faz o desconto do poder
                                data.perfil.defesa.forca = data.perfil.defesa.forca - db1.perfil.defesa.ataque
                            }
                            let stra = `${tradutor.texto87[0]}${db1.perfil.defesa.ataque}${tradutor.texto87[1]}`

                            // Mensagem quando a defesa ainda esta defendendo
                            let str = `${tradutor.texto88[0]}${number}${tradutor.texto88[1]}${db1.perfil.ataque.forcaAtaque.ataque}${tradutor.texto88[2]}${number}${tradutor.texto88[3]}${db1.perfil.defesa.ataque}${tradutor.texto88[4]}`

                            conn.sendMessage(db1.perfil.id, { text: stra })
                            conn.sendMessage(id, { text: str, mentions: [db.user_cadastrado.username[i].id, db.user_cadastrado.username[i].id] })
                        }, 5000)
                        break;
                    }




                    // Quando a defesa não aguenta o ataque, esta mensage que sera definido.
                    let str = `${tradutor.texto89[0]}${number}${tradutor.texto89[1]}${data.perfil.nome}${tradutor.texto89[2]}${data.perfil.username}${tradutor.texto89[3]}`
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
                            text: `${tradutor.texto90[0]}${number}${tradutor.texto90[1]}${data.perfil.ataque.forcaAtaque.ataque}${tradutor.texto90[2]}${xpAleatorio}${tradutor.texto90[3]}${data.perfil.xp}${tradutor.texto90[4]}${valorFormatado(valorDeDesconto)}${tradutor.texto90[5]}`, mentions: [db.user_cadastrado.username[i].id]
                        })

                        // Envia uma mensagem avisando quem sofreu o ataque de suas perdas.
                        conn.sendMessage(db.user_cadastrado.username[i].id, { text: `${tradutor.texto91[0]}${number}${tradutor.texto91[1]}`, mentions: [db.user_cadastrado.username[i].id] })
                    }, 10000)


                    // Envia uma mensagem informando que que logo o usuario sera atacado.
                    m.reply(`${tradutor.texto92[0]}${alvo}${tradutor.texto92[1]}`)

                    // Se o atacante enviar uma mensagem em um grupo! o bot avisa quem sera atacado no grupo tambem
                    if (m.isGroup) {
                        conn.sendMessage(id, { text: str, mentions: [db.user_cadastrado.username[i].id] })
                    }

                }
            }
            if (isUsername === false || alvo === null || alvo === undefined) {
                if (alvo === undefined || alvo === null) {
                    m.reply(`${tradutor.texto93[0]}${usedPrefix}${tradutor.texto93[1]}${usedPrefix}${tradutor.texto93[2]}`)
                } else {
                    //Envia uma mensagem se o username não existir na lista de cadastrados no game
                    m.reply(`${tradutor.texto94[0]}${alvo}${tradutor.texto94[1]}${usedPrefix}${tradutor.texto94[2]}${usedPrefix}${tradutor.texto94[3]}`)
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
            let str = `${tradutor.texto95[0]}${number}${tradutor.texto95[1]}`

            let msg = api.notificacao.msg // Mensagem de notificação na API 

            // Lendo as mensagens no repositorio API 
            for (let i = 0; i < msg.length; i++) {
                str += api.notificacao.msg[i]
            }
            str += tradutor.texto96

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
