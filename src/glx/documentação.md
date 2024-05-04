# Funções do jogo

createDataBase() - Função que cria o banco de dados, do game glx!

criarGrupo() - Esta função, geralmente fica no inicio do game, para verificar se os grupos para o usuario jogar esta em confições e se foi criado corretamente, caso contrario esta propria função ja gera os grupo, e adiciona os usuarios.

verificacaoAdmin() -  Verificar se o Bot esta como administrador em algum grupo, só precisa passar o id 

entrarplaneta() - Esta função faz a parte de adicionar o usuario em um novo grupo, e aguardar o tempo necessario para retirar ele, e deixar o usuario somente no grupo que é a casa do jogador.

minerar() - Função que faz toda a logica de mineração do game, adiciona xp, minera itens, e outras funcionalidades dentro dela.

comprarnave() - Esta função é usada para fazer a operação de comprar um item, no caso uma nave etc.. ela é responsavel pelas operações financeiras, e logica  de comprar um item e adicionar na mochila, ou bau.

vender() - Função criada para Vender itens, que foram minerado e etc..

verificacaoXp() - Função criada para verificar se o usuario atingiu um determinado xp de jogabilidade, se sim, ele altera os valores para um novo nivel, e adiciona a nova meta.

imagemPerfil() - Cria a Imagem de perfil do usuario
 
mapa() - A função mapa, gera um mapa marcando as colonias, e posições em que cada usuario esta. OBS somente para o planeta que o usuario solicitante for padrão ou Casa do jogador.

cadastrarPosicaoNoMapa() - Função que cadastra a posição de um jogador, em um planeta. Neste caso como padrão esta a terra.

verificarPosicaoDb(xx, yy, planeta, colonia) Verifica se uma posição ja esta cadastrada no mapa, do planeta que o usuario esta.



enviar10s() - Usado para enviar mensagens descartaveis. após 10 segundos ela apaga e pronto

enviar() Função usada para enviar um texto com imagens, e com um simbolo do whatsapp no cabeçalho

valorFormatado() - Converte um valor, na moeda do pais que o Jogado definir por exemplo, BRL, Real Brasileiro.

fNumeroAleatorio() - Gera um numero aleatorio, entre os valores que for passado


