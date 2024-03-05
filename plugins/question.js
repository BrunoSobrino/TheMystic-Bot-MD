import _0x558a5f from 'fs';
let handler = async (_0x41441c, {
  conn: _0x35b462,
  usedPrefix: _0x4f81af
}) => {
  _0x35b462.tekateki = _0x35b462.tekateki ? _0x35b462.tekateki : {};
  let _0x2be468 = _0x41441c.chat;
  if (_0x2be468 in _0x35b462.tekateki) {
    _0x35b462.reply(_0x41441c.chat, "*❪مــازال هــنـاك سـؤال لــم يــجـاب !❫*", _0x35b462.tekateki[_0x2be468][0x0]);
    throw false;
  }
  let _0x3dfc1e = JSON.parse(_0x558a5f.readFileSync("./src/game/acertijo.json"));
  let _0x3178d5 = _0x3dfc1e[Math.floor(Math.random() * _0x3dfc1e.length)];
  let _0x57b192 = ("\n\u2DEE *" + _0x3178d5.question + "*\n\n*❏↜ ┋ الــوقت : " + 60 .toFixed(0x2) + "┋*\n*❏↜ ┋ الـجـائــزة : " + 0x1f4 + " ┋*").trim();
  _0x35b462.tekateki[_0x2be468] = [await _0x35b462.reply(_0x41441c.chat, _0x57b192, _0x41441c), _0x3178d5, 0x1f4, setTimeout(async () => {
    if (_0x35b462.tekateki[_0x2be468]) {
      await _0x35b462.reply(_0x41441c.chat, "*⟐─── ◟ ─── 🥀 ─── ◝ ───⟐*\n*انــتـهى الــوقــت !*\n*❍ الإجابـة ↜ ✅ :" + _0x3178d5.response + '*\n*⟐─── ◟ ─── 🥀 ─── ◝ ───⟐*', _0x35b462.tekateki[_0x2be468][0x0]);
    }
    delete _0x35b462.tekateki[_0x2be468];
  }, 0xea60)];
};
handler.help = ["acertijo"];
handler.tags = ['game'];
handler.command = /^(اسألني|اسالني)$/i;
export default handler;
