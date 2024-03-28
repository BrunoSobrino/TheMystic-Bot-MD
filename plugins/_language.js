const handler = async (m, {args, usedPrefix}) =>{
    const data = global
    const idioma = data.db.data.users[m.sender].language
    const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
    const tradutor = _translate.plugins._translate

   data.db.data.users[m.sender].language
   let sigla = args[0].toLowerCase()

   console.log(sigla)

    if(sigla === 'pt-br' || sigla === 'pt' || sigla === 'br'){
        data.db.data.users[m.sender].language = 'pt-br'
        m.reply(`*✅The Mistic - Bot*\n\n_Definido para_ *🇧🇷 Português*`)
    }else if(sigla === 'es'){
        data.db.data.users[m.sender].language = 'es'
        m.reply(`*✅The Mistic - Bot*\n\n_Definido para_ *🇪🇸 Español*`)
    }else{
        m.reply(`
${tradutor.texto1[0]}
*${usedPrefix}lang* es

${tradutor.texto1[1]}


`)
    }
}



handler.command = /^(lang)$/i;

export default handler