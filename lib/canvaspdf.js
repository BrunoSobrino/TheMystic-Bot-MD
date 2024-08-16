/*import { promises as fs } from 'fs';
import { Image, createCanvas, loadImage, PDFDocument } from 'canvas';
import path from 'path';

const tmpDir = path.resolve('./tmp');

// Crea la carpeta tmp si no existe
await fs.mkdir(tmpDir, { recursive: true });

const generateShortId = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Genera un número aleatorio de 4-6 dígitos
};

const createPDFDocument = async () => {
  const pdfId = generateShortId();
  const pdfPath = path.join(tmpDir, `${pdfId}.pdf`);

  const canvas = createCanvas(612, 792, 'pdf');
  const ctx = canvas.getContext('2d');

  const buff = canvas.toBuffer('application/pdf');
  await fs.writeFile(pdfPath, buff);

  return { pdfId, pdfPath, canvas, ctx };
};

const addImageToPDF = async (pdfId, imageUrl) => {
  const pdfPath = path.join(tmpDir, `${pdfId}.pdf`);

  // Verificar si el PDF ya existe
  if (!await fs.access(pdfPath).then(() => true).catch(() => false)) {
    throw new Error('PDF not found');
  }

  const existingBuffer = await fs.readFile(pdfPath);
  const existingDoc = await PDFDocument.load(existingBuffer);

  // Crear una nueva página en el PDF existente
  const canvas = createCanvas(612, 792);
  const ctx = canvas.getContext('2d');

  const image = await loadImage(imageUrl);

  // Calcular las dimensiones para que la imagen ocupe todo el lienzo manteniendo la proporción
  const { width: imgWidth, height: imgHeight } = image;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  let drawWidth, drawHeight, offsetX, offsetY;
  const imgAspectRatio = imgWidth / imgHeight;
  const canvasAspectRatio = canvasWidth / canvasHeight;

  if (imgAspectRatio > canvasAspectRatio) {
    drawWidth = canvasWidth;
    drawHeight = drawWidth / imgAspectRatio;
    offsetX = 0;
    offsetY = (canvasHeight - drawHeight) / 2;
  } else {
    drawHeight = canvasHeight;
    drawWidth = drawHeight * imgAspectRatio;
    offsetX = (canvasWidth - drawWidth) / 2;
    offsetY = 0;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  // Convertir el canvas a una imagen para añadirla como nueva página en el PDF
  const imgBuffer = canvas.toBuffer('image/png');
  const imgPdfDoc = await PDFDocument.create();
  const imgPdfPage = imgPdfDoc.addPage([canvasWidth, canvasHeight]);
  const imgEmbed = await imgPdfDoc.embedPng(imgBuffer);

  imgPdfPage.drawImage(imgEmbed, {
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
  });

  const imgPdfBuffer = await imgPdfDoc.save();
  const imgPdfToAdd = await PDFDocument.load(imgPdfBuffer);

  const newPdfDoc = await PDFDocument.create();
  const copiedPages = await newPdfDoc.copyPages(existingDoc, existingDoc.getPageIndices());
  copiedPages.forEach((page) => newPdfDoc.addPage(page));

  const [newImgPage] = await newPdfDoc.copyPages(imgPdfToAdd, [0]);
  newPdfDoc.addPage(newImgPage);

  const finalBuffer = await newPdfDoc.save();

  await fs.writeFile(pdfPath, finalBuffer);

  return { status: true, pdf_id: pdfId, result: { title: 'Image PDF', url: pdfPath } };
};

export { createPDFDocument, addImageToPDF };*/
