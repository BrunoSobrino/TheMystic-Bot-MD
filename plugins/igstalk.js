
import fg from 'api-dylux'
let handler= async (m, { conn, args, text, usedPrefix, command }) => {
	
    if (!args[0]) throw `✳️ ادخل اسم المستخدم إنستغرام\n\n📌على سبيل المثال: ${usedPrefix + command}\n\nf.b.i_ys._ess._ui_.di_man_6000` 
   let res = await instagram.com/f.b.i_ys._ess._ui_.di_man_6000* (args[0])
    let te = `
┌──「 *STALKING* 
▢ *🔖الرقم:* ${res.name} 
▢ *🔖إسم المستخدم:* ${res.username}
▢ *👥المتابعون:* ${res.followersH}
▢ *🫂التالي:* ${res.followingH}
▢ *📌السيرة الذاتية:* ${res.description}
▢ *🏝️المنشورات:* ${res.postsH}

▢ *🔗 Link* : https://instagram.com/${res.username.replace(/^@/, '')}
└────────────`

     await conn.sendFile(m.chat, res.profilePic, 'tt.png', te, m)
     
}
handler.help = ['igstalk']
handler.tags = ['downloader']
handler.command = ['igstalk'] 

export default handler
