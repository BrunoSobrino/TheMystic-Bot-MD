let handler = m => m 
 handler.all = async function (m) { 
 let chat = global.db.data.chats[m.chat] 
  
 if (/^احا$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat,`*بل التكت بتاعها 🐧*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
await conn.sendMessage(m.chat, { react: { text: '🐧', key: m.key } })
  }

   if (/^عبيط|يا عبيط$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*بطل تنمر يسطا 🗿*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
   }
   
   if (/^منور|منوره|منورين$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*احا يسطا نورك طفا الكهربا 🗿💔*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
await conn.sendMessage(m.chat, { react: { text: '💡', key: m.key } })
   }
    if (/^عمك$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*غوجو ساترو؟💢💯*`, m) //wm, null, [['Menu', '#menu']], m) botones :V
}
    if (/^بوت$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*اسمي غوجو ياورع 😒*`, m) //wm, null, [['Menu', '#menu']], m) botones :V
await conn.sendMessage(m.chat, { react: { text: '🗿', key: m.key } })
}

 if (/^يابوت|يا بوت$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*هممممم عاوز ايه انت كمان 🗿*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
await conn.sendMessage(m.chat, { react: { text: '🗿', key: m.key } })
 } 

   if (/^غوجو$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat,'*الله جلب غوجو من جوه يا ناس 🌚🙈*',m) //wm, null, [['Menu', '#menu']], m) botones :v
await conn.sendMessage(m.chat, { react: { text: '💗', key: m.key } })
   }

   if (/^بوت خرا|بوت زفت|خرا عليك|بوت فاشل|بوت عرص|مطورفاشل$/i.test(m.text) ) { //sem prefixo
     conn.reply(m.chat,'  *🗿  ياعلق  انا عمك ولو مش عاجبك شد فحواجبك ☺️*',m) //wm, null, [['Menu','#menu']], m) botones :v

   }
 if (/^بحبك|احبك|حب البوت|يا بوت تعالي خاص$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*امشي يابت غوري مش ناقصة تلزيق 🗿*`, m) //wm, null, [['Menu', '#menu']], m) botones :V

 } 

   if (/^تست$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat,'*خايف اقولك انو انا شغال متصدقش 🐦🦦*', m) //wm, null, [['Menu', '#menu']], m) botones :V

   }
 if (/^مصر/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*ام الدنيا 🐧⚡*`, m) //wm, null, [['Menu', '#menu']], m) botones :V

 } 
  
 if (/^امزح|بهزر$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*هزعلك لو هزرت معايا تاني 🗿*`, m) //wm, null, [['Menu', '#menu']], m) botones :V
   } 
  
 if (/^في ايه$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*معرفشفي ايه قول انت🗿*`, m) //wm, null, [['Menu', '#menu']], m) botones :V
 } 
  
 if (/^🐦$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*🐦*`, m) //wm, null, [['Menu', '#menu']], m) botones :V
  
 } 
  
 if (/^بتعمل ايه دلوقت$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*وانت مالك بيا روح نام* 🗿`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
  
 } 
  
 if (/^انا جيت$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*نورت البيت😂❤️ شخيت🌚*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
  await conn.sendMessage(m.chat, { react: { text: '😂', key: m.key } })
 } 
  
 if (/^اخرس|اسكت$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*مش هخرس مين انت عشان تسكتني*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
  
 } 
  
 if (/^حرامي|سارق$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `تتهم بريء بالسرقة 
 من دون تحري او بحث 
 عن حقيقة ليست ملموسة 
 ارحنا واعمل شرطي  
 ثم افتح فمك وثرثر 
 فكلامك كـجاهل واحد  
 بل جهلاً ارحم من حديثك 
 تتصنع دور الشرطي  
 وكأنك محقق 
 بالله اصمت ولا تحرج نفسك  
 ارحنا وارح أعصابك  
 ان اكرمك الله بعقل 
 فبسكوتك اقتل جهلك`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
  
 } 
  
  
 if (/^ملل|مللل|ملللل$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*عارفين ف اسكت احسن لك كلنا مللانين🥱*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
 
 } 
  
 if (/^السلام عليكم |السلام عليكم ورحمة الله|سلام عليكم|السلام عليكم ورحمة الله وبركاته $/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*وعليكم السلام ورحمة الله وبركاته♥*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
  
 
 } 
     
 if (/^🤖$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*هو انت بوت ياصحبي؟ 🗿*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 

 } 
     
 if (/^🙂$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `🙂🙂🙂🙂`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
  
 } 
  if (/^🗿$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `🗿💔🗿💔🗿💔🗿💔🗿💔`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
  
 } 
  if (/^اه$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*الشارع الي وراه 🐧⚡*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
  
 } 
     
 if (/^نعم$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*حد ناداك؟ 🐦*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
  
 } 

  
 if (/^كيفك|شخبارك|علوك|عامل ايه|اخبارك|اي الدنيا$/i.test(m.text) ) { //sem prefixo 
    conn.reply(m.chat, `*الحمد لله و انت 🐧*`, m) //wm, null, [['Menu', '#menu']], m) botones :V 

 if (/^سكونا|ريومان|ريومان سوكونا$/i.test(m.text) ) { //sem prefixo 
     conn.reply(m.chat, `*ماهوراجااا هاهاهاااااا ماهوراجااااااااا *`, m) //wm, null, [['Menu', '#menu']], m) botones :V 
 
 }
  
 } 
 return !0 } 
 export default handler
