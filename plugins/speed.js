import { cpus as _cpus, totalmem, freemem } from 'os'
import os from 'os'
import osu from 'node-os-utils'
import { sizeFormatter } from 'human-readable'

let format = sizeFormatter({
	std: 'JEDEC', // 'SI' (default) | 'IEC' | 'JEDEC'
	decimalPlaces: 2,
	keepTrailingZeroes: false,
	render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { conn }) => {
	let groups
	try { groups = Object.values(await conn.groupFetchAllParticipating()) }
	catch { return }
	let chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats)
	let groupsIn = chats.filter(([id]) => id.endsWith('@g.us'))
    let NotDetect = 'Not Detect'
	let used = process.memoryUsage()
    let cpux = osu.cpu
    let cpuCore = cpux.count()
    let drive = osu.drive
    let driveTotal, driveUsed, drivePer
    let cpuPer
    let p1 = cpux.usage().then(cpuPercentage => {
        cpuPer = cpuPercentage
    }).catch(() => {
        cpuPer = NotDetect
    })
    let p2 = drive.info().then(info => {
        driveTotal = (info.totalGb + ' GB'),
            driveUsed = (info.usedGb + ' GB'),
            drivePer = (info.usedPercentage + '%')
    }).catch(() => {
        driveTotal = NotDetect,
            driveUsed = NotDetect,
            drivePer = NotDetect
    })
    await Promise.all([p1, p2])
	// Just use one core CPU
  const cpu = _cpus()[0];

  let start = process.hrtime();
  let speed;
  let end;
  let cpuUsage;
  // Measures the time required to take a measurement
  end = process.hrtime(start);
  speed = Math.round((end[0] * 1000 + end[1] / 1000000));
  // Calculate usage percentage CPU
  cpuUsage = ((cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq) / cpu.times.idle) * 100;
	let txt = `Speed Respon ${speed} ms second\n\n`
	txt += `Runtime :\n*${runtime(process.uptime())}*\n`
	txt += `OS Uptime :\n*${runtime(os.uptime())}*\n\n`
	txt += `💬 Status :\n- *${groupsIn.length < groups.length ? groups.length : groupsIn.length}* Group Chats\n`
	txt += `- *${groups.length}* Groups Joined\n`
	txt += `- *${groupsIn.length < groups.length ? 0 : groupsIn.length - groups.length}* Groups Left\n`
	txt += `- *${chats.length - groupsIn.length}* Personal Chats\n`
	txt += `- *${chats.length - ( groupsIn.length < groups.length ? 0 : groupsIn.length - groups.length )}* Total Chats\n\n`
	txt += `💻 *Total CPU Usage* :\n_${cpu.model.trim()} (${cpu.speed} MHZ)_\n_*Usage*: ${cpuUsage.toFixed(2)}%_\n_CPU CORE: ${cpuCore}_\n_CPU: ${cpuPer}%_\n\n`
	txt += `📑 *SERVER ROOM* :\n🔭 _Platform: ${os.platform()}_\n`
    txt += `🗂️ _drive Used: ${driveUsed}_\n`
    txt += `🗃️ _drive Total: ${driveTotal}_\n`
    txt += `🗒️ _drive Per: ${drivePer}_\n`
     txt += `💾 _RAM: ${format(totalmem() - freemem())} / ${format(totalmem())}_\n`
     txt += `💾 _FREE RAM: ${format(freemem())}_\n\n`
     txt += `*NodeJS Memory Usage*:\n${'```' +
    Object.keys(used)
      .map(
        (key, _, arr) =>
          `${key.padEnd(Math.max(...arr.map((v) => v.length)), ' ')}: ${format(
            used[key]
          )}`
      )
      .join('\n') +
    '```'
    }`
	await m.reply(txt)
}

handler.help = ['ping', 'speed']
handler.tags = ['info', 'tools']
handler.command = /^(ping|speed|info)$/

export default handler

function runtime(seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}
