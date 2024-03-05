let toM = a => '@' + a.split('@')[0]
function handler(m, { groupMetadata }) {
    let ps = groupMetadata.participants.map(v => v.id)
    let a = m.sender
    let b
    do b = ps.getRandom()
    while (b === a)
  let c
  do c = ps.getRandom()
    while (c === a)
    m.reply(`*┆ ${toM(a)} 『 الــعـريــس 🕺 』 ┆*\n\n*┆ ${toM(b)} 『 الــعـروســة 💃 』 ┆*\n\n*┆ ${toM(c)} 『 الــمـأذون 👀 』 ┆*\n『 بــارك الله لــكـما و بـارك عــلـيـكــما و جــمع بــيـنكــم فــي خــير 』`, null, {
        mentions: [a, b, c]
    })
}
handler.help = ['ship']
handler.tags = ['fun']
handler.command = ['زواج']
handler.diamond = true
handler.group = true

export default handler  
