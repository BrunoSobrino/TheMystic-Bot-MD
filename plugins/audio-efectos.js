import {unlinkSync, readFileSync, existsSync} from 'fs'
import {join} from 'path'
import {exec} from 'child_process'
import {promisify} from 'util'

const execAsync = promisify(exec)

const handler = async (m, {conn, command, __dirname, usedPrefix}) => {

const datas = global
const user = datas.db.data.users[m.sender] || {}

const idioma = user.language || global.defaultLenguaje
const _translate = JSON.parse(readFileSync(`./src/languages/${idioma}.json`))
const tradutor = _translate.plugins.audio_efectos

const q = m.quoted ? m.quoted : m
const mime = (q.msg || q).mimetype || ''

if (!/audio/.test(mime)) {
throw `${tradutor.texto1} ${usedPrefix + command}`
}

let set = ''

if (/bass/.test(command)) set = '-af equalizer=f=94:width_type=o:width=2:g=30'
if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log'
if (/deep/.test(command)) set = '-af atempo=1,asetrate=44500*2/3'
if (/earrape/.test(command)) set = '-af volume=12'
if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"'
if (/nightcore/.test(command)) set = '-filter:a "atempo=1.06,asetrate=44100*1.25"'
if (/reverse/.test(command)) set = '-filter_complex "areverse"'
if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\'"'
if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"'
if (/echo/.test(command)) set = '-af aecho=0.8:0.9:1000:0.3'
if (/vibrato/.test(command)) set = '-af vibrato=f=5:d=0.5'
if (/tremolo/.test(command)) set = '-af tremolo=f=3:d=0.9'
if (/distortion/.test(command)) set = '-af overdrive=20:20'
if (/underwater/.test(command)) set = '-af lowpass=f=300'
if (/telephone/.test(command)) set = '-af lowpass=f=3000,highpass=f=300'
if (/radio/.test(command)) set = '-af equalizer=f=3000:width_type=o:width=2:g=15'

if (!set) throw '❌ Efecto no válido'

const ran = getRandom('.mp3')
const tmp = join(__dirname, '../src/tmp/')
const input = join(tmp, getRandom('.mp3'))
const output = join(tmp, ran)

let media

try {

media = await q.download()
await Bun.write(input, media)

const cmd = `ffmpeg -i "${input}" ${set} "${output}"`

await execAsync(cmd)

if (!existsSync(output)) throw 'No se generó el audio'

const buff = readFileSync(output)

await conn.sendMessage(
m.chat,
{ audio: buff, mimetype: 'audio/mpeg', ptt: false },
{ quoted: m }
)

} finally {

try {
if (existsSync(input)) unlinkSync(input)
if (existsSync(output)) unlinkSync(output)
} catch {}

}

}

handler.help = [
'bass','blown','deep','earrape','fast','nightcore','reverse','robot',
'slow','echo','vibrato','tremolo','distortion','underwater','telephone','radio'
]

handler.tags = ['effects']

handler.command = /^(bass|blown|deep|earrape|fast|nightcore|reverse|robot|slow|echo|vibrato|tremolo|distortion|underwater|telephone|radio)$/i

export default handler

function getRandom(ext){
return `${Math.floor(Math.random()*10000)}${ext}`
}
