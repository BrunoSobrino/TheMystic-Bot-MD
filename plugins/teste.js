// testes

const handler = async (m, { args, usedPrefix, command }) => {


const data = global.db.data.users[m.sender]
console.log(data)


};
handler.command = /^(teste)$/i;
export default handler;
