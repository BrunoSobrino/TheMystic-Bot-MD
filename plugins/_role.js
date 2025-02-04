const handler = (m) => m;

handler.before = function(m) {
  const user = global.db.data.users[m.sender];
  const role = (user.level <= 3) ? 'Guerrero V' :
      ((user.level >= 3) && (user.level <= 6)) ? 'Guerrero IV' :
      ((user.level >= 6) && (user.level <= 9)) ? 'Guerrero III' :
      ((user.level >= 9) && (user.level <= 12)) ? 'Guerrero II' :
      ((user.level >= 12) && (user.level <= 15)) ? 'Guerrero I' :
      ((user.level >= 15) && (user.level <= 18)) ? 'Élite V' :
      ((user.level >= 18) && (user.level <= 21)) ? 'Élite IV' :
      ((user.level >= 21) && (user.level <= 24)) ? 'Élite III' :
      ((user.level >= 24) && (user.level <= 27)) ? 'Élite II' :
      ((user.level >= 27) && (user.level <= 30)) ? 'Élite I' :
      ((user.level >= 30) && (user.level <= 33)) ? 'Maestros V' :
      ((user.level >= 33) && (user.level <= 36)) ? 'Maestros IV' :
      ((user.level >= 36) && (user.level <= 39)) ? 'Maestros III' :
      ((user.level >= 39) && (user.level <= 42)) ? 'Maestros II' :
      ((user.level >= 42) && (user.level <= 45)) ? 'Maestros I' :
      ((user.level >= 45) && (user.level <= 48)) ? 'Gran Maestro V' :
      ((user.level >= 48) && (user.level <= 51)) ? 'Gran Maestro IV' :
      ((user.level >= 51) && (user.level <= 54)) ? 'Gran Maestro III' :
      ((user.level >= 54) && (user.level <= 57)) ? 'Gran Maestro II' :
      ((user.level >= 57) && (user.level <= 60)) ? 'Gran Maestro I' :
      ((user.level >= 60) && (user.level <= 63)) ? 'Épico V' :
      ((user.level >= 63) && (user.level <= 66)) ? 'Épico IV' :
      ((user.level >= 66) && (user.level <= 69)) ? 'Épico III' :
      ((user.level >= 69) && (user.level <= 71)) ? 'Épico II' :
      ((user.level >= 71) && (user.level <= 74)) ? 'Épico I' :
      ((user.level >= 74) && (user.level <= 77)) ? 'Leyenda V' :
      ((user.level >= 77) && (user.level <= 80)) ? 'Leyenda IV' :
      ((user.level >= 80) && (user.level <= 83)) ? 'Leyenda III' :
      ((user.level >= 83) && (user.level <= 86)) ? 'Leyenda II' :
      ((user.level >= 86) && (user.level <= 89)) ? 'Leyenda I' :
      ((user.level >= 89) && (user.level <= 91)) ? 'Mítico V' :
      ((user.level >= 91) && (user.level <= 94)) ? 'Mítico IV' :
      ((user.level >= 94) && (user.level <= 97)) ? 'Mítico III' :
      ((user.level >= 97) && (user.level <= 100)) ? 'Mítico II' :
      ((user.level >= 100) && (user.level <= 105)) ? 'Mítico I' :
      ((user.level >= 105) && (user.level <= 120)) ? 'Gloria Mítica' :
      ((user.level >= 120) && (user.level <= 150)) ? 'Esmeralda V' :
      ((user.level >= 150) && (user.level <= 160)) ? 'Esmeralda VI' :
      ((user.level >= 160) && (user.level <= 170)) ? 'Esmeralda III' :
      ((user.level >= 170) && (user.level <= 185)) ? 'Esmeralda II' :
      ((user.level >= 185) && (user.level <= 200)) ? 'Esmeralda I' :
      ((user.level >= 200) && (user.level <= 400)) ? 'Titan III' :
      ((user.level >= 405) && (user.level <= 700)) ? 'Titan II' :
      ((user.level >= 700) && (user.level <= 1000)) ? 'Titan I' :
      'Dragón rey estrella';

  user.role = role;
  return true;
};

export default handler;
