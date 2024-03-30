/*************************************************/
/*
/* Créditos al creador de este módulo.
/* Jefferson: https://github.com/jeffersonalionco
/* 
/*************************************************/

const handler = async (m, { args, usedPrefix, command, isAdmin}) => {
  try {  
    const idioma = global.db.data.users[m.sender].language || 'es';
    const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
    const tradutor = _translate.plugins._language
    let sigla 
    if (args[0] != undefined) sigla = args[0].toLowerCase()
    
    if (command === 'lang') {
      delete global.db.data.users[m.sender].language;
        if (sigla === 'pt-br' || sigla === 'pt' || sigla === 'br') {
            //global.imagen4 = global.imagen7
            global.db.data.users[m.sender].language = 'pt-br'
            m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*_—◉ Idioma definido em Português 🇧🇷_*`)
        } else if (sigla === 'es') {
            global.db.data.users[m.sender].language = 'es';
            m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*_—◉ Idioma definido a Español 🇪🇸_*`)
        } else {
            m.reply(`${tradutor.texto1[0]}\n*${usedPrefix}lang* es\n\n${tradutor.texto1[1]}`)
        }
        
    } else if (command === 'langgroup') {
        if (m.isGroup === false) {
            return m.reply(tradutor.texto3)
        }
        if (m.isGroup === true && isAdmin === false) {
            return m.reply(tradutor.texto4)
        }
       delete global.db.data.chats[m.chat].language;
        if (sigla === 'pt-br' || sigla === 'pt' || sigla === 'br') {
            global.db.data.chats[m.chat].language = 'pt-br';
            m.reply(`*[ ✅ ] Configuración del grupo*\n\n*_—◉ Idioma definido em Português 🇧🇷_*`)
        } else if (sigla === 'es') {
            global.db.data.chats[m.chat].language = 'es';
             m.reply(`*[ ✅ ] Configuración del grupo*\n\n*_—◉ Idioma definido a Español 🇪🇸_*`)
        } else {
            m.reply(`${tradutor.texto2[0]}\n*${usedPrefix}langgroup* es\n\n${tradutor.texto2[1]}`)
        }
    }
  } catch (error) {
      data.db.data.users[m.sender].language = 'es'
          global.db.data.chats[m.chat].language = 'es'
              m.reply(`*[ERROR]* -  _Por defecto el idioma estaba configurado en español._
              \`\`\`contacta a los creadores del bot\`\`\` `)
  }
}
handler.command = /^(lang|langgroup)$/i;
export default handler;
