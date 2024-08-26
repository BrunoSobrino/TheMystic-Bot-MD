import fetch from 'node-fetch';

const timeout = 60000;

let handler = async (m, { conn, command }) => {
    if (command.startsWith('answer_')) {
        let id = m.chat;
        let quiz = conn.quiz[id];

        if (!quiz) return;

        let selectedAnswer = command.split('_')[1];
        let isCorrect = quiz[0].right_answer == selectedAnswer;

        if (isCorrect) {
            await conn.reply(m.chat, `*❐═━━━═╊⊰🐉⊱╉═━━━═❐*\n*『✅┇اجـابـه صـحـيـحـة┇✅』*\n\n*【💰┇الـجـائـزة ⟣ 500𝚡𝚙 】*\n*❐═━━━═╊⊰🐉⊱╉═━━━═❐*\n> *𝙱𝚈┇𝐆𝐎𝐉𝐎⚡𝐁𝐎𝐓* `, m);
            global.db.data.users[m.sender].exp += 500; 
            clearTimeout(quiz[2]);
            delete conn.quiz[id];
        } else {
            quiz[3] -= 1;
            if (quiz[3] > 0) {
                await conn.reply(m.chat, `*❐═━━━═╊⊰🐉⊱╉═━━━═❐*\n*『❌┇اجـابـة خـطـئ┇❌』*\n\n> *⧉↫تـبـقـي عـدد مـحـولات↫ ${quiz[3]} ❯*\n*❐═━━━═╊⊰🐉⊱╉═━━━═❐*\n> *𝙱𝚈┇𝐆𝐎𝐉𝐎⚡𝐁𝐎𝐓*`, m);
            } else {
                await conn.reply(m.chat, `*❐═━━━═╊⊰🐉⊱╉═━━━═❐*\n*『❌┇اجـابـة خـطـئ┇❌』*\n\n> *⧉↫الاجـابـه الـصـحـيـة↫ ${quiz[0]['answer_' + quiz[0].right_answer]} ❯*\n*❐═━━━═╊⊰🐉⊱╉═━━━═❐*\n> *𝙱𝚈┇𝐆𝐎𝐉𝐎⚡𝐁𝐎𝐓*`, m);
                clearTimeout(quiz[2]);
                delete conn.quiz[id];
            }
        }
    } else {
        
        try {
            conn.quiz = conn.quiz ? conn.quiz : {};
            let id = m.chat;
            if (id in conn.quiz) {
                conn.reply(m.chat, '*⌫┇يـجـب أن يـتـم الاجـابـة عـلـي هـذا اولا قـبـل ارسـال سـؤال اخـر┇〄*', conn.quiz[id][0]);
                return;
            }

            const response = await fetch('https://bk9.fun/Islam//quizQuestions');
            const quizData = await response.json();

            if (!quizData.status) {
                throw new Error('Failed to fetch quiz data.');
            }

            const { question, answer_1, answer_2, answer_3, answer_4, right_answer } = quizData;

            const caption = `
*\`⊰┇${question}┇⊱\`*

*⊰┇◈ الـفـقـرة 🎮↜ ديـن┇⊱*
*✠ ━━ • ━ ‹✤› ━ • ━━ ✠* 
*【⚡┇الـوقـت ⟣ ${(timeout / 1000).toFixed(2)} 】* 
*【💰┇الـجـائـزة ⟣ 500 𝚡𝚙】* 
*【البوت:【𝐆𝐎𝐉𝐎⚡𝐁𝐎𝐓】 】*
*❐═━━━═╊⊰🐉⊱╉═━━━═❐*
> 𝙱𝚈┇ 𝐆𝐎𝐉𝐎⚡𝐁𝐎𝐓
            `.trim();

            await conn.relayMessage(m.chat, {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: {
                            header: {
                                title: '*❐═━━━═╊⊰🐉⊱╉═━━━═❐*'
                            },
                            body: {
                                text: caption
                            },
                            nativeFlowMessage: {
                                buttons: [
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: `{"display_text":"『1┇${answer_1}┇』","id":".answer_1"}`
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: `{"display_text":"『2┇${answer_2}┇』","id":".answer_2"}`
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: `{"display_text":"『3┇${answer_3}┇』","id":".answer_3"}`
                                    },
                                    {
                                        name: "quick_reply",
                                        buttonParamsJson: `{"display_text":"『4┇${answer_4}┇'}","id":".answer_4"}`
                                    }
                                ]
                            }
                        }
                    }
                }
            }, {});

            conn.quiz[id] = [
                quizData,
                500,
                setTimeout(async () => {
                    if (conn.quiz[id]) {
                        await conn.reply(m.chat, `*❐═━━━═╊⊰🐉⊱╉═━━━═❐*\n*『⌛┇انـتـهـي الـوقـت┇⌛』*\n\n*【✅┇الاجـابـة ⟣ ${quizData['answer_' + right_answer]} 】*\n*❐═━━━═╊⊰🐉⊱╉═━━━═❐*\n> *𝙱𝚈┇𝐆𝐎𝐉𝐎⚡𝐁𝐎𝐓*`, m);
                        delete conn.quiz[id];
                    }
                }, timeout),
                2 
            ];

        } catch (e) {
            console.error(e);
            conn.reply(m.chat, '*❐═━━━═╊⊰🐉⊱╉═━━━═❐*\n*⌫┇حـدث خـطـأ فـي عـمـلـية الإرسال┇〄*\n*❐═━━━═╊⊰🐉⊱╉═━━━═❐*', m);
        }
    }
};

handler.help = ['دين'];
handler.tags = ['game'];
handler.command = /^(دين|quiz|answer_\d)$/i;

export default handler;
