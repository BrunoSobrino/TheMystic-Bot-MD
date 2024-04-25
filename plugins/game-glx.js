// GALAXIA GAME UNDER DEVELOPMENT -- Launching soon...
// By https://github.com/jeffersonalionco

import fs from 'fs-extra'



const handler = async (m, { conn, args, usedPrefix, command }) => {

    let id
    if (m.chat) {
        id = m.chat
    } else {
        id = m.sender
    }

    let argumento = args[0]
    let argumento1 = args[1]
    let argumento2 = args[2]


    try {
        let data = global.db.data.users[m.sender].gameglx
        let db = JSON.parse(fs.readFileSync(`./src/glx/db/database.json`))






        if (args[0] === null || args[0] === undefined) {

            const str = `*╔═ 🪐GAME DA GALAXIA🪐 ═╗*

👨‍🚀 *Olá ${m.pushName}*

*Idioma:* ${data.perfil.idioma} 
*Moeda:* ${data.perfil.carteira.currency}


  *🌠 ${usedPrefix}glx _cadastrar_*
  _Para se cadastrar no GLX_

  *🌠 ${usedPrefix}glx _viajar terra_*
  _Entrar no Planeta Terra_

  *🌠 ${usedPrefix}glx _carteira_*
  _Acesso sua carteira financeira._

  *🌠 ${usedPrefix}glx _bau_*
  _Veja seus itens guardados_


 *[ ⛏️ ] Opções de Mineração:*

 *- ${usedPrefix}glx miner parar*
_Usado para, parar de minerar_

 *🌳${usedPrefix}glx miner madeira*
 *🔩${usedPrefix}glx miner ferro*
 *💎${usedPrefix}glx miner diamante*
 *🟢${usedPrefix}glx miner esmeralda*
 *⚫${usedPrefix}glx miner carvao*
 *🟡${usedPrefix}glx miner ouro*
 *⚪${usedPrefix}glx miner quartzo*
  

*╘═══════════════════╛*
  🌞🌕🌠🌟⭐🌎🪐
`
            let glx_menu = fs.readFileSync('./src/glx_menu.jpg')
            const selo1234 = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
            const idmessage = await conn.sendMessage(m.chat, { image: glx_menu, caption: str.trim() }, { quoted: selo1234 });
            const reactionMessage = { react: { text: "👨‍🚀", key: idmessage.key } }


            await conn.sendMessage(m.chat, reactionMessage)


        } else {

            if (data.status === false) {
                switch (argumento.toLowerCase()) {
                    case "cadastrar":
                        data.perfil.nome = m.pushName // Salva o nome padrão do whatsapp no game
                        data.perfil.id = m.sender // salva o id do whatsapp do gamer
                        data.status = true; // Ativa o cadastro dos jogadores

                        // Defindo a casa como padrão
                        data.perfil.casa.id = db.planetas.terra.id // Id Planeta Padrão para novos Jogadores
                        data.perfil.casa.planeta = db.planetas.terra.nomeplaneta // Nome Planeta Padrão para novos Jogadores
                        data.perfil.casa.colonia.nome = db.planetas.terra.colonias.capital.nome // Colonia Padrão para novos Jogadores

                        // Alterando a Localização do usuario
                        data.perfil.localizacao.status = true;
                        data.perfil.localizacao.nomeplaneta = db.planetas.terra.nomeplaneta;
                        data.perfil.localizacao.id = db.planetas.terra.id;
                        data.perfil.localizacao.idpelonome = db.planetas.terra.idpelonome;



                        if (!db.user_cadastrado.lista.includes(m.sender)) {
                            db.planetas.terra.colonias.capital.habitantes.push(m.sender)
                            db.user_cadastrado.lista.push(m.sender)

                            fs.writeFileSync(`./src/glx/db/database.json`, JSON.stringify(db))
                        }

                        let status = data.status === true ? 'Ativo' : 'Desativado'
                        let nave = data.perfil.nave.status === true ? 'Sim' : 'Não'
                        let username = data.perfil.username === null ? 'Sem username' : `@${data.perfil.username}`

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
                        if (data.perfil.nave.status === false) return enviar10s(`*( ❌ ) Você não tem nave* \n\n Utilize *${usedPrefix}glx comprar nave n1* - Para comprar sua primeira nave\n\n_Para ver toda a 🏪loja utilize_ *${usedPrefix}glx comprar*`)
                        if (argumento1 === null || argumento1 === undefined) return enviar10s(`_Aonde deseja ir ?_ *${m.pushName}*`)

                        switch (argumento1.toLowerCase()) {
                            case "terra":
                                if (data.perfil.casa.id === db.planetas[argumento1].id) return enviar10s(`*${data.perfil.localizacao.nomeplaneta}* _Este planeta é sua casa, e você ja esta nele_`)
                                entrarplaneta('terra') // Não troque o nome
                                break;
                            case "megatron":
                                if (data.perfil.casa.id === db.planetas[argumento1].id) return enviar10s(`*${data.perfil.localizacao.nomeplaneta}* _Este planeta é sua casa, e você ja esta nele_`)
                                entrarplaneta(argumento1.toLowerCase())
                                break;
                            case 'casa':
                                conn.groupParticipantsUpdate(data.perfil.casa.id, [m.sender], "add")
                                enviar(`Oi de volta ${m.pushName}`, null, data.perfil.casa.id)
                                break;
                            default: // Padrão ao enviar entrar 
                                enviar10s(`*〈 ${argumento1.toLowerCase()} 〉*  _Não esta no mapa!_`)
                                break;

                        }
                        break;
                    case 'comprar':
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
 💸Valor da nave: *${valorFormatado(db.naves.n1.valor)}*


 *➥ n2* - NAVE N2
 


 Exemplo de uso: *${usedPrefix}glx comprar nave n1*`)

                                        break;
                                }
                                break;

                            default:
                                m.reply(`*--- 🏪 LOJA DA GALÁXIA ---*\n\n_Categorias:_\n ↳ nave\n ↳ carro \n\nEx: *${usedPrefix}glx comprar nave*`)
                                break;


                        }
                        break;
                    case "carteira":
                        if (m.isGroup === true) return enviar10s(`Este comando só pode ser usado no Privado`)
                        let img = './src/glx/carteira.jpeg'
                        let str = `*-- 💴 CARTEIRA FINANCEIRA --* 
                        
_ℹ️ Suas Informações:_
*🏧Saldo:* ${valorFormatado(data.perfil.carteira.saldo)}


                        `

                        enviar(str, img)

                        break;
                    case 'planeta':
                        switch (argumento1) {
                            case 'act':
                                const colônias = db.planetas[data.perfil.casa.planeta.toLowerCase()].colonias
                                let dadoscolonias
                                let Moradores1 = []
                                let Moradores2 = []




                                let str = `*Dados do planeta ${data.perfil.casa.planeta}*

*🏠Colonias em crescimento:*
${listarNomesColônias(db.planetas[data.perfil.casa.planeta.toLowerCase()])}

${dadoscolonias1()}

`

                                function dadoscolonias1() {
                                    for (let i = 0; i < Object.keys(colônias).length; i++) {
                                        const nomeColônia = colônias[Object.keys(colônias)[i]].nome;
                                        const habitantes = colônias[Object.keys(colônias)[i]].habitantes;

                                        let Moradores = ' '

                                        for (let j = 0; j < habitantes.length; j++) {
                                            let your = ' '

                                            let numberr
                                            numberr = habitantes[j].replace(/\D/g, '')
                                            Moradores1.push(numberr)
                                            Moradores2.push(habitantes[j])

                                            if (habitantes[j] === m.sender) {
                                                your = ` *Você* `
                                            }
                                            Moradores += `\n➣ ${your}@${numberr}`
                                        }

                                        dadoscolonias += `\n *${nomeColônia}*
*- Moradores:*
${Moradores}
    
`
                                    }
                                    return dadoscolonias
                                }
                                function listarNomesColônias(planeta) {
                                    const colônias = planeta.colonias;
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
                            default:
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
                    case 'miner':
                        switch (argumento1.toLowerCase()) {
                            case 'parar':
                                data.perfil.minerando = false
                                m.reply(`*Mineração encerrada*`)
                                break
                            case 'madeira':
                                minerar(argumento1.toLowerCase())
                                break
                            case 'ferro':
                                minerar(argumento1.toLowerCase())
                                break
                            case 'diamante':
                                minerar(argumento1.toLowerCase())
                                break
                            case 'esmeralda':
                                minerar(argumento1.toLowerCase())
                                break
                            case 'carvao':
                                minerar(argumento1.toLowerCase())
                                break
                            case 'ouro':
                                minerar(argumento1.toLowerCase())
                                break
                            case 'quartzo':
                                minerar(argumento1.toLowerCase())
                                break
                        }
                        break;
                    case "teste":
                        console.log(`----------------------------------------------` + m.chat)
                        let message = await conn.sendMessage(id, { text: 'testw' })
                        // send a list message!

                        sendMsg

                        function listarNomesColônias(planeta) {
                            const colônias = planeta.colonias;
                            const nomesColônias = Object.keys(colônias).map(nome => colônias[nome].nome);

                            console.log("-------------------- " + Object.keys(colônias)[1])
                            return nomesColônias.join("\n");
                        }

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
                db.planetas[nomeplaneta].colonias.capital.visitantes.push(id)
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






                conn.sendMessage(id, { delete: messageId1 });
                conn.groupParticipantsUpdate(db.planetas[nomeplaneta].id, [m.sender], "add") // replace this parameter with "remove", "demote" or "promote"
                data.perfil.localizacao.viajando = true;

                setTimeout(() => {

                    // Removendo da lista de visitante
                    let index = db.planetas[nomeplaneta].colonias.capital.visitantes.indexOf(id)
                    db.planetas[nomeplaneta].colonias.capital.visitantes.splice(index, 1)
                    fs.writeFileSync(`./src/glx/db/database.json`, JSON.stringify(db))




                    conn.reply(data.perfil.id, `*_O tempo de sua nave no planeta ${data.perfil.localizacao.nomeplaneta} acabou agora sua nave voltou para o espaço!_*`, m)

                    data.perfil.localizacao.status = false;
                    data.perfil.localizacao.nomeplaneta = data.perfil.casa.planeta;
                    data.perfil.localizacao.id = data.perfil.casa.id;
                    data.perfil.localizacao.idpelonome = data.perfil.casa.planeta;
                    setTimeout(() => {

                        conn.groupParticipantsUpdate(db.planetas[nomeplaneta].id, [m.sender], "remove")
                        data.perfil.localizacao.viajando = false;


                    }, 3000);
                }, temponacidade)// tempo que a nave vai ficar na cidade


            }, tempodeviagem) // Tempo de viagem conforme a nave do jogador


        }


        async function comprarnave(modelo) {
            // Conferir se o saldo da para comprar a nave escolhida
            if ((data.perfil.carteira.saldo - db.naves[modelo.toLowerCase()].valor) <= 0) return m.reply(`_😪 ${data.perfil.nome}! Você não tem saldo._ \n\n*Seu Saldo:* ${valorFormatado(data.perfil.carteira.saldo)}\n*Valor da nave ${modelo}:* ${valorFormatado(db.naves[modelo].valor)}\n\nVenda seus minerios para ganhar dinheiro. Use Ex: *${usedPrefix}glx vender ouro 2*`)


            let saldo = data.perfil.carteira.saldo - db.naves[modelo.toLowerCase()].valor // Descontando o valor da nave
            data.perfil.carteira.saldo = saldo

            data.perfil.nave.status = true
            data.perfil.nave.id = db.naves[modelo.toLowerCase()].id
            data.perfil.nave.nome = db.naves[modelo.toLowerCase()].nome
            data.perfil.nave.velocidade = db.naves[modelo.toLowerCase()].velocidade
            data.perfil.nave.poder = db.naves[modelo.toLowerCase()].poder
            data.perfil.nave.valor = db.naves[modelo.toLowerCase()].valor



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
            if (m.isGroup && id != data.perfil.casa.id) return m.reply(`\n> [ ! ] ERRO - AVISO \n\n_Você só pode Minerar no planeta_ *(${data.perfil.casa.planeta}0* ! Aqui é *9${data.perfil.localizacao.nomeplaneta})*`)
            if (data.perfil.minerando === true) return m.reply(`_Você ja esta minerando! Se deseja parar use *${usedPrefix}glx miner parar*_`)
            let tempoedit = db.itens.mineracao[item].tempoMineracao / 1000
            let cem = 0
            let messageId = await m.reply(`*Minerando..[0%]*`)
            data.perfil.minerando = true // Muda para status minerando..

            function rep() {
                cem += 10
                if(cem < 100){
                conn.sendMessage(id, { text: `*Minerando..[${cem}%]*`, edit: messageId.key })
                } else if (cem === 100) {
                    conn.sendMessage(id, { text: `*Processando... [${cem}%] Aguarde* `, edit: messageId.key })



                }
            }
            let carregando = setInterval(rep, 1000)

            setTimeout(() => {
                clearInterval(carregando)
                data.perfil.bolsa.itens[item] += 2 // adiciona os itens minerados
                data.perfil.minerando = false // Desativa status minerando..
                conn.sendMessage(id, { text: `*Mineração Concluida [${tempoedit} Segundos]* \n\nVocê minerou 2 ${item}`, edit: messageId.key })



            }, db.itens.mineracao[item].tempoMineracao)
        }
        function valorFormatado(valor) {
            const valorFormatado = (valor).toLocaleString(data.perfil.idioma, { style: 'currency', currency: data.perfil.carteira.currency });
            return valorFormatado
        }
        //-----------------------------------------------------------------------------------------------------------------
        // --------------------------- FIM DAS FUNÇÕES --------------------------------------------------------------------
        //-----------------------------------------------------------------------------------------------------------------




    } catch (err) {
        console.log(err)
    }
};
handler.command = /^(gameglx|glx)$/i;
export default handler;
