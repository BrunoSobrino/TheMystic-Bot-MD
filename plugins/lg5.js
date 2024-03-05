import  fetch from 'node-fetch'
let handler = async (m, { conn, args }) => {
  let response = args.join(' ').split('|')
  if (!args[0]) throw 'مثال :\n*.lg5* essaouidi'
  m.reply('_إنتظر..._')
  let res = `https://flamingtext.com/net-fu/proxy_form.cgi?&imageoutput=true&script=water-logo&script=water-logo&fontsize=90&doScale=true&scaleWidth=800&scaleHeight=500&fontsize=100&fillTextColor=%23000&shadowGlowColor=%23000&backgroundColor=%23000&text=${response[0]}`
  conn.sendFile(m.chat, res, 'essaouidi.jpg', `instagram.com/f.b.i_ys._ess._ui_.di_man_6000`, m, false)
}
handler.help = ['flaming5'].map(v => v + ' <text>')
handler.tags = ['maker','logo']
handler.command = /^(lg5)$/i
export default handler
