/*************************************************/
/*
/* Créditos al creador de este módulo.
/* Jefferson: https://github.com/jeffersonalionco
/* 
/*************************************************/

const handler = async (m, { args, usedPrefix, command, isAdmin }) => {
try {
 const data = global
 const idioma = data.db.data.users[m.sender].language
 const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
 const tradutor = _translate.plugins._language

 data.db.data.users[m.sender].language
 let sigla // Args user

 //---- Transformar "cadena" en letras minúsculas
 if (args[0] != undefined) {
    sigla = args[0].toLowerCase()
}

 if (command === 'lang') {
 // ----- Opciones de lenguaje
 if (sigla === 'es') {
 global.db.data.users[m.sender].language = 'es'
 m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*—◉* *_Idioma definido a Español 🇪🇸_*`)
 } else if (sigla === 'en') {
 global.db.data.users[m.sender].language = 'en'
 m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*—◉* *_Idioma definido a Inglês 🇬🇧_*`)
 } else if (sigla === 'pt-br') {
 global.db.data.users[m.sender].language = 'pt-br'
 m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*—◉* *_Idioma definido a Português 🇧🇷_*`)
 } else if (sigla === 'ru') {
 global.db.data.users[m.sender].language = 'ru'
 m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*—◉* *_Язык изменён на русский 🇷🇺_*`)
 } else if (sigla === 'fr') {
 global.db.data.users[m.sender].language = 'fr'
 m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*—◉* *_Langue définie sur Français 🇫🇷_*`)
 } else if (sigla === 'ar') {
 global.db.data.users[m.sender].language = 'ar'
 m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*—◉* *_تم تعيين اللغة إلى العربية 🇸🇦_*`)
 } else {
 m.reply(`${tradutor.texto1[2]}\n${tradutor.texto1[3]} *( ${data.db.data.users[m.sender].language} )*\n${tradutor.texto1[0]}\n*${usedPrefix}lang* es\n\n${tradutor.texto1[1]}`)
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
 if (sigla === 'es') {
 global.db.data.chats[m.chat].language = 'es';
 m.reply(`*[ ✅ ] Configuración del grupo*\n\n*—◉* *_Idioma definido a Español 🇪🇸_*`)
 } else if (sigla === 'en') {
 global.db.data.chats[m.chat].language = 'en';
 m.reply(`*[ ✅ ] Configuración del grupo*\n\n*—◉* *_Idioma definido a Inglês 🇬🇧_*`)
 } else if (sigla === 'pt-br') {
 global.db.data.chats[m.chat].language = 'pt-br';
 m.reply(`*[ ✅ ] Configuración del grupo*\n\n*—◉* *_Idioma definido a Português 🇧🇷_*`)
 } else if (sigla === 'ru') {
 global.db.data.chats[m.chat].language = 'ru';
 m.reply(`*[ ✅ ] Configuración del grupo*\n\n*—◉* *_Язык изменён на русский 🇷🇺_*`)
 } else if (sigla === 'fr') {
 global.db.data.chats[m.chat].language = 'fr';
 m.reply(`*[ ✅ ] Configuración del grupo*\n\n*—◉* *_Langue définie sur Français 🇫🇷_*`)
 } else if (sigla === 'ar') {
 global.db.data.chats[m.chat].language = 'ar';
 m.reply(`*[ ✅ ] Configuración del grupo*\n\n*—◉* *_تم تعيين اللغة إلى العربية 🇸🇦_*`)
 } else {
 m.reply(`${tradutor.texto2[0]}\n*${usedPrefix}langgroup* es\n\n${tradutor.texto2[1]}`)
 }
}
 // Fim 
 } catch (error) {
 console.log(error);
 global.db.data.users[m.sender].language = 'es'
 global.db.data.chats[m.chat].language = 'es'
 m.reply(`*[ERROR]* -  _Por defecto el idioma estaba configurado en español._\n\`\`\`contacta a los creadores del bot\`\`\``)
 }
};


handler.help = ['lang'];
handler.tags = ['info'];
handler.command = ['lang', 'langgroup'];

export default handler;
