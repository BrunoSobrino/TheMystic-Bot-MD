<p align="center">
 <img width="180px" src="https://i.ibb.co/Qn1W6cP/image.png" align="center"/>
 <h2 align="center">TheMystic-Bot-MD</h2>
 <p align="center">DEPRECATED | PROJETO DESATUALIZADO.</p>
 <p align="center">Um bot automatizado para a plataforma WhatsApp, baseado especialmente em Node.js, que permite realizar múltiplas funções e personalizações na plataforma.</p>
</p>

<p align="center">
  <a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD/graphs/contributors">
    <img alt="GitHub Contributors" src="https://img.shields.io/github/contributors/BrunoSobrino/TheMystic-Bot-MD?style=for-the-badge" />
  </a>
  <a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD/issues">
    <img alt="GitHub Issues" src="https://img.shields.io/github/issues/BrunoSobrino/TheMystic-Bot-MD?style=for-the-badge" />
  </a>
  <a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD/pulls">
    <img alt="GitHub Pull Requests" src="https://img.shields.io/github/issues-pr/BrunoSobrino/TheMystic-Bot-MD?style=for-the-badge" />
  </a>
  <a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD/commits">
    <img alt="GitHub Commits" src="https://img.shields.io/github/commit-activity/m/BrunoSobrino/TheMystic-Bot-MD?style=for-the-badge" />
  </a>
  <a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD">
    <img alt="GitHub Stars" src="https://img.shields.io/github/stars/BrunoSobrino/TheMystic-Bot-MD?style=for-the-badge" />
  </a>
  <a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD/fork">
    <img alt="GitHub Forks" src="https://img.shields.io/github/forks/BrunoSobrino/TheMystic-Bot-MD?style=for-the-badge" />
  </a>
</p>

<p align="center">
  <a href="https://api.whatsapp.com/send?phone=+5219992843881&text=&text=.menu">Demonstração</a>
  ·
  <a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD/issues/new?assignees=&labels=Bug">Reportar um erro</a>
  ·
  <a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD/issues/new?assignees=&labels=Enhancement">Solicitar um recurso</a>
</p>

<!-- <p align="center">
  <a href="/src/docs/README_en.md">English</a>
  ·
  <a href="/src/docs/README_pt-br.md">Português</a>
</p> -->

<p align="center">Ajude a manter nosso projeto ativo com sua <a href="https://www.paypal.me/BrunoSob">doação</a> e contribua para melhorar as funções do bot para todos!</p>

