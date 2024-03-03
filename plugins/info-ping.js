export default {
   names: ['Main Menu'],
   tags: ['ping', 'runtime', 'p'],
   command: ['ping', 'runtime', 'p'],
   start: async (m, {
      conn,
      Format
   }) => {
      let { latensi, oldd, neww, response, muptime } = await Format.System();
      let { Upload, Download } = await Format.statistic();
      let runtime = `⚡ _Kecepatan TV_ : \n`
      runtime += `${latensi.toFixed(4)} _Second_\n`
      runtime += `${oldd - neww} _miliseconds_\n\n`
      runtime += `🌐 Statistic Usage Network Bot :\n📤  Upload: ${Upload}\n📥  Download: ${Download}\n\n`
      runtime += `🟢 Bot Essaouidi enligne:\n`
      runtime += `${muptime}\n`
      runtime += `${response}`
      m.edReply(runtime, 10);
      //conn.reply(m.chat, runtime, m);
   }
}
