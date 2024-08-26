//حقوق روبيرتو
//https://whatsapp.com/channel/0029VadWNZBLdQei1yiuc52P
//تنشر اذكر المصدر

const games = {};

const ladders = { 3: 22, 5: 8, 11: 26, 20: 29 };
const snakes = { 27: 1, 21: 9, 17: 4, 19: 7 };
const winningPosition = 30;

const handler = async (m, { conn, command, args }) => {
    const chatId = m.chat;
    const roomName = args[0];
    const playerId = m.sender;

    if (command === 'ابدأ_سلم_وثعبان') { 
m.react('⏳');
        if (!roomName) {
            return await conn.reply(chatId, "يرجى تحديد اسم الغرفة.", m);
        }
        if (!games[roomName]) {
            games[roomName] = {
                players: [playerId],
                playerPositions: { [playerId]: 0 },
                currentPlayerIndex: 0
            };
            await conn.reply(chatId, `🎲 تم إنشاء غرفة "${roomName}"! انضم اللاعب 1. استخدم الأمر 'انضم_سلم_وثعبان ${roomName}' للانضمام.`, m);
        } else {
            return await conn.reply(chatId, "اللعبة قيد التشغيل بالفعل!", m);
        }
    }

    if (command === 'انضم_سلم_وثعبان') {
        if (!roomName) {
            return await conn.reply(chatId, "يرجى تحديد اسم الغرفة.", m);
        }
        if (games[roomName] && games[roomName].players.length < 4) {
            games[roomName].players.push(playerId);
            games[roomName].playerPositions[playerId] = 0;
            await conn.reply(chatId, `🎲 انضم اللاعب ${games[roomName].players.length} إلى غرفة "${roomName}".`, m);

            if (games[roomName].players.length === 4) {
                await conn.reply(chatId, `🎲 اكتمل عدد اللاعبين في غرفة "${roomName}"! دور اللاعب 1 (استخدم الأمر 'رمي_النرد ${roomName}' لتحريك النرد).`, m);
            }
        } else {
            await conn.reply(chatId, "لا يمكن الانضمام، إما أن اللعبة لم تبدأ بعد أو اكتمل عدد اللاعبين.", m);
        }
    }

    if (command === 'رمي_النرد') {
        if (!roomName) {
            return await conn.reply(chatId, "يرجى تحديد اسم الغرفة.", m);
        }
        if (!games[roomName]) {
            return await conn.reply(chatId, "لم تبدأ اللعبة بعد! استخدم الأمر 'ابدأ_سلم_وثعبان' لبدء اللعبة.", m);
        }

        const game = games[roomName];
        const currentPlayer = game.players[game.currentPlayerIndex];

        if (currentPlayer !== playerId) {
            return await conn.reply(chatId, `ليس دورك! إنه دور اللاعب ${game.currentPlayerIndex + 1}.`, m);
        }

        const diceRoll = Math.floor(Math.random() * 6) + 1;
        let newPosition = game.playerPositions[currentPlayer] + diceRoll;
        let message = `🎲 @${currentPlayer.split('@')[0]} رمى النرد وحصل على ${diceRoll} وتحرك إلى المربع ${newPosition}`;

        if (ladders[newPosition]) {
            newPosition = ladders[newPosition];
            message += ` وصعد السلم إلى المربع ${newPosition} 🪜`;
        } else if (snakes[newPosition]) {
            newPosition = snakes[newPosition];
            message += ` ونزل بالثعبان إلى المربع ${newPosition} 🐍`;
        }

        game.playerPositions[currentPlayer] = newPosition;

        if (newPosition >= winningPosition) {
            message += `\n🏁 @${currentPlayer.split('@')[0]} فاز! 🎉`;
            await conn.sendMessage(chatId, { text: message, mentions: game.players }, { quoted: m });
            delete games[roomName];
            return;
        }

        await conn.sendMessage(chatId, { text: message, mentions: game.players }, { quoted: m });

        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
        const nextPlayer = game.players[game.currentPlayerIndex];
        await conn.sendMessage(chatId, { text: `🎲 دور @${nextPlayer.split('@')[0]}، استخدم الأمر 'رمي_النرد ${roomName}' لتحريك النرد.`, mentions: [nextPlayer] }, { quoted: m });
    }
};

handler.help = ['ابدأ_سلم_وثعبان', 'انضم_سلم_وثعبان', 'رمي_النرد'];
handler.tags = ['game'];
handler.command = /^(ابدأ_سلم_وثعبان|انضم_سلم_وثعبان|رمي_النرد)$/i;

export default handler;
