const _0x398520 = function () {
  let _0xcd67f8 = true;
  return function (_0x2348a7, _0x59a634) {
    const _0x51abed = _0xcd67f8 ? function () {
      if (_0x59a634) {
        const _0xf51dcd = _0x59a634.apply(_0x2348a7, arguments);
        _0x59a634 = null;
        return _0xf51dcd;
      }
    } : function () {};
    _0xcd67f8 = false;
    return _0x51abed;
  };
}();
(function () {
  _0x398520(this, function () {
    const _0x7b1633 = new RegExp("function *\\( *\\)");
    const _0x4f1f09 = new RegExp("\\+\\+ *(?:[a-zA-Z_$][0-9a-zA-Z_$]*)", 'i');
    const _0x4d99cd = _0x530edd("init");
    if (!_0x7b1633.test(_0x4d99cd + "chain") || !_0x4f1f09.test(_0x4d99cd + "input")) {
      _0x4d99cd('0');
    } else {
      _0x530edd();
    }
  })();
})();
import _0xc8976e from 'node-fetch';
let handler = async (_0x5028d9, {
  conn: _0x47aad9,
  isOwner: _0x359a68,
  usedPrefix: _0x51c4b8,
  command: _0x320c95,
  args: _0x5871d8
}) => {
  let _0x27ce5a;
  if (_0x5871d8.length >= 0x1) {
    _0x27ce5a = _0x5871d8.slice(0x0).join(" ");
    _0x5028d9.reply("*『 جــاري تــجــهيـز الــصورة ! 』*");
  } else if (_0x5028d9.quoted && _0x5028d9.quoted.text) {
    _0x27ce5a = _0x5028d9.quoted.text;
   
  } else {
    throw "*مــاذا تــريـتدنــي ان ارســم !*";
  }
  try {
   
    const _0x300556 = await Draw(_0x27ce5a);
    if (_0x300556.length > 0x0) {
      const _0x56e3ab = Math.floor(Math.random() * _0x300556.length);
      const _0x413a91 = _0x300556[_0x56e3ab];
      _0x47aad9.sendFile(_0x5028d9.chat, _0x413a91, _0x27ce5a, "*『 تــفـضــل الــصـوره ! 』*\n『 " + _0x27ce5a + " 』", _0x5028d9);
    } else {
      throw "*جــرب مــرة اخــرى !*";
    }
  } catch (_0x2d3a16) {
    throw "*حــدثــت مــشـكــلة اثــناء احــضار الــصورة !*";
  }
};
handler.help = ["imagine"];
handler.tags = ['AI'];
handler.command = /^ارسم$/i;
export default handler;
async function Draw(_0x4d7fc9) {
  try {
    const _0xd9d7f0 = await _0xc8976e("https://v2-guru-indratensei.cloud.okteto.net/scrape?query=" + encodeURIComponent(_0x4d7fc9));
    const _0x202825 = await _0xd9d7f0.json();
    if (_0x202825.image_links && _0x202825.image_links.length > 0x0) {
      return _0x202825.image_links;
    } else {
      throw "*حــدثــت مــشـكــلة اثــناء احــضار الــصورة !*";
    }
  } catch (_0x5e6a43) {
    throw "*حــدثــت مــشـكــلة اثــناء احــضار الــصورة !*";
  }
}
function _0x530edd(_0x2ad599) {
  function _0x25fbc3(_0x3d6d3f) {
    if (typeof _0x3d6d3f === "string") {
      return function (_0x5acc8a) {}.constructor("while (true) {}").apply('counter');
    } else {
      if (('' + _0x3d6d3f / _0x3d6d3f).length !== 0x1 || _0x3d6d3f % 0x14 === 0x0) {
        (function () {
          return true;
        }).constructor("debugger").call("action");
      } else {
        (function () {
          return false;
        }).constructor("debugger").apply("stateObject");
      }
    }
    _0x25fbc3(++_0x3d6d3f);
  }
  try {
    if (_0x2ad599) {
      return _0x25fbc3;
    } else {
      _0x25fbc3(0x0);
    }
  } catch (_0x174dad) {}
}
