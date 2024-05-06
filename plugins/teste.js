import fs from 'fs'

async function teste(){
    fs.writeFileSync('./tmp/file1', '')
}

teste()