/*

⚠ PROHIBIDO EDITAR ⚠ -- ⚠ PROHIBIDO EDITAR ⚠ -- ⚠ PROHIBIDO EDITAR ⚠

El codigo de este archivo fue realizado por:
- ReyEndymion (https://github.com/ReyEndymion)

⚠ PROHIBIDO EDITAR ⚠ -- ⚠ PROHIBIDO EDITAR ⚠ -- ⚠ PROHIBIDO EDITAR ⚠

*/

function _0x7d77(_0x3884d3, _0x297cf0) {
  const _0x5346a4=_0x5346(); return _0x7d77=function(_0x7d7709, _0x34044c) {
    _0x7d7709=_0x7d7709-0x1b0; const _0x2ead54=_0x5346a4[_0x7d7709]; return _0x2ead54;
  }, _0x7d77(_0x3884d3, _0x297cf0);
} const _0xe8344c=_0x7d77; function _0x5346() {
  const _0x2ebb89=['error', 'help', '24jWtTwj', 'command', '*[❗]\x20Adiós\x20Bot,\x20haz\x20dejado\x20de\x20ser\x20un\x20Bot*', 'fromMe', 'split', '6858gzqVbM', 'La\x20carpeta\x20o\x20archivo\x20de\x20sesion\x20no\x20existen\x20', 'jid', '50TGXqLs', '*[❗]\x20Use\x20este\x20comando\x20directamente\x20en\x20el\x20numero\x20del\x20Bot\x20principal*', '443584xjTIxm', 'deletebot', '79052UoJUol', '3857359pKoOWl', 'sendMessage', './jadibts/', '28btHpPP', '190emRVsT', '42Qwxenc', '1893708Sdldqv', 'jadibot', 'conn', '1133253ZlNWaF', 'chat', 'mentionedJid', '4686144IHEtEb', 'user']; _0x5346=function() {
    return _0x2ebb89;
  }; return _0x5346();
}(function(_0x384d26, _0x49a7ad) {
  const _0x2aada2=_0x7d77; const _0x57b362=_0x384d26(); while ([]) {
    try {
      const _0x2d3954=parseInt(_0x2aada2(0x1c8))/0x1*(parseInt(_0x2aada2(0x1bd))/0x2)+parseInt(_0x2aada2(0x1cb))/0x3+-parseInt(_0x2aada2(0x1c4))/0x4*(parseInt(_0x2aada2(0x1c9))/0x5)+parseInt(_0x2aada2(0x1b4))/0x6+parseInt(_0x2aada2(0x1ca))/0x7*(-parseInt(_0x2aada2(0x1c2))/0x8)+-parseInt(_0x2aada2(0x1b1))/0x9*(parseInt(_0x2aada2(0x1c0))/0xa)+parseInt(_0x2aada2(0x1c5))/0xb*(parseInt(_0x2aada2(0x1b8))/0xc); if (_0x2d3954===_0x49a7ad) break; else _0x57b362['push'](_0x57b362['shift']());
    } catch (_0x2f0510) {
      _0x57b362['push'](_0x57b362['shift']());
    }
  }
}(_0x5346, 0x792d7)); import {readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as _0x3872c8} from 'fs'; import _0x2ef42a, {join} from 'path'; const handler=async (_0x25b602, {conn: _0x191f72}, _0x136d85)=>{
  const _0x58c72f=_0x7d77; const _0x29ea36=_0x191f72; const _0x109b85=_0x25b602[_0x58c72f(0x1b3)]&&_0x25b602[_0x58c72f(0x1b3)][0x0]?_0x25b602[_0x58c72f(0x1b3)][0x0]:_0x25b602[_0x58c72f(0x1bb)]?_0x191f72[_0x58c72f(0x1b5)]['jid']:_0x25b602['sender']; const _0x2ff9d9=''+_0x109b85[_0x58c72f(0x1bc)]`@`[0x0]; if (global[_0x58c72f(0x1b0)][_0x58c72f(0x1b5)][_0x58c72f(0x1bf)]!==_0x191f72['user'][_0x58c72f(0x1bf)]) return _0x191f72[_0x58c72f(0x1c6)](_0x25b602[_0x58c72f(0x1b2)], {'text': _0x58c72f(0x1c1)}, {'quoted': _0x25b602}); else await _0x191f72['sendMessage'](_0x25b602['chat'], {'text': _0x58c72f(0x1ba)}, {'quoted': _0x25b602}); try {
    _0x3872c8['rmdir'](_0x58c72f(0x1c7)+_0x2ff9d9, {'recursive': !![], 'force': !![]}), await _0x191f72[_0x58c72f(0x1c6)](_0x25b602[_0x58c72f(0x1b2)], {'text': '*[❗]\x20Todos\x20los\x20archivos\x20de\x20session\x20fueron\x20eliminados*'}, {'quoted': _0x25b602});
  } catch (_0xe7bf34) {
    console[_0x58c72f(0x1b6)](_0x58c72f(0x1be), _0xe7bf34);
  }
}; handler[_0xe8344c(0x1b7)]=[_0xe8344c(0x1c3)], handler['tags']=[_0xe8344c(0x1cc)], handler[_0xe8344c(0x1b9)]=/^(deletebot|aa2)$/i, handler['private']=!![], handler['fail']=null; export default handler;
