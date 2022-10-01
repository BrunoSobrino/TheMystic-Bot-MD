/*
Made by https://github.com/balhisyhrl
*/
import cp from 'child_process'
import { promisify } from 'util'
let exec = promisify(cp.exec).bind(cp)
let handler = async (m, { conn, text, usedPrefix, command }) => {
    let teks = m.quoted ? m.quoted.text : text
    if (!teks) throw `¿Qué texto quieres guardar??\n\nejemplo:\n${usedPrefix + command} ea`
    if (teks.length < 10) throw `El texto es demasiado corto, al menos 10 caracteres.!`
	await conn.reply(m.chat, global.wait, m)
    let textb64 = Buffer.from(teks, 'utf-8').toString('base64')
    let o
    try {
        o = await exec(`php php/pastebin.php -p="${textb64}"`)
    } catch (e) {
        o = e
    } finally {
        let { stdout, stderr } = o
        if (stdout.trim()) m.reply(stdout)
        //if (stderr.trim()) m.reply(stderr)
    }
}
handler.help = ['pastebin <text>']
handler.tags = ['tools','php']
handler.command = /^(pastebin)$/i

export default handler
