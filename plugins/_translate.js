import fs from "fs";
import path from 'path'

function _language(){
    const config  = JSON.parse(fs.readFileSync(`./config.json`))
    
    //Consulta ao arquivo de tradução, conforme no arquivo config
    const result = JSON.parse(fs.readFileSync(`./language/${config.language}.json`))
    
   return result;
   


}


export default _language()