# Implantação, Suporte e Comunidade
- [Instalação e Execução Local](#instalação-e-execução-local)
- [Contribuir](#contribuir)
- [Opções de Implantação](#opções-de-implantação)
  - [Implantação na Cafirexos](#implantação-na-cafirexos)
  - [Implantação na BoxMineWorld](#implantação-na-boxmineworld)
  - [Implantação em Outros](#implantação-em-outras-plataformas)
- [Suporte e Comunidade](#suporte-e-comunidade)
  - [Comunidades de Ajuda](#guia-de-uso)
  - [Colaboradores](#colaboradores)
  - [Agradecimentos](#agradecimentos)
  - [Desenvolvedor Principal](#desenvolvedor-principal)

> ◇ **Nota:** estamos cientes de que **existem** diferentes lugares que **não são oficiais** ou **não têm relação nem participação** com nosso projeto. Para manter a **segurança** dos nossos **usuários**, compartilhamos os lugares **oficiais** onde você poderá usar **nosso bot**, **receber assistência**, entre outros termos de **utilidade ou funcionalidade** do bot.

# Avisos Importantes

> [!IMPORTANT]\
> Este projeto **não é afiliado, endossado nem associado de nenhuma forma** com a plataforma `WhatsApp`. A plataforma `WhatsApp` é uma subsidiária registrada da `Meta Platforms Inc.`. Este bot é um **desenvolvimento independente** e **não tem nenhuma relação oficial com a empresa**.

> [!IMPORTANT]\
> não é garantido que este **projeto funcione corretamente** devido a questões de tempo pessoais de [Bruno Sobrino](https://github.com/BrunoSobrino), por isso **este projeto está em desenvolvimento por parte dos colaboradores** e usuários que desejarem contribuir com **atualizações**.


# Instalação e Execução Local

### Pré-requisitos

- **Node.js** 18 ou superior (com npm incluído).
- **ffmpeg** instalado no sistema (necessário para conversões de áudio e vídeo). No Windows, instale com `winget install ffmpeg`; no Linux/Debian, com `sudo apt install ffmpeg`; no Android/Termux, com `pkg install ffmpeg`.

### Passo a passo

1. Clone o repositório:

   ```bash
   git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git
   cd TheMystic-Bot-MD
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

   > Se aparecerem erros relacionados ao `puppeteer`, você pode ignorá-los: é uma dependência opcional.

3. Configure o bot editando o arquivo `config.js` (owner, packname, API keys, etc.).

4. Inicie o bot para gerar o código QR da sessão:

   ```bash
   npm start
   ```

   Escaneie o QR com WhatsApp > Dispositivos vinculados. Para reconectar no futuro, basta executar `npm start` novamente.

   Métodos de conexão alternativos:

   | Comando | Descrição |
   | --- | --- |
   | `npm start` | Conexão por código QR |
   | `npm run qr` | Força a conexão por código QR |
   | `npm run code` | Conexão por código de 8 dígitos |

5. Pronto! Envie `.menu` para o número do bot para ver os comandos disponíveis.

> [!TIP]\
> Se o seu bot cair ao reiniciar ou por inatividade, verifique as issues abertas ou consulte as [comunidades de assistência](#comunidades-de-assistência): muitos problemas de sessão já têm solução documentada.

# Contribuir

Quer contribuir com o projeto? Confira o [Guia de Contribuição](CONTRIBUTING.md), onde você encontrará:

- Como reportar bugs e solicitar recursos.
- O fluxo completo de pull requests (fork, branches, commits convencionais).
- A estrutura do projeto e como criar plugins corretamente.
- O checklist para que seu PR seja aceito.

# Opções de Implantação

## Implantação na Cafirexos

<a href="https://cafirexos.com">
  <img width="180px" src="https://cdn.cafirexos.com/logos/logo_cfros_2000x2000.png"/>
</a>

<details>
 <summary><b>:paperclip: Links Importantes</b></summary>

- [Site](https://cafirexos.com/)
- [Área do Cliente](https://cafirexos.com/clientarea.php)
- [Painel de Controle](https://panel.cafirexos.com)
- [Base de Conhecimento](https://cafirexos.com/knowledgebase)
- [Status dos Serviços](https://estado.cafirexos.com)
- [Canal do WhatsApp](https://links.cafirexos.com/whatsapp/canal)
- [Suporte](https://cafirexos.com/contactenos)

</details>

## Implantação na BoxMineWorld

<a href="https://boxmineworld.com">
  <img width="180px" src="https://i.ibb.co/sFygw8p/favicon.png"/>
</a>

<details>
 <summary><b>:paperclip: Links Importantes</b></summary>

- **Site:** [boxmineworld.com](https://boxmineworld.com)
- **Área do Cliente:** [dash.boxmineworld.com](https://dash.boxmineworld.com)
- **Painel de Controle:** [panel.boxmineworld.com](https://panel.boxmineworld.com)
- **Documentação:** [docs.boxmineworld.com](https://docs.boxmineworld.com)
- **Comunidade do Discord:** [Entre aqui!](https://discord.gg/84qsr4v)

</details>

## Implantação em Outras Plataformas

Nesta seção, você encontrará **botões de implantação** que permitirão implementar o projeto com um único clique. Este processo é **automático** e não requer configurações manuais. Basta selecionar a plataforma desejada e clicar no botão para **implantar** seu projeto de forma rápida e simples.

[![Open in Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?skip_quickstart=true&machine=basicLinux32gb&repo=514876515&ref=master&geo=EuropeWest)
[![Deploy to Glitch](https://binbashbanana.github.io/deploy-buttons/buttons/remade/glitch.svg)](https://glitch.com/edit/#!/import/github/BrunoSobrino/TheMystic-Bot-MD)
[![Deploy to Heroku](https://binbashbanana.github.io/deploy-buttons/buttons/remade/heroku.svg)](https://www.heroku.com/deploy?template=https://github.com/BrunoSobrino/TheMystic-Bot-MD)
[![Deploy to Koyeb](https://binbashbanana.github.io/deploy-buttons/buttons/remade/koyeb.svg)](https://app.koyeb.com/deploy?type=git&name=themystic-bot-md&repository=https://github.com/BrunoSobrino/TheMystic-Bot-MD)
[![Run on Repl.it](https://binbashbanana.github.io/deploy-buttons/buttons/remade/replit.svg)](https://repl.it/github/BrunoSobrino/TheMystic-Bot-MD)
[![Deploy to Render](https://binbashbanana.github.io/deploy-buttons/buttons/remade/render.svg)](https://dashboard.render.com/blueprint/new?repo=https://github.com/BrunoSobrino/TheMystic-Bot-MD)
[![Deploy to Termux](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://brunosobrino.github.io/TheMystic-Bot-MD/)
[![Deploy to Linux](https://img.shields.io/badge/Linux-black?style=for-the-badge&logo=linux&logoColor=white)](https://brunosobrino.github.io/TheMystic-Bot-MD/)
[![Deploy to Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://brunosobrino.github.io/TheMystic-Bot-MD/)

<!-- [![Deploy to Vercel](https://binbashbanana.github.io/deploy-buttons/buttons/remade/vercel.svg)](https://vercel.com/new/clone?repository-url=https://github.com/BrunoSobrino/TheMystic-Bot-MD) -->

# Suporte e Comunidade

## Comunidades de Assistência

Neste espaço, você poderá encontrar diversas **comunidades de assistência** onde poderá **tirar suas dúvidas**, **compartilhar experiências** e **colaborar** com outros usuários. Junte-se à comunidade que melhor se adapta às suas necessidades e faça parte de um **ambiente de apoio mútuo**.

<table>

| Plataforma | Tipo | Idioma | Link |
| --- | --- | --- |--- |
| WhatsApp | Canal | Espanhol | [Junte-se aqui!](https://whatsapp.com/channel/0029Vaein6eInlqIsCXpDs3y) |
| WhatsApp | Grupo | Espanhol | [Junte-se aqui!](https://chat.whatsapp.com/HJnmHGjQG1w3kcgFcuPclo) |

</table>

## Colaboradores

Conheça os **colaboradores** que contribuíram para o desenvolvimento deste projeto. O apoio deles foi fundamental para **melhorar** e **expandir** as funcionalidades do bot.

<a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=BrunoSobrino/TheMystic-Bot-MD" /> 
</a>

## Agradecimentos

<a href="https://github.com/BochilGaming/games-wabot-md/tree/multi-device">
  <img src="https://i.ibb.co/CMpM8pk/Bochil-Gaming.png" width="180px"/>
</a>

## Desenvolvedor Principal

<a href="https://github.com/BrunoSobrino">
  <img src="https://i.ibb.co/Qn1W6cP/image.png" width="180px"/>
</a>
