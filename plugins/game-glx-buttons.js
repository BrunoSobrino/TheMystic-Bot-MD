export async function before(m, { conn }) {
    const usedPrefix = '.'
    const msg = m.msg?.contextInfo?.quotedMessage?.buttonsMessage?.buttons[0].buttonId

    const selectedId = m?.msg?.selectedButtonId



    let data = global.db.data.users[m.sender].gameglx



    switch (selectedId) {
        case 'glx_start_game':
            await conn.sendMessage(m.sender, {
                text: `🛠️ *Estamos trabalhando para melhorar o jogo GLX!*

Agradecemos sua paciência e apoio. 🚀


*╔═ 🪐JUEGO DE GALAXIA🪐 ═╗*

 👨‍🚀 Hola *${m.pushName}*, Es la hora de viajar por el espacio, mina asteroides, conversa con alienígenas y mucho más en el mundo galáctico!

  *💰 Moneda:* ${data.perfil.carteira.currency}


  *🌠 ${usedPrefix}glx _cadastrar_*
  _Para registrarse en la GLX_
  
  *🌠 ${usedPrefix}glx _perfil_*
  _Mira la evolución de tu perfil._

  *🌠 ${usedPrefix}glx _vender_*
  _vende tus objetos del cofre._

  


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
`,
                footer: 'Game GLX',
                buttons: [
                    { buttonId: 'glx_start_game', buttonText: { displayText: '🔍 Inicio' }, type: 1 }
                ],
                headerType: 1
            })
            break
    }


}
