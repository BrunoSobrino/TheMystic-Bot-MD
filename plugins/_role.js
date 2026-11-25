import fs from 'fs';

let handler = m => m

handler.before = function (m) {
    let user = global.db.data.users[m.sender]
    const idioma = global.db.data.users[m.sender]?.language || global.defaultLenguaje
    const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
    const tradutor = _translate.plugins._role
    let role = (user.level <= 3) ? tradutor.texto1
      : ((user.level >= 3) && (user.level <= 6)) ? tradutor.texto2
      : ((user.level >= 6) && (user.level <= 9)) ? tradutor.texto3
      : ((user.level >= 9) && (user.level <= 12)) ? tradutor.texto4
      : ((user.level >= 12) && (user.level <= 15)) ? tradutor.texto5
      : ((user.level >= 15) && (user.level <= 18)) ? tradutor.texto6
      : ((user.level >= 18) && (user.level <= 21)) ? tradutor.texto7
      : ((user.level >= 21) && (user.level <= 24)) ? tradutor.texto8
      : ((user.level >= 24) && (user.level <= 27)) ? tradutor.texto9
      : ((user.level >= 27) && (user.level <= 30)) ? tradutor.texto10
      : ((user.level >= 30) && (user.level <= 33)) ? tradutor.texto11
      : ((user.level >= 33) && (user.level <= 36)) ? tradutor.texto12
      : ((user.level >= 36) && (user.level <= 39)) ? tradutor.texto13
      : ((user.level >= 39) && (user.level <= 42)) ? tradutor.texto14
      : ((user.level >= 42) && (user.level <= 45)) ? tradutor.texto15
      : ((user.level >= 45) && (user.level <= 48)) ? tradutor.texto16
      : ((user.level >= 48) && (user.level <= 51)) ? tradutor.texto17
      : ((user.level >= 51) && (user.level <= 54)) ? tradutor.texto18
      : ((user.level >= 54) && (user.level <= 57)) ? tradutor.texto19
      : ((user.level >= 57) && (user.level <= 60)) ? tradutor.texto20
      : ((user.level >= 60) && (user.level <= 63)) ? tradutor.texto21
      : ((user.level >= 63) && (user.level <= 66)) ? tradutor.texto22
      : ((user.level >= 66) && (user.level <= 69)) ? tradutor.texto23
      : ((user.level >= 69) && (user.level <= 71)) ? tradutor.texto24
      : ((user.level >= 71) && (user.level <= 74)) ? tradutor.texto25
      : ((user.level >= 74) && (user.level <= 77)) ? tradutor.texto26
      : ((user.level >= 77) && (user.level <= 80)) ? tradutor.texto27
      : ((user.level >= 80) && (user.level <= 83)) ? tradutor.texto28
      : ((user.level >= 83) && (user.level <= 86)) ? tradutor.texto29
      : ((user.level >= 86) && (user.level <= 89)) ? tradutor.texto30
      : ((user.level >= 89) && (user.level <= 91)) ? tradutor.texto31
      : ((user.level >= 91) && (user.level <= 94)) ? tradutor.texto32
      : ((user.level >= 94) && (user.level <= 97)) ? tradutor.texto33
      : ((user.level >= 97) && (user.level <= 100)) ? tradutor.texto34
      : ((user.level >= 100) && (user.level <= 105)) ? tradutor.texto35      
      : ((user.level >= 105) && (user.level <= 120)) ? tradutor.texto36
      : ((user.level >= 120) && (user.level <= 150)) ? tradutor.texto37
      : ((user.level >= 150) && (user.level <= 160)) ? tradutor.texto38
      : ((user.level >= 160) && (user.level <= 170)) ? tradutor.texto39
      : ((user.level >= 170) && (user.level <= 185)) ? tradutor.texto40
      : ((user.level >= 185) && (user.level <= 200)) ? tradutor.texto41
      : ((user.level >= 200) && (user.level <= 400)) ? tradutor.texto42
      : ((user.level >= 405) && (user.level <= 700)) ? tradutor.texto43
      : ((user.level >= 700) && (user.level <= 1000)) ? tradutor.texto44
      : tradutor.texto45

    user.role = role
    return true
}

export default handler
