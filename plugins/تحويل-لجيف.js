import fetch from "node-fetch"
let handler = async (m, {
    command,
    usedPrefix,
    conn,
    text,
    args
}) => {

    let lister = [
        "search",
        "video"
    ]

    let [feature, inputs, inputs_, inputs__, inputs___] = text.split("|")
    if (!lister.includes(feature)) return m.reply("*مثال:*\n.animeiat search|naruto\n\n*Pilih type yg ada*\n" + lister.map((v, index) => "  ○ " + v).join('\n'))

    if (lister.includes(feature)) {

        if (feature == "search") {
            if (!inputs) return m.reply("Input query anime")
            await m.reply(wait)
            let outs = await searchAnime(inputs)
            let teks = outs.map((anime, index) => {
                return `*[ ${index + 1} ]*
*Judul:* ${anime.anime_name}
*id:* ${anime.id}
*slug:* ${anime.slug}
*Cerita:* ${anime.story}
*Nama lain:* ${anime.other_names}
*Total episode:* ${anime.total_episodes}
*Usia:* ${anime.age}
*Tipe:* ${anime.type}
*Status:* ${anime.status}
*Path poster:* ${anime.poster_path}
*Dipublikasikan oleh:* ${anime.published}
*Tanggal publikasi:* ${anime.published_at}
*Tahun:* ${anime.year_id}
*Dibuat pada:* ${anime.created_at}
*Diperbarui pada:* ${anime.updated_at}
   `.trim()
            }).filter(v => v).join("\n\n________________________\n\n")
            await m.reply(teks)
        }

        if (feature == "video") {
            if (!inputs) return m.reply("Input query slug")
            await m.reply(wait)
            let outs = await fetchAnime(inputs, inputs_)
            await m.reply(outs)
        }

    }
}
handler.help = ["animeiat type query"]
handler.tags = ["internet"]
handler.command = /^(لجيف)$/i
export default handler

async function searchAnime(query) {
    try {
        const response = await fetch(`https://api.animeiat.co/v1/anime?q=${query}`)
        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Terjadi kesalahan:', error)
        return null
    }
}

async function fetchAnime(query, episodes = 1) {
  try {
    const response = await fetch("https://api.animeiat.co/v1/anime?q=" + query);
    const sear = await response.json();
    const response1 = await fetch("https://api.animeiat.co/v1/episode/" + sear.data[0].slug + "-episode-" + episodes);
    const data = await response1.json();
    const slug = data.data.video.slug;
    const response2 = await fetch("https://api.animeiat.co/v1/video/" + slug);
    const data2 = await response2.json();
    const source = data2.data.sources;
    
    const teks = source.map((anime, index) => {
      return `*[ ${index + 1} ]*
*Quality:* ${anime.quality}
*Label:* ${anime.label}
*Link:* ${anime.file}
   `.trim();
    }).filter(v => v).join("\n\n________________________\n\n");
    
    return teks;
  } catch (error) {
    console.error(error);
    return null;
  }
}