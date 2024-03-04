const {Module} = require('../main')
const {aadhar,blur} = require('./misc/misc')
const {MODE} = require('../config')
const {skbuffer} = require('raganork-bot');
var x = MODE == 'public'?false:true
var list = '```'+`Logo Maker List
Usage: .logo 14 Text
01 - 11 : Calligraphy
12 - 13 : Beast
14 - 19 : Pubg
20 - 25 : RRR
26 - 27 : Free Fire
28 - 29 : India
30 - 32 : Avengers
33 - 34 : Pushpa
35 - 37 Master
38 - 44 IPL
45 - 45 : Dhoni
46 - 46 : Vijay
47 - 52 : KGF
53 - 57 : Agent
58 - 58 : Leo`+'```'
Module({pattern: "logo ?(.*)",fromMe: x,use: 'logo',desc: "45 + Logo maker commands"}, async(message, match) => {
if (!match[1] || match[1] === 'list') return await message.sendReply(list);
})
Module({pattern: "logo 01 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/calligraphy?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 02 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/calligraphy?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 03 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/calligraphy?style=3&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 04 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/calligraphy?style=4&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 05 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/calligraphy?style=5&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 06 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/calligraphy?style=6&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 07 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/calligraphy?style=7&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 08 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/calligraphy?style=8&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 09 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/calligraphy?style=9&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 10 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/calligraphy?style=10&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 11 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/calligraphy?style=11&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 12 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/beast?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 13 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/beast?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 14 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/pubg?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 15 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/pubg?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 16 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/pubg?style=3&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 17 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/pubg?style=4&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 18 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/pubg?style=5&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 19 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/pubg?style=6&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 20 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/rrr?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 21 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/rrr?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 22 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/rrr?style=3&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 23 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/rrr?style=4&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 24 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/rrr?style=5&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 25 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/rrr?style=6&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 26 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/freefire?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 27 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/freefire?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 28 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/india?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 29 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/india?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 30 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/avengers?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 31 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/avengers?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 32 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/avengers?style=3&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 33 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/pushpa?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 34 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/pushpa?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 35 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/master?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 36 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/master?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 37 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/master?style=3&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 38 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/ipl?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 39 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/ipl?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 40 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/ipl?style=3&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 41 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/ipl?style=4&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 42 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/ipl?style=5&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 43 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/ipl?style=6&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 44 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/ipl?style=7&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 45 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/dhoni?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 46 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/thalapathy?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 47 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/kgf?style=0&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 48 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/kgf?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 49 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/kgf?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 46 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/kgf?style=3&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 50 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/kgf?style=4&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "logo 51 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/kgf?style=5&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({ pattern: "logo 52 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/kgf?style=6&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({ pattern: "logo 53 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/agent?style=1&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({ pattern: "logo 54 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/agent?style=2&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({ pattern: "logo 55 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/agent?style=3&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({ pattern: "logo 56 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/agent?style=4&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({ pattern: "logo 57 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/agent?style=5&text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({ pattern: "logo 58 ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
var api_url = "https://raganork-network.vercel.app/api/logo/leo?text="+text
var image = await skbuffer(api_url);
await message.sendReply(image,'image');
})
Module({pattern: "aadhar ?(.*)",fromMe: x,use: 'logo', dontAddCommandList: true}, async(message, match) => {
var text = match[1]
if (!text || !message.reply_message || !message.reply_message.image || !text.includes(",")) return await message.sendReply("*Wrong format*\n*Reply to image .aadhar name,date,gender*")
await message.sendReply(await aadhar(text,await message.reply_message.download()),'image');
})
Module({pattern: "blur ?(.*)",fromMe: x,usage: '.blur 10 (up to 100)',use: 'logo', dontAddCommandList: true}, async(message, match) => {
var percent = match[1] || 5
if (!message.reply_message || !message.reply_message.image) return await message.sendReply("*Wrong format*\n*Reply to image*\n*.blur*\n*.blur 25*")
await message.sendReply(await blur(await message.reply_message.download(),percent),'image');
})
