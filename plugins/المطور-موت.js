let handler = async (m, { conn }) => {
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let name = conn.getName(who)
    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './mob.jpg')
    conn.sendFile(m.chat, global.API('https://some-random-api.com', '/canvas/overlay/wasted', {
      avatar: pp, 
    }), 'waste.png', `*⎔❯╼╾╾╃❖⟪ 🍥 ⟫❖╃╼╾╾❮⎔*
*⌝🪦┇لقد مات┇🪦⌞*
*⎔❯╼╾╾╃❖⟪ 🍥 ⟫❖╃╼╾╾❮⎔*
*♡↵》كان راجل جدع*
*♡↵》المرحوم『 ${name} 』•*
*‏◉ ⊱━─━─━ •♦️• ━─━─━⊰ ◉*
『 ناتسو بوت - 𝑁𝐴𝑇𝑺𝑈 𝗕𝗢𝗧』
*⎔❯╼╾╾╃❖⟪ 🍥 ⟫❖╃╼╾╾❮⎔*
*⧉↵╎「تـوقـيـع ✍🏻」*
~*『𝑁𝐴𝑇𝑺𝑈』*~`, m)
  }
  
  handler.help = ['waste @user']
  handler.tags = ['fun']
  handler.command = ['موت'] 
  handler.owner = true
  export default handler