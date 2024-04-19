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

👨‍🚀 *Olá ${data.perfil.nome}*


  *🌠 ${usedPrefix}glx _cadastrar_*
  _Para se cadastrar no GLX_

  *🌠 ${usedPrefix}glx _entrar terra_*
  _Entrar no Planeta Terra_

  *🌠 ${usedPrefix}glx _carteira_*
  _Acesso sua carteira financeira._

  

*╘═══════════════════╛*
  🌞🌕🌠🌟⭐🌎🪐
`
            let glx_menu = fs.readFileSync('./src/glx_menu.jpg')
            const selo1234 = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
            conn.sendMessage(m.chat, { image: glx_menu, caption: str.trim() }, { quoted: selo1234 });

        } else {

            if (data.status === false) {
                switch (argumento.toLowerCase()) {
                    case "cadastrar":
                        data.perfil.nome = m.pushName // Salva o nome padrão do whatsapp no game
                        data.perfil.id = m.sender // salva o id do whatsapp do gamer
                        data.status = true; // Ativa o cadastro dos jogadores

                        let status = data.status === true ? 'Ativo' : 'Desativado'
                        let nave = data.perfil.nave.status === true ? 'Sim' : 'Não'

                        m.reply(`*_⚔️ Novo(a) Militar Alistado(a)_*\n\n*🧑Nome*: ${m.pushName} \n*⏹️Status*: ${status} \n*🚀Tem Nave*: ${nave}`)
                        break;
                    default:
                        enviar10s(`_Você precisa se alistar no comando_ \n\n Use *${usedPrefix}glx cadastrar* - Para se cadastrar.`)
                        break;
                }

            } else if (data.status === true) {
                switch (argumento.toLowerCase()) {
                    case "entrar":
                        if (data.perfil.localizacao.status === true) return enviar10s(`_Você já esta no planeta *${data.perfil.localizacao.nomeplaneta}* _`)
                        if (data.perfil.nave.status === false) return enviar10s(`*( ❌ ) Você não tem nave* \n\n Utilize *${usedPrefix}glx comprar nave n1* - Para comprar sua primeira nave\n\n_Para ver toda a 🏪loja utilize_ *${usedPrefix}glx comprar*`)
                        if (argumento1 === null || argumento1 === undefined) return enviar()

                        switch (argumento1.toLowerCase()) {
                            case "terra":
                                entrarplaneta('terra') // Não troque o nome
                                break;
                            case (argumento1 === null || argumento1 === undefined) :
                                
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
 💸Valor da nave: *${db.naves.n1.valor}*


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
*🏧Saldo:* ${data.perfil.carteira.saldo}


                        `

                        enviar(str, img)

                        break;
                    case "teste":
                        let i = 1
                        const messageId =  await m.reply(`Teste`)
                        
                        setInterval(() => {
                            const agora = new Date();
                            const horaAtual = agora.getHours();
                            const minutosAtuais = agora.getMinutes();
                            const segundosAtuais = agora.getSeconds();
                           
                            conn.sendMessage(id, {
                                text: horaAtual + ':' + minutosAtuais + ':' + segundosAtuais,
                                edit: messageId,
                              })

                            
                        }, 1000)
                    
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

            // Todos os Times
            let temponacidade = 10000
            let tempodeviagem = data.perfil.nave.velocidade * 1000

            // Alterando a Localização do usuario
            data.perfil.localizacao.status = true;
            data.perfil.localizacao.nomeplaneta = db.planetas[nomeplaneta].nomeplaneta;
            data.perfil.localizacao.id = db.planetas[nomeplaneta].id;
            data.perfil.localizacao.idpelonome = db.planetas[nomeplaneta].idpelonome;



            

            const messageId1 = await conn.sendMessage(
                id, {
                video: fs.readFileSync("./src/glx/viajando.mp4"),
                caption: `Viajando para a Terra!! Aguarde *${tempodeviagem}* segundos`,
                gifPlayback: true
            }
            );


            setTimeout(() => {
                let str = `*🌎 BEM VINDO(A) TERRA 🌎*\n\n_Você foi adicionado, ao grupo do planeta_ \n\n \`\`\`Se estiver no privado saia e va para o planeta terra\`\`\` `
                let img = "./src/glx/base_terra.webp"

                enviar(str, img) // envia mensagem

                conn.sendMessage(id, { delete: messageId1 });
                conn.groupParticipantsUpdate(db.planetas[nomeplaneta].id, [m.sender], "add") // replace this parameter with "remove", "demote" or "promote"


                setTimeout(() => {

                    conn.reply(data.perfil.id, `*_O tempo de sua nave no planeta ${data.perfil.localizacao.nomeplaneta} acabou agora sua nave voltou para o espaço!_*`, m)
                    data.perfil.localizacao.status = false;
                    data.perfil.localizacao.nomeplaneta = 'Espaço';
                    data.perfil.localizacao.id = 'glx';
                    data.perfil.localizacao.idpelonome = 'galaxia';
                    setTimeout(() => {
                        conn.groupParticipantsUpdate(db.planetas[nomeplaneta].id, [m.sender], "remove")
                    }, 3000);
                }, temponacidade)// tempo que a nave vai ficar na cidade


            }, tempodeviagem) // Tempo de viagem conforme a nave do jogador


        }


        async function comprarnave(modelo) {
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





        async function enviar(texto, img) {

            if (img === null || img === undefined) { img = './src/glx/img_padrao.png' }

            let glx_menu = fs.readFileSync(img)
            const selo = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
            const messageId = await conn.sendMessage(id, { image: glx_menu, caption: texto.trim() }, { quoted: selo })
            return messageId

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
