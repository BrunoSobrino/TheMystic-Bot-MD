# Guía de Contribución

¡Gracias por tu interés en contribuir a **TheMystic-Bot-MD**! Este proyecto se mantiene gracias a la comunidad de colaboradores, así que tu ayuda es valiosa.

## Estado del proyecto

> El proyecto está marcado como **DEPRECATED** por su desarrollador principal. Aun así, sigue vivo gracias a los colaboradores: los bugs se corrigen y las funciones se mantienen mediante pull requests. Antes de invertir tiempo en una contribución grande, revisa los [issues abiertos](https://github.com/BrunoSobrino/TheMystic-Bot-MD/issues) y pregunta en las [comunidades de asistencia](https://github.com/BrunoSobrino/TheMystic-Bot-MD#comunidades-de-asistencia) para coordinar.

## Formas de contribuir

### Reportar un bug

1. Revisa primero si el bug ya fue reportado en los [issues](https://github.com/BrunoSobrino/TheMystic-Bot-MD/issues).
2. Abre un issue con la etiqueta `Bug` usando este enlace: [reportar un error](https://github.com/BrunoSobrino/TheMystic-Bot-MD/issues/new?assignees=&labels=Bug).
3. Incluye: pasos para reproducir, comportamiento esperado, comportamiento real, y capturas/logs si es posible.

### Solicitar una característica

Usa el enlace de [solicitud de característica](https://github.com/BrunoSobrino/TheMystic-Bot-MD/issues/new?assignees=&labels=Enhancement) y describe con claridad qué quieres que haga el bot y para qué.

### Contribuir código (pull requests)

El flujo recomendado:

1. **Fork** el repositorio y clona tu fork localmente.
2. Agrega el repositorio original como remoto `upstream`:

   ```bash
   git remote add upstream https://github.com/BrunoSobrino/TheMystic-Bot-MD.git
   ```

3. Crea una rama descriptiva desde `master` actualizado:

   ```bash
   git fetch upstream
   git checkout -b fix/nombre-del-fix upstream/master
   ```

   Convención de ramas:
   - `fix/descripcion` — corrección de bugs
   - `feature/descripcion` — nueva funcionalidad
   - `docs/descripcion` — documentación
   - `refactor/descripcion` — refactorización

4. Haz cambios pequeños y enfocados. **Un commit = un cambio lógico.**
5. Verifica con ESLint: `npm run eslint` (o `npm run eslintfix` para autocorregir).
6. **Push** de la rama a tu fork y abre una **pull request** contra `master`.
7. En la descripción de la PR: qué cambió, por qué, cómo probarlo, y referencia el issue con `Fixes #N`.

## Convenciones de commits

Usa [Commits Convencionales](https://www.conventionalcommits.org/):

```
<tipo>(<scope opcional>): <descripción corta>
```

| Tipo | Uso |
| --- | --- |
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `refactor` | Refactor sin fix ni feat |
| `chore` | Tareas de mantenimiento |
| `ci` | Cambios en CI/CD |

Ejemplos:

```bash
git commit -m "fix: register play/play2 command"
git commit -m "docs: add local setup instructions to README"
git commit -m "feat(downloader): add support for new platform"
```

## Estructura del proyecto

```
├── plugins/          # Comandos del bot. Un archivo por comando o grupo de comandos
├── src/
│   ├── languages/    # Traducciones (es, en, pt-br, ...)
│   ├── docs/         # Documentación secundaria
│   └── assets/       # Recursos estáticos
├── lib/              # Librerías internas y herramientas
├── config.js         # Configuración principal del bot (owner, packname, API keys)
├── handler.js        # Dispatcher de mensajes y comandos
├── main.js           # Punto de entrada
└── package.json
```

Los plugins se organizan por prefijo: `downloader-`, `game-`, `group-`, `owner-`, `tools-`, `ia-`, `converter-`, etc.

## Cómo crear un plugin

Cada plugin exporta un `handler` con propiedades que lo registran en el dispatcher. Ejemplo mínimo:

```js
let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  // tu lógica aquí
  conn.reply(m.chat, `Hola ${m.name}!`, m);
};

handler.help = ['hola', 'saludo'];        // aparece en el menú de ayuda
handler.tags = ['tools'];                 // categoría del plugin
handler.command = /^(hola|saludo)$/i;     // OBLIGATORIO: sin esto el comando nunca se dispara

export default handler;
```

> **Importante:** `handler.command` es lo único que el dispatcher (`handler.js`) usa para decidir si el plugin responde. `handler.help` no actúa como fallback. Sin `handler.command` el comando jamás se ejecutará.

Reglas para plugins:

- Usa el sistema de idiomas para los textos del bot (`src/languages/`).
- Usa ESM (`import`/`export`), nunca CommonJS.
- Respeta el estilo del resto del repo (ESLint).
- No agregues dependencias nuevas sin necesidad; el proyecto ya tiene muchas.

## Ejecutar el proyecto localmente

Consulta la sección [Instalación y Ejecución Local](https://github.com/BrunoSobrino/TheMystic-Bot-MD#instalación-y-ejecución-local) del README.

## Checklist final antes de abrir tu PR

- [ ] El cambio es pequeño y enfocado
- [ ] `npm run eslint` pasa sin errores
- [ ] El commit sigue el formato convencional
- [ ] La rama está actualizada con `upstream/master`
- [ ] La descripción de la PR explica qué, por qué y cómo probar
