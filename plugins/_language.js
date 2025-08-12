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
 m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*—◉* *_Bahasa diatur ke Bahasa Spanyol 🇪🇸_*`)
 } else if (sigla === 'en') {
 global.db.data.users[m.sender].language = 'en'
 m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*—◉* *_Bahasa diatur ke Bahasa Inggris 🇬🇧_*`)
 } else if (sigla === 'id') {
 global.db.data.users[m.sender].language = 'id'
 m.reply(`*[ ✅ ] The Mystic - Bot*\n\n*—◉* *_Bahasa diatur ke Bahasa Indonesia 🇮🇩_*`)
 } else {
 m.reply(`${tradutor.texto1[2]}\n${tradutor.texto1[3]} *( ${data.db.data.users[m.sender].language} )*\n${tradutor.texto1[0]}\n*${usedPrefix}lang* id\n\n${tradutor.texto1[1]}`)
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
 m.reply(`*[ ✅ ] Konfigurasi grup*\n\n*—◉* *_Bahasa diatur ke Bahasa Spanyol 🇪🇸_*`)
 } else if (sigla === 'en') {
 global.db.data.chats[m.chat].language = 'en';
 m.reply(`*[ ✅ ] Konfigurasi grup*\n\n*—◉* *_Bahasa diatur ke Bahasa Inggris 🇬🇧_*`)
 } else if (sigla === 'id') {
 global.db.data.chats[m.chat].language = 'id';
 m.reply(`*[ ✅ ] Konfigurasi grup*\n\n*—◉* *_Bahasa diatur ke Bahasa Indonesia 🇮🇩_*`)
 } else {
 m.reply(`${tradutor.texto2[0]}\n*${usedPrefix}langgroup* id\n\n${tradutor.texto2[1]}`)
 }
}
 // Fim 
 } catch (error) {
 console.log(error);
 global.db.data.users[m.sender].language = 'id'
 global.db.data.chats[m.chat].language = 'id'
 m.reply(`*[ERROR]* - _Secara default, bahasa telah diatur ke Bahasa Indonesia._\n\`\`\`hubungi pembuat bot\`\`\``)
 }
};


handler.help = ['lang'];
handler.tags = ['info'];
handler.command = ['lang', 'langgroup'];

export default handler;
