import fetch from "node-fetch"
let handler = async (m, {
    conn,
    text
}) => {
    try {
    await m.reply(wait)
        let a = await (await fetch("https://lucifer.shadowthings.xyz/api/quotes")).json()
        let b = a[0].quote
        let c = a[0].author
        await m.reply("*الاقتباس*\n" + b + "\n\n*المؤلف*\n" + c)
    } catch (e) {
        await m.reply(eror)
    }
}
handler.tags = ["lucifer"]
handler.help = ["quotes"]
handler.command = /^(اقتباس|اقتياسات)$/i
export default handler
