let handler = async (m, { conn }) => {
let info = `
*${htki} VIRUS ${htka}*
          
 ⛧𝐏𝐄𝐍𝐓𝐀𝐆𝐑𝐀𝐌⛧
          
                  
–––––– *ᴋᴇʙɪᴊᴀᴋᴀɴ* ––––––
*MAU JADI HENGKER WANGSAF YA*
`
const sections = [
   {
    title: `✃ VIRTEX`,
	rows: [
	    {title: "😈Virtex 1", rowId: '.virtex1', description: 'Jangan lupa donasi' },
	    {title: "😈Virtex 2", rowId: '.virtex2', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 3", rowId: '.virtex3', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 4", rowId: '.virtex4', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 5", rowId: '.virtex5', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 6", rowId: '.virtex6', description: 'Jangan lupa donasi' },
    {title: "😈Virtex 7", rowId: '.virtex7', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 8", rowId: '.virtex8', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 9", rowId: '.virtex9', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 10", rowId: '.virtex10', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 11", rowId: '.virtex11', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 12", rowId: '.virtex12', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 13", rowId: '.virtex13', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 14", rowId: '.virtex14', description: 'Jangan lupa donasi' },
    {title: "😈Virtex 15", rowId: '.virtex15', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 16", rowId: '.virtex16', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 17", rowId: '.virtex17', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 18", rowId: '.virtex18', description: 'Jangan lupa donasi' },
	{title: "😈Virtex 19", rowId: '.virtex19', description: 'Jangan lupa donasi' },
    {title: "😈Virtex 20", rowId: '.virtex20', description: 'Jangan lupa donasi' },

	]
    }, {
    title: `✃ INFO`,
	rows: [
	    {title: "🔥Download WhatsApp Imune", rowId: '.waantivirus', description: 'Download WhatsApp Kebal' },
	    {title: "🔥Virus Troli", rowId: '.virustroli', description: 'PENTAGRAM' },
	    {title: "🔥Virus Power", rowId: '.powerlist', description: 'PENTAGRAM' },
	    ]
        }, {
    title: `✃ BUY`,
	rows: [
	    {title: "💸Upgrade Premium", rowId: '.sewa', description: 'Dan unclock Fitur premium lainya!' },
	    ]
        },
]

const listMessage = {
  text: ' ',
  footer: info,
  title: null,
  buttonText: "👺NIH",
  sections
}
await conn.sendMessage(m.chat, listMessage, { quoted: m})
//conn.sendHydrated(m.chat, info, wm, null, sgc, "🌎 Group Official", null,null, [['Owner','.owner']], m)
}
handler.help = ['virtex']
handler.tags = ['virus']
handler.command = /^virtex$/i
handler.premium = false

export default handler
