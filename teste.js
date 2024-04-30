import { createCanvas, loadImage } from 'canvas'
import fs from 'fs'

// Configurações do mapa
const largura = 800;
const altura = 600;

// Criar um canvas com as dimensões do mapa
const canvas = createCanvas(largura, altura);
const context = canvas.getContext('2d');

// Carregar a imagem de fundo do mapa
loadImage('./src/glx/fundomapa.jpg').then((imagemMapa) => {
  // Desenhar a imagem de fundo do mapa
  context.drawImage(imagemMapa, 0, 0, largura, altura);

   // COLONIA 1
  const xInicio =  300; // Inicio da linha Horizontal da esquerda para direita
  const xFim = 400; // Inicio da linha Horizontal da esquerda para direita
  const yInicio = 160; // inicio da linha vertical de cima para baixo 
  const yFim = 260; // Fim da linha vertical de cima para baixo 
  const larguraBorda = 3;
  context.strokeStyle = 'red'; // Cor da borda
  context.lineWidth = larguraBorda;
  context.strokeRect(xInicio, yInicio, xFim - xInicio, yFim - yInicio);

  
  // Função para desenhar uma caixa de texto com cantos arredondados
  function drawRoundRect(x, y, largura, altura, raio, corFundo, corBorda, opacidade) {
    context.beginPath();
    context.moveTo(x + raio, y);
    context.arcTo(x + largura, y, x + largura, y + altura, raio);
    context.arcTo(x + largura, y + altura, x, y + altura, raio);
    context.arcTo(x, y + altura, x, y, raio);
    context.arcTo(x, y, x + largura, y, raio);
    context.closePath();
    context.fillStyle = `rgba(255, 255, 255, ${opacidade})`; // Fundo branco quase transparente
    context.strokeStyle = corBorda;
    context.lineWidth = 1;
    context.fill();
    context.stroke();
  }

  // Títulos das cidades
  const titulosCidades = [
    { nome: ' 📍- COLONIA 1', x: 380, y: 210 },
    { nome: ' 📍- COLONIA 2', x: 80, y: 130 },
    { nome: ' 📍- COLONIA 3', x: 570, y: 400 },
    // Adicione mais títulos conforme necessário
  ];

  // Desenhar os títulos das cidades
  context.fillStyle = 'red'; // Cor das letras
  context.font = 'bold 18px Arial'; // Estilo da fonte
  titulosCidades.forEach(titulo => {
    // Determinar a largura do texto para centralizá-lo na caixa
    const larguraTexto = context.measureText(titulo.nome).width;
    // Desenhar a caixa de texto com cantos arredondados
    drawRoundRect(titulo.x - larguraTexto / 2 - 5, titulo.y - 20, larguraTexto + 10, 30, 5, 'white', 'white', 0.3); // Opacidade de 70%
     // Definir a cor do texto como marrom
     context.fillStyle = 'brown';
     context.arc(titulosCidades.x, titulosCidades.y, 5, 0, Math.PI * 3);
    // Escrever o texto dentro da caixa
    context.fillText(titulo.nome, titulo.x - larguraTexto / 2, titulo.y);
  });

  // Salvar o mapa como uma imagem
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('mapa_com_posicoes.png', buffer);
}).catch((error) => {
  console.error('Erro ao carregar imagem do mapa:', error);
});
