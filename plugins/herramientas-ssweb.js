import fetch from 'node-fetch' 
 var handler = async (m, {conn,text, args}) => {   
  
     if (!args[0]) return conn.reply(m.chat, "*[🔎] 𝙸𝙽𝙶𝚁𝙴𝚂𝙴 𝙻𝙰 𝚄𝚁𝙻 𝙳𝙴 𝚄𝙽𝙰 𝙿𝙰𝙶𝙸𝙽𝙰*", m);  
  try {  
       const r =  `https://api.lolhuman.xyz/api/SSWeb?apikey=${lolkeysapi}&url=${text}`; 
     conn.sendMessage(m.chat, {image: {url: r}}, {quoted: m}); } catch {  
 try { 
  const link = `https://api.screenshotmachine.com/?key=c04d3a&url=${args[0]}&screenshotmachine.com&dimension=720x720`;  
  conn.sendMessage(m.chat, {image: {url: link}}, {quoted: m}); } catch { 
 const ssweb2 = `https://api.lolhuman.xyz/api/SSWeb2?apikey=${lolkeysapi}&url=${text}` 
 conn.sendMessage(m.chat, {image: {url: ssweb2}}, {quoted: m});  
 }}}; 
   handler.help = ["ss", "ssf"].map((v) => v + " <url>");   
   handler.tags = ["internet"];   
   handler.command = /^ss(web)?f?$/i;   
   export default handler
