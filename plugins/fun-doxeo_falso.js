import {performance} from 'perf_hooks';
const handler = async (m, {conn, text}) => {
    
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
    
const doxeo = `*[ ✔ ] Persona doxxeada con éxito.*\n\n*—◉ Doxxeo realizado en:*\n*◉ ${executionTime} segundos.*\n*—◉ Resultados obtenidos del doxxeo:*

*Nombre:* ${fakeData.name_tag}
*Ip:* ${fakeData.ip}
*N:* ${fakeData.n}
*W:* ${fakeData.w}
*SS NUMBER:* ${fakeData.ssNumber}
*CAMARA DEL CELULAR:* ${fakeData.fakeCameraLink}
*IPV6:* ${fakeData.ipv6}
*UPNP:* ${fakeData.upnp}
*DMZ:* ${fakeData.dmz}
*MAC:* ${fakeData.mac}
*ISP:* ${fakeData.isp}
*DNS:* ${fakeData.dns}
*ALT DNS:* ${fakeData.altDns}
*DNS SUFFIX:* ${fakeData.dnsSuffix}
*WAN:* ${fakeData.wan}
*WAN TYPE:* ${fakeData.wanType}
*GATEWAY:* ${fakeData.gateway}
*SUBNET MASK:* ${fakeData.subnetMask}
*UDP OPEN PORTS:* ${fakeData.udpOpenPorts}
*TCP OPEN PORTS:* ${fakeData.tcpOpenPorts}
*ROUTER VENDEDOR:* ${fakeData.routerVendor}
*DEVICE VENDEDOR:* ${fakeData.deviceVendor}
*CONNECTION TYPE:* ${fakeData.connectionType}
*ICMPHOPS:* ${fakeData.icmphops}
*HTTP:* ${fakeData.http}
*Http:* ${fakeData.http2}
*Http:* ${fakeData.http3}
*Upd:* ${fakeData.udp}
*Tcp:* ${fakeData.tcp1}
*Tcp:* ${fakeData.tcp2}
*Tcp:* ${fakeData.tcp3}
*EXTERNAL MAC:* ${fakeData.externalMac}
*MODEM JUMPS:* ${fakeData.modemJumps}`;
    
async function loading() {
var hawemod = [
"《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
"《 ████▒▒▒▒▒▒▒▒》30%",
"《 ███████▒▒▒▒▒》50%",
"《 ██████████▒▒》80%",
"《 ████████████》100%"
]
      let { key } = await conn.sendMessage(m.chat, {text: `*☠ ¡¡INICIANDO DOXXEO!! ☠*`}, {quoted: m})
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
