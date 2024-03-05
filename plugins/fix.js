let handler  = async (m, { conn, text }) => {
	let users = global.db.data.users

  var total = 0
  for (let jid in users){
    if (users[jid].limit < 0){
      users[jid].limit = 0
      total+=1
    }
    if (users[jid].joinlimit < 0){
      users[jid].joinlimit = 0
      total+=1
     }
    if (users[jid].money < 0){
      users[jid].money = 0
      total+=1
    }
    if (users[jid].healt < 0){
      users[jid].healt = 0
      total+=1
    }
    if (users[jid].healt > 100){
      users[jid].healt = 100
      total+=1
    }
    if (users[jid].stamina < 0){
      users[jid].stamina = 0
      total+=1
    }
    if (users[jid].stamina > 100){
      users[jid].stamina = 100
      total+=1
    }
    if (users[jid].exp < 0){
      users[jid].exp = 0
      total+=1
    }
    if (users[jid].levl < 0){
      users[jid].level = 0
      total+=1
    }
    users[jid].money = Math.floor(users[jid].money)
    users[jid].limit = Math.floor(users[jid].limit)
  }
  return conn.reply(m.chat,`*Berhasil memperbaiki ${total} error di database.*`,m)
}
handler.help = ['fix']
handler.tags = ['owner']
handler.command = /^(fix)$/i
handler.owner = 1

module.exports = handler
