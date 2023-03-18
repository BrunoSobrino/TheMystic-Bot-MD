let handler = m => m

export async function all(m) {
  let user = global.db.data.users[m.sender]
  if (m.chat.endsWith('broadcast')) return

  if (user.premiumTime != 0 && user.premium && new Date() * 1 >= user.premiumTime) {
    user.premiumTime = 0
    user.premium = false

    await m.reply(`*@${m.sender.split`@`[0]} Tu tiempo premium ha expirado y ya no eres un usuario premium. Si deseas volver a ser premium, puedes comprar un nuevo tiempo premium con el comando #pase premium*`, m, { mentions: [m.sender] })
  }
}
