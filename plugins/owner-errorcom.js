/* Generar error */
const handler = async (m, {conn, command}) => {
  console.log(XDDDDDDDDD);
  new Error('This is an error');
};
handler.command = /^(handerror)$/i;
handler.owner = true;
export default handler; 
