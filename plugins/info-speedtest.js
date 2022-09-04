let cp = require('child_process')
let { promisify } = require('util')
let exec = promisify(cp.exec).bind(cp)
let handler = async (m) => {
	await m.reply(m.chat, wait, m)
    let o
    try {
        o = await exec('python speed.py')
    } catch (e) {
        o = e
    } finally {
        let { stdout, stderr } = o
        if (stdout.trim()) m.reply(stdout)
        if (stderr.trim()) m.reply(stderr)
    }
}
handler.help = ['speedtest']
handler.tags = ['info']
handler.command = /^(speedtest?|test?speed)$/i

export default handler
