let handler = async (m, { conn, usedPrefix: _p, __dirname, args }) => {
let text = `${htki} *DOWNLOAD* ${htka}

     WhatsApp GB 🈲
     Pasword: sabar
    
    --------Kelebihan--------
• Anti Virtex❌
• Anti lag❌
• Fitur war❌️
• Anti Bug troli, slayer Dll❌
• No Password ❌
• Pesan anti hapus✔️
• Status Anti hapus✔️
• Anti blokir✔️
• Status Hd✔️
• Sembunyikan Online✔️
• Boom chat✔️
• Anti kadaluarsa ✔️
• Pengubah suara Vn✔️
• Status mod variasi✔️
• No delay✔️
• Status Warna warni✔️
• Dll
`
const templateButtons = [
    {index: 1, urlButton: {displayText: '↗️Clone', url: 'https://cararegistrasi.com/QXwAxmu'}},
    {index: 1, urlButton: {displayText: '↗️Unclone', url: 'https://cararegistrasi.com/aYyZ1Gyt5'}},
]
let tm = {
text: text,
footer: global.wm,
templateButtons: templateButtons,
image: {url: fla + 'Donasi'}
}
conn.sendMessage(m.chat, tm, m)
}
handler.help = ['wagb1']
handler.tags = ['virus']
handler.command = /^wagb1$/i

export default handler