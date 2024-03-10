import _translate from "./plugins/_translate.js"

async function teste(){
    const  tradutor = _translate.plugins._antiarab
    console.log(tradutor.texto1)
}
teste()