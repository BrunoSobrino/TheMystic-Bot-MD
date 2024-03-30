/*************************************************/
/* Créditos al creador de este módulo.
/* Jefferson: https://github.com/jeffersonalionco
/* 
/*************************************************/

const handler = async (m, { args, usedPrefix, command, isAdmin }) => {
    try {
        const data = global
        const idioma = data.db.data.users[m.sender].language
        const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
        const tradutor = _translate.plugins._language


        data.db.data.users[m.sender].language
        let sigla // Args user

        //---- Transformar "cadena" en letras minúsculas
        if (args[0] != undefined) {
            sigla = args[0].toLowerCase()
        }

        if (command === 'lang') {

            // ----- Opciones de lenguaje
            if (sigla === 'pt-br' || sigla === 'pt' || sigla === 'br') {
                data.db.data.users[m.sender].language = 'pt-br'

                global.imagen4 = global.imagen7 // Imagen (MENU) - Para cambiar esta imagen, vaya a src/menu_pt.png
                m.reply(`*✅The Mistic - Bot*\n\n_Definido para_ *🇧🇷 Português*`)

            } else if (sigla === 'es') {
                data.db.data.users[m.sender].language = 'es' // Imagen(MENU) - Para cambiar esta imagen, vaya a (RAIZ) menu.png

                m.reply(`*✅The Mistic - Bot*\n\n_Definido para_ *🇪🇸 Español*`)

            } else {

                m.reply(`
${tradutor.texto1[0]}
*${usedPrefix}lang* es

${tradutor.texto1[1]}

`)
            }

        }

        // - DEFINIDO TRADUÇÕES PARA GRUPOS NO BOT THE MYSTIC 
        
        if (command === 'langgroup') {

            // ----- Condiciones para grupos
            if (m.isGroup === false) {
                return m.reply(tradutor.texto3)
            }
            if (m.isGroup === true && isAdmin === false) {
                return m.reply(tradutor.texto4)
            }

            // ----- Opciones de lenguaje
            if (sigla === 'pt-br' || sigla === 'pt' || sigla === 'br') {
                global.db.data.chats[m.chat].language = 'pt-br';

                m.reply(`*✅Este grupo foi:*\n_Definido para_ *🇧🇷 Português*`)
            } else if (sigla === 'es') {
                global.db.data.chats[m.chat].language = 'es';

                m.reply(`*✅Este grupo foi:*\n_Definido para_ *🇪🇸 Español*`)
            } else {
                m.reply(`
${tradutor.texto2[0]}
*${usedPrefix}langgroup* es

${tradutor.texto2[1]}

`)
            }

        }
        // Fim 
    } catch (error) {
        data.db.data.users[m.sender].language = 'es'
        global.db.data.chats[m.chat].language = 'es'

        m.reply(`*[ERROR]* -  _Por defecto el idioma estaba configurado en español._

        \`\`\`contacta a los creadores del bot\`\`\` `)
    }


}



handler.command = /^(lang||langgroup)$/i;

export default handler