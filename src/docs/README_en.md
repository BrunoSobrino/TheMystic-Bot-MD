<p align="center">
 <img width="180px" src="https://i.ibb.co/Qn1W6cP/image.png" align="center"/>
 <h2 align="center">TheMystic-Bot-MD</h2>
 <p align="center">DEPRECATED | OUTDATED PROJECT.</p>
 <p align="center">An automated bot for the WhatsApp platform, built especially on Node.js, that allows multiple functions and customizations on the platform.</p>
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
  <a href="https://api.whatsapp.com/send?phone=+5219992843881&text=&text=.menu">Demo</a>
  ·
  <a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD/issues/new?assignees=&labels=Bug">Report a Bug</a>
  ·
  <a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD/issues/new?assignees=&labels=Enhancement">Request a Feature</a>
</p>

<!-- <p align="center">
  <a href="/src/docs/README_en.md">English</a>
  ·
  <a href="/src/docs/README_pt-br.md">Português</a>
</p> -->

<p align="center">Help keep our project active with your <a href="https://www.paypal.me/BrunoSob">donation</a> and contribute to improving the bot's features for everyone!</p>

# Deployment, Support and Community
- [Local Installation and Execution](#local-installation-and-execution)
- [Contributing](#contributing)
- [Deployment Options](#deployment-options)
  - [Deployment on Cafirexos](#deployment-on-cafirexos)
  - [Deployment on BoxMineWorld](#deployment-on-boxmineworld)
  - [Deployment on Others](#deployment-on-other-platforms)
- [Support and Community](#support-and-community)
  - [Help Communities](#usage-guide)
  - [Contributors](#contributors)
  - [Acknowledgements](#acknowledgements)
  - [Main Developer](#main-developer)

> ◇ **Note:** we are aware that there **are** different places that are **not official** or have **no relation or involvement** with our project. To keep our **users** **safe**, we share the **official** places where you can use **our bot**, **receive assistance**, among other **useful or functional** terms.

# Important Notices

> [!IMPORTANT]\
> This project is **not affiliated, endorsed or associated in any way** with the `WhatsApp` platform. The `WhatsApp` platform is a registered subsidiary of `Meta Platforms Inc.`. This bot is an **independent development** and has **no official relationship with the company**.

> [!IMPORTANT]\
> this **project is not guaranteed to work correctly** due to personal time constraints of [Bruno Sobrino](https://github.com/BrunoSobrino), which is why **this project is under development by collaborators** and users who wish to contribute **updates**.


# Local Installation and Execution

### Prerequisites

- **Node.js** 18 or higher (with npm included).
- **ffmpeg** installed on the system (required for audio and video conversions). On Windows install it with `winget install ffmpeg`; on Linux/Debian with `sudo apt install ffmpeg`; on Android/Termux with `pkg install ffmpeg`.

### Step by step

1. Clone the repository:

   ```bash
   git clone https://github.com/BrunoSobrino/TheMystic-Bot-MD.git
   cd TheMystic-Bot-MD
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

   > If errors related to `puppeteer` appear, you can ignore them: it is an optional dependency.

3. Configure the bot by editing the `config.js` file (owner, packname, API keys, etc.).

4. Start the bot to generate the session QR code:

   ```bash
   npm start
   ```

   Scan the QR code with WhatsApp > Linked Devices. To reconnect in the future, just run `npm start` again.

   Alternative connection methods:

   | Command | Description |
   | --- | --- |
   | `npm start` | QR code connection |
   | `npm run qr` | Forces QR code connection |
   | `npm run code` | 8-digit code connection |

5. Done! Send `.menu` to the bot's number to see the available commands.

> [!TIP]\
> If your bot crashes on restart or due to inactivity, check the open issues or ask in the [support communities](#support-communities): many session problems already have a documented solution.

# Contributing

Want to contribute to the project? Check the [Contribution Guide](CONTRIBUTING.md) where you will find:

- How to report bugs and request features.
- The complete pull request flow (fork, branches, conventional commits).
- The project structure and how to create plugins correctly.
- The checklist for your PR to be accepted.

# Deployment Options

## Deployment on Cafirexos

<a href="https://cafirexos.com">
  <img width="180px" src="https://cdn.cafirexos.com/logos/logo_cfros_2000x2000.png"/>
</a>

<details>
 <summary><b>:paperclip: Important Links</b></summary>

- [Website](https://cafirexos.com/)
- [Client Area](https://cafirexos.com/clientarea.php)
- [Control Panel](https://panel.cafirexos.com)
- [Knowledge Base](https://cafirexos.com/knowledgebase)
- [Service Status](https://estado.cafirexos.com)
- [WhatsApp Channel](https://links.cafirexos.com/whatsapp/canal)
- [Support](https://cafirexos.com/contactenos)

</details>

## Deployment on BoxMineWorld

<a href="https://boxmineworld.com">
  <img width="180px" src="https://i.ibb.co/sFygw8p/favicon.png"/>
</a>

<details>
 <summary><b>:paperclip: Important Links</b></summary>

- **Website:** [boxmineworld.com](https://boxmineworld.com)
- **Client Area:** [dash.boxmineworld.com](https://dash.boxmineworld.com)
- **Control Panel:** [panel.boxmineworld.com](https://panel.boxmineworld.com)
- **Documentation:** [docs.boxmineworld.com](https://docs.boxmineworld.com)
- **Discord Community:** [Join here!](https://discord.gg/84qsr4v)

</details>

## Deployment on Other Platforms

In this section you will find **deployment buttons** that let you deploy the project with a single click. This process is **automatic** and requires no manual configuration. Simply select the desired platform and click the button to **deploy** your project quickly and easily.

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

# Support and Community

## Support Communities

In this space you can find various **support communities** where you can **solve your doubts**, **share experiences** and **collaborate** with other users. Join the community that best suits your needs and become part of a **mutual support environment**.

<table>

| Platform | Type | Language | Link |
| --- | --- | --- |--- |
| WhatsApp | Channel | Spanish | [Join here!](https://whatsapp.com/channel/0029Vaein6eInlqIsCXpDs3y) |
| WhatsApp | Group | Spanish | [Join here!](https://chat.whatsapp.com/HJnmHGjQG1w3kcgFcuPclo) |

</table>

## Contributors

Meet the **contributors** who have helped develop this project. Their support has been key to **improving** and **expanding** the bot's features.

<a href="https://github.com/BrunoSobrino/TheMystic-Bot-MD/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=BrunoSobrino/TheMystic-Bot-MD" /> 
</a>

## Acknowledgements

<a href="https://github.com/BochilGaming/games-wabot-md/tree/multi-device">
  <img src="https://i.ibb.co/CMpM8pk/Bochil-Gaming.png" width="180px"/>
</a>

## Main Developer

<a href="https://github.com/BrunoSobrino">
  <img src="https://i.ibb.co/Qn1W6cP/image.png" width="180px"/>
</a>
