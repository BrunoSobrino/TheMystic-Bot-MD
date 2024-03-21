import fs from "fs";
import path from 'path'
 // Para configurar o idioma, na raiz do projeto altere o arquivo config.json
  // Para configurar el idioma, en la raíz del proyecto, modifique el archivo config.json.
  // To set the language, in the root of the project, modify the config.json file.

function _language(){
    const config  = JSON.parse(fs.readFileSync(`./config.json`))
    
    //Consulta ao arquivo de tradução, conforme no arquivo config
    const result = JSON.parse(fs.readFileSync(`./language/${config.language}.json`))
    
   return result;
   


}


export default _language()
