
let handler = async (m, {
    conn,
    isOwner,
    usedPrefix,
    command,
    args
}) => {
    try {
        await m.reply(wait)
        let cofe = "https://coffee.alexflipnote.dev/random"
        await conn.sendFile(m.chat, cofe, "", "*[ إحتسي لك كأسا من القهوة ]*", m)
    } catch (e) {
        throw eror
    }
}
handler.help = ["coffee"]
handler.tags = ["tools"]
handler.command = /^(coffee)$/i
export default handler
