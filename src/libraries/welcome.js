import {DOMImplementation, XMLSerializer} from 'xmldom';
import JsBarcode from 'jsbarcode';
import {JSDOM} from 'jsdom';
import {readFileSync} from 'fs';
import {join} from 'path';
import {spawn} from 'child_process';

const src = join(__dirname, '..', 'src');
const _svg = readFileSync(join(src, 'welcome.svg'), 'utf-8');
const barcode = (data) => {
  const xmlSerializer = new XMLSerializer();
  const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  JsBarcode(svgNode, data, {
    xmlDocument: document,
  });

  return xmlSerializer.serializeToString(svgNode);
};

const textSetter = (el, value) => el.textContent = value;

const {document: svg} = new JSDOM(_svg).window;
/**
 * Generate SVG Welcome
 * @param {object} param0
 * @param {string} param0.wid
 * @param {string} param0.name
 * @param {string} param0.text
 * @param {string} param0.title
 * @return {string}
 */
const genSVG = async ({
  wid = '',
  title = '',
  name = '',
  text = '',
} = {}) => {
  const el = {
    code: ['#_1661899539392 > text.barcode', textSetter, barcode(wid.replace(/[^0-9]/g, ''))],
    text: ['#_1661899539392 > text.fil1.fnt0', textSetter, text],
    title: ['#_1661899539392 > text.fil2.fnt1', textSetter, title],
    name: ['#_1661899539392 > text.fil2.fnt2', textSetter, name],
  };
  for (const [selector, set, value] of Object.values(el)) {
    set(svg.querySelector(selector), value);
  }
  return svg.body.innerHTML;
};

if (require.main === module) {
  genSVG({
    wid: '1234567890',
    name: 'John Doe',
    text: 'Lorem ipsum\ndot sit color',
    title: 'Group Testing',
  }).then((result) => {
    // console.log(result)
    process.stdout.write(result);
  });
} else module.exports = genSVG;
