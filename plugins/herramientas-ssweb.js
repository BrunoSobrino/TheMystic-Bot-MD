import fetch from 'node-fetch' 


const handler = async (m, {conn, text, args}) => {   
   const datas = global
   const idioma = datas.db.data.users[m.sender].language
   const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
   const tradutor = _translate.plugins.herramientas_ssweb

if (!args[0]) return conn.reply(m.chat, tradutor.texto1, m);  
   try {
     const ss = await (await fetch(`https://image.thum.io/get/fullpage/${args[0]}`)).buffer();
        conn.sendFile(m.chat, ss, '', '', m);
   } catch { 
   try {  
     const ss2 = `https://api.screenshotmachine.com/?key=c04d3a&url=${args[0]}&screenshotmachine.com&dimension=720x720`;  
        conn.sendMessage(m.chat, {image: {url: ss2}}, {quoted: m}); 
   } catch {  
   try { 
     const ss3 =  `https://api.lolhuman.xyz/api/SSWeb?apikey=${lolkeysapi}&url=${text}`; 
        conn.sendMessage(m.chat, {image: {url: ss3}}, {quoted: m}); 
   } catch { 
     const ss4 = `https://api.lolhuman.xyz/api/SSWeb2?apikey=${lolkeysapi}&url=${text}`;
        conn.sendMessage(m.chat, {image: {url: ss4}}, {quoted: m});  
   }
  }
 }
}; 
handler.help = ["ss", "ssf"].map((v) => v + " <url>");   
handler.tags = ["internet"];   
handler.command = /^ss(web)?f?$/i;   
export default handler
