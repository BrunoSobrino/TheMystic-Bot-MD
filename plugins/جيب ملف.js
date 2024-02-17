import cp, { exec as _exec } from 'child_process'
import { promisify } from 'util'
let exec = promisify(_exec).bind(cp)

let handler = async (m, { conn, isROwner, usedPrefix, command, text }) => {
await m.reply(global.wait)
    if (!isROwner) return
    let ar = Object.keys(plugins)
    let ar1 = ar.map(v => v.replace('.js', ''))
    if (!text) throw `امم.. حيث النص?\n\n مثال:\n${usedPrefix + command} معلومات`
    if (!ar1.includes(text)) return m.reply(`*🗃️ غير معثور عليه!*\n==================================\n\n${ar1.map(v => ' ' + v).join`\n`}`)
    let o
    try {
        o = await exec('cat plugins/' + text + '.js')
    } catch (e) {
        o = e
    } finally {
        let { stdout, stderr } = o
        if (stdout.trim()) m.reply(stdout)
        if (stderr.trim()) m.reply(stderr)
    }
}
handler.help = ['getplugin2'].map(v => v + ' <text>')
handler.tags = ['owner']
handler.command = /^(getplugin|ملف)$/i
handler.rowner = true

export default handler