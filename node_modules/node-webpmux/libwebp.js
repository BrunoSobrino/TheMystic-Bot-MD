const libwebpF = require('./libwebp/libwebp.js');
const ranges = {
    preset: { n: 0, m: 5 },
    lossless: { n: 0, m: 9 },
    quality: { n: 0, m: 100 },
    method: { n: 0, m: 6 },
    exact: { n: 0, m: 1 }
  }, advranges = {
  imageHint: { n: 0, m: 3 },
  targetSize: undefined,
  targetPSNR: undefined,
  segments: { n: 1, m: 4 },
  snsStrength: { n: 0, m: 100 },
  filterStrength: { n: 0, m: 100 },
  filterSharpness: { n: 0, m: 7 },
  filterType: { n: 0, m: 1 },
  autoFilter: { n: 0, m: 1 },
  alphaCompression: { n: 0, m: 1 },
  alphaFiltering: { n: 0, m: 2 },
  alphaQuality: { n: 0, m: 100 },
  pass: { n: 1, m: 10 },
  showCompressed: { n: 0, m: 1 },
  preprocessing: { n: 0, m: 2 },
  partitions: { n: 0, m: 3 },
  partitionLimit: { n: 0, m: 100 },
  emulateJpegSize: { n: 0, m: 1 },
  threadLevel: { n: 0, m: 5 },
  lowMemory: { n: 0, m: 1 },
  nearLossless: { n: 0, m: 100 },
  useDeltaPalette: { n: 0, m: 1 },
  useSharpYUV: { n: 0, m: 1 },
  qMin: { n: 0, m: 100 },
  qMax: { n: 0, m: 100 }
};
function checkOpts(o) {
  for (let i = 0, keys = Object.keys(o), l = keys.length; i < l; i++) {
    let key = keys[i], r = ranges[key];
    if (!r) { continue; }
    if ((o[key] < r.n) || (o[key] > r.m)) { throw new Error(`${key} out of range ${r.n}..${r.m}`); }
  }
}
function checkAdv(adv) {
  for (let i = 0, keys = Object.keys(adv), l = keys.length; i < l; i++) {
    let key = keys[i], r = ranges[key];
    if (!r) { continue; }
    if ((adv[key] < r.n) || (adv[key] > r.m)) { throw new Error(`advanced.${key} out of range ${r.n}..${r.m}`); }
  }
}
module.exports = class libWebP {
  enc = 0;
  async init() {
    let Module = this.Module = await libwebpF();
    this.api = Module.WebPEnc;
    this.api.getResult = (e) => { return new Uint8Array(new Uint8Array(Module.HEAP8.buffer, e.getResult(), e.getResultSize())); };
    this.api.decodeRGBA = Module.cwrap('decodeRGBA', 'number', [ 'number', 'number' ]);
    this.api.decodeFree = Module.cwrap('decodeFree', '', [ 'number' ]);
    this.api.allocBuffer = Module.cwrap('allocBuffer', 'number', [ 'number' ]);
    this.api.destroyBuffer = Module.cwrap('destroyBuffer', '', [ 'number' ]);
  }
  initEnc() { if (!this.enc) { this.enc = new this.Module.WebPEnc(); } }
  destroyEnc() { if (this.enc) { this.enc.delete(); delete this.enc; } }
  encodeImage(data, width, height, { preset, lossless, quality, method, exact, advanced } = {}) {
    let { api, Module } = this, p, ret = {}, enc;
    this.initEnc();
    enc = this.enc;
    enc.init();
    checkOpts({ preset, lossless, quality, method, exact });
    if (preset != undefined) { enc.setPreset(preset); }
    if (lossless != undefined) { enc.setLosslessPreset(lossless); }
    if (quality != undefined) { enc.setQuality(quality); }
    if (method != undefined) { enc.setMethod(method); }
    if (exact != undefined) { enc.setExact(!!exact); }
    if (advanced != undefined) {
      checkAdv(advanced);
      if (advanced.imageHint != undefined) { enc.advSetImageHint(advanced.imageHint); }
      if (advanced.targetSize != undefined) { enc.advSetTargetSize(advanced.targetSize); }
      if (advanced.targetPSNR != undefined) { enc.advSetTargetPSNR(advanced.targetPSNR); }
      if (advanced.segments != undefined) { enc.advSetSegments(advanced.segments); }
      if (advanced.snsStrength != undefined) { enc.advSetSnsStrength(advanced.snsStrength); }
      if (advanced.filterStrength != undefined) { enc.advSetFilterStrength(advanced.filterStrength); }
      if (advanced.filterSharpness != undefined) { enc.advSetFilterSharpness(advanced.filterSharpness); }
      if (advanced.filterType != undefined) { enc.advSetFilterType(advanced.filterType); }
      if (advanced.autoFilter != undefined) { enc.advSetAutoFilter(advanced.autoFilter); }
      if (advanced.alphaCompression != undefined) { enc.advSetAlphaCompression(advanced.alphaCompression); }
      if (advanced.alphaFiltering != undefined) { enc.advSetAlphaFiltering(advanced.alphaFiltering); }
      if (advanced.alphaQuality != undefined) { enc.advSetAlphaQuality(advanced.alphaQuality); }
      if (advanced.pass != undefined) { enc.advSetPass(advanced.pass); }
      if (advanced.showCompressed != undefined) { enc.advSetShowCompressed(advanced.showCompressed); }
      if (advanced.preprocessing != undefined) { enc.advSetPreprocessing(advanced.preprocessing); }
      if (advanced.partitions != undefined) { enc.advSetPartitions(advanced.partitions); }
      if (advanced.partitionLimit != undefined) { enc.advSetPartitionLimit(advanced.partitionLimit); }
      if (advanced.emulateJpegSize != undefined) { enc.advSetEmulateJpegSize(advanced.emulateJpegSize); }
      if (advanced.threadLevel != undefined) { enc.advSetThreadLevel(advanced.threadLevel); }
      if (advanced.lowMemory != undefined) { enc.advSetLowMemory(advanced.lowMemory); }
      if (advanced.nearLossless != undefined) { enc.advSetNearLossless(advanced.nearLossless); }
      if (advanced.useDeltaPalette != undefined) { enc.advSetUseDeltaPalette(advanced.useDeltaPalette); }
      if (advanced.useSharpYUV != undefined) { enc.advSetUseSharpYUV(advanced.useSharpYUV); }
      if (advanced.qMin != undefined) { enc.advSetQMin(advanced.qMin); }
      if (advanced.qMax != undefined) { enc.advSetQMax(advanced.qMax); }
    }
    p = api.allocBuffer(data.length);
    Module.HEAP8.set(data, p);
    enc.loadRGBA(p, width, height);
    api.destroyBuffer(p);
    ret.res = enc.encode();
    if (ret.res == 0) { ret.buf = api.getResult(enc); }
    this.destroyEnc();
    return ret;
  }
  decodeImage(data, width, height) {
    let { api, Module } = this, p, ret;
    let np = api.allocBuffer(data.length);
    Module.HEAP8.set(data, np);
    let bp = api.decodeRGBA(np, data.length);
    ret = new Uint8Array(new Uint8Array(Module.HEAP8.buffer, bp, width * height * 4));
    api.decodeFree(bp);
    api.destroyBuffer(np);
    return ret;
  }
};
