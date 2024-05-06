
import simpleGit from 'simple-git'

// Caminho para o diretório do seu repositório local
const repoPath = '.';

// Instanciar o objeto simple-git com o caminho do seu repositório
const git = simpleGit(repoPath);

// Atualizar o repositório
git.pull((err, update) => {
  if (err) {
    console.error('Ocorreu um erro ao atualizar o repositório:', err);
  } else {
    if (update && update.summary.changes) {
      console.log('Repositório atualizado com sucesso!');
      console.log('Resumo das alterações:', update.summary);
    } else {
      console.log('O repositório já está atualizado.');
    }
  }
});