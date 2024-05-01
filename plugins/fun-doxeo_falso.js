import {performance} from 'perf_hooks';


const handler = async (m, {conn, text}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.plugins.fun_doxeo_falso

    
const start = performance.now();    
const end = performance.now();
const executionTime = (end - start);
    
const ipParts = [];
for (let i = 0; i < 4; i++) {
ipParts.push(Math.floor(Math.random() * 256))};
const ipAddress = ipParts.join('.');
const fakeData = {
name_tag: '',
ip: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
fakeCameraLink: `http://${ipAddress}.com/camera-feed`,    
n: Math.floor(Math.random() * 100000),
w: (Math.random() * (20 - 10) + 10).toFixed(4),
ssNumber: Math.floor(Math.random() * 10000000000000000),
ipv6: `fe80:${(Math.random() * 65535).toString(16)}:${(Math.random() * 65535).toString(16)}:${(Math.random() * 65535).toString(16)}:${(Math.random() * 65535).toString(16)}%${Math.floor(Math.random() * 100)}`,
upnp: getRandomValue(['Enabled', 'Disabled']),
dmz: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
mac: `${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}`,
isp: getRandomValue(['Ucom universal', 'ISP Co', 'Internet Solutions Inc']),
dns: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
altDns: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
dnsSuffix: getRandomValue(['Dlink', 'DNS', 'ISPsuffix']),
wan: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
wanType: getRandomValue(['private nat', 'public nat', 'Dynamic IP']),
gateway: `192.${Math.floor(Math.random() * 256)}.0.1`,
subnetMask: `255.255.${Math.floor(Math.random() * 256)}.0`,
udpOpenPorts: `${Math.floor(Math.random() * 10000)}.${Math.floor(Math.random() * 10000)}`,
tcpOpenPorts: `${Math.floor(Math.random() * 10000)}`,
routerVendor: getRandomValue(['ERICCSON', 'TPLINK', 'Cisco']),
deviceVendor: getRandomValue(['WIN32-X', 'Device Co', 'SecureTech']),
connectionType: getRandomValue(['TPLINK COMPANY', 'ISP Connect', 'Home Network']),
icmphops: `192.${Math.floor(Math.random() * 256)}.0.1 192.${Math.floor(Math.random() * 256)}.1.1 100.${Math.floor(Math.random() * 256)}.43.4`,
http: `192.168.${Math.floor(Math.random() * 256)}.1:433-->92.28.211.234:80`,
http2: `192.168.${Math.floor(Math.random() * 256)}.625-->92.28.211.455:80`,
http3: `192.168.${Math.floor(Math.random() * 256)}.817-->92.28.211.8:971`,
udp: `192.168.${Math.floor(Math.random() * 256)}.452-->92.28.211.7265288`,
tcp1: `192.168.${Math.floor(Math.random() * 256)}.682-->92.28.211.62227.7`,
tcp2: `192.168.${Math.floor(Math.random() * 256)}.725-->92.28.211.67wu2`,
tcp3: `192.168.${Math.floor(Math.random() * 256)}.629-->92.28.211.167:8615`,
externalMac: `${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}:${Math.floor(Math.random() * 256).toString(16).toUpperCase()}`,
modemJumps: Math.floor(Math.random() * 100)
};
if (m.mentionedJid[0]) {
fakeData.name_tag = text //`@${m.mentionedJid[0].split('@')[0]}` //conn.getName(m.mentionedJid[0])
} else {
fakeData.name_tag = text    
}
    
const doxeo = `${tradutor.texto1[0]}\n*◉ ${executionTime} ${tradutor.texto1[1]}*

${tradutor.texto2[0]} ${fakeData.name_tag}
${tradutor.texto2[1]}  ${fakeData.ip}
${tradutor.texto2[2]}  ${fakeData.n}
${tradutor.texto2[3]}  ${fakeData.w}
${tradutor.texto2[4]}  ${fakeData.ssNumber}
${tradutor.texto2[5]}  ${fakeData.fakeCameraLink}
${tradutor.texto2[6]}  ${fakeData.ipv6}
${tradutor.texto2[7]}  ${fakeData.upnp}
${tradutor.texto2[8]}  ${fakeData.dmz}
${tradutor.texto2[9]}  ${fakeData.mac}
${tradutor.texto2[10]}  ${fakeData.isp}
${tradutor.texto2[11]}  ${fakeData.dns}
${tradutor.texto2[12]}  ${fakeData.altDns}
${tradutor.texto2[13]}  ${fakeData.dnsSuffix}
${tradutor.texto2[14]}  ${fakeData.wan}
${tradutor.texto2[15]}  ${fakeData.wanType}
${tradutor.texto2[16]}  ${fakeData.gateway}
${tradutor.texto2[17]}  ${fakeData.subnetMask}
${tradutor.texto2[18]}  ${fakeData.udpOpenPorts}
${tradutor.texto2[19]}  ${fakeData.tcpOpenPorts}
${tradutor.texto2[20]}  ${fakeData.routerVendor}
${tradutor.texto2[21]}  ${fakeData.deviceVendor}
${tradutor.texto2[22]}  ${fakeData.connectionType}
${tradutor.texto2[23]}  ${fakeData.icmphops}
${tradutor.texto2[24]}  ${fakeData.http}
${tradutor.texto2[25]}  ${fakeData.http2}
${tradutor.texto2[26]}  ${fakeData.http3}
${tradutor.texto2[27]}  ${fakeData.udp}
${tradutor.texto2[28]}  ${fakeData.tcp1}
${tradutor.texto2[29]}  ${fakeData.tcp2}
${tradutor.texto2[30]} ${fakeData.tcp3}
${tradutor.texto2[31]}  ${fakeData.externalMac}
${tradutor.texto2[32]}  ${fakeData.modemJumps}`;
    
async function loading() {
var hawemod = [
"《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
"《 ████▒▒▒▒▒▒▒▒》30%",
"《 ███████▒▒▒▒▒》50%",
"《 ██████████▒▒》80%",
"《 ████████████》100%"
]
      let { key } = await conn.sendMessage(m.chat, {text: `${tradutor.texto3}`}, {quoted: m})
 for (let i = 0; i < hawemod.length; i++) {
   await new Promise(resolve => setTimeout(resolve, 1000)); 
   await conn.sendMessage(m.chat, {text: hawemod[i], edit: key}, {quoted: m}); 
  }
  await conn.sendMessage(m.chat, {text: doxeo, edit: key, mentions: conn.parseMention(doxeo)}, {quoted: m});         
 }
loading()    
};
handler.help = ['doxear <nombre> | <@tag>'];
handler.tags = ['fun'];
handler.command = /^Doxxeo|doxxeo|doxxear|Doxxear|doxeo|doxear|doxxeame|doxeame/i;
export default handler;

function getRandomValue(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
