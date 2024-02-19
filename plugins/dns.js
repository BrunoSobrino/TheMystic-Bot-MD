import fetch from "node-fetch";

const handler = async (m, {
    text,
    usedPrefix,
    command
}) => {
    if (!text) throw `اذخل الأمر متبوعا برابط 😕\n\n*مثال:* \n*.dns* www.google.com`;

    if (text.includes("https://") || text.includes("http://")) throw `الرجاء إدخال النطاق الكامل/المجال الفرعي. على سبيل المثال: \n.dns www.google.com`;
    await m.reply("⌛ انتظر لحظة ...");
    try {
        let output = await convertRecords(text);
        await m.reply(`📋 *نتائج بحث النطاق:*\n${output}`);
    } catch (error) {
        console.log(error);
        await m.reply("*حدث خطأ أثناء إجراء بحث DNS.*");
    }
};

handler.command = ["dns"];
handler.help = ["dns"];
handler.tags = ["tools"];
handler.premium = false;
export default handler;

const api_key = "E4/gdcfciJHSQdy4+9+Ryw==JHciNFemGqOVIbyv";

async function fetchDNSRecords(apiKey, domain) {
    try {
        const response = await fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${domain}`, {
            headers: {
                "X-Api-Key": apiKey
            },
            contentType: "application/json"
        });
        const records = await response.json();
        return records;
    } catch (error) {
        console.log(error);
        throw new Error("❌ Gagal mengambil rekaman DNS.");
    }
}

async function fetchDNSRecordsFromHackertarget(domain) {
    try {
        const response = await fetch(`https://api.hackertarget.com/dnslookup/?q=${domain}`);
        return await response.text();
    } catch (error) {
        console.log(error);
        throw new Error("❌ Gagal mengambil rekaman DNS dari hackertarget.");
    }
}

async function convertRecords(domain) {
    try {
        const records = await fetchDNSRecords(api_key, domain);
        return records.map((record, index) => {
            return `🔍 [${index + 1}]:\n${Object.entries(record).map(([key, value]) => {
                const input = key;
                const output = input.charAt(0).toUpperCase() + input.slice(1).replace(/_/g, " ");
                return `*${output}:* ${typeof value === 'string' ? value.replace(/\.$/, '') : value}`;
            }).join('\n')}`;
        }).join('\n');
    } catch (error) {
        console.log(error);
        return await fetchDNSRecordsFromHackertarget(domain);
    }
}
