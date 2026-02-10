export interface Source {
  name: string;
  url: string;
}

export interface ModuleInfo {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  duration: string;
  type: string;
  description: string;
  objectives: string[];
  sources: Source[];
}

export const modules: ModuleInfo[] = [
  {
    id: 1,
    title: 'Lua desde Cero',
    subtitle: 'Variables, Tipos y Operadores',
    icon: '🌙',
    duration: '30 min',
    type: 'Teoria + Quiz',
    description:
      'Aprende los fundamentos del lenguaje Lua: variables, tipos de datos, operadores y manejo basico de strings. La base que necesitas antes de tocar Neovim.',
    objectives: [
      'Declarar variables locales y globales',
      'Identificar los tipos de datos de Lua',
      'Usar operadores aritmeticos, relacionales y logicos',
      'Manipular strings con concatenacion y funciones basicas'
    ],
    sources: [
      { name: 'Programming in Lua - Types and Values', url: 'https://www.lua.org/pil/2.html' },
      { name: 'Lua 5.1 Reference Manual', url: 'https://www.lua.org/manual/5.1/manual.html' },
      {
        name: 'Programming in Lua - Expressions',
        url: 'https://www.lua.org/pil/3.html'
      }
    ]
  },
  {
    id: 2,
    title: 'Tablas: El Corazon de Lua',
    subtitle: 'Arrays, Diccionarios y Estructuras',
    icon: '📊',
    duration: '30 min',
    type: 'Teoria + Drag & Drop',
    description:
      'Las tablas son LA estructura de datos en Lua. Aprende a usarlas como arrays, diccionarios, objetos y mas. Todo en Lua gira alrededor de tablas.',
    objectives: [
      'Crear tablas como arrays (indices numericos)',
      'Crear tablas como diccionarios (claves string)',
      'Iterar tablas con pairs() e ipairs()',
      'Usar funciones de la libreria table'
    ],
    sources: [
      { name: 'Programming in Lua - Tables', url: 'https://www.lua.org/pil/2.5.html' },
      {
        name: 'Programming in Lua - Table Library',
        url: 'https://www.lua.org/pil/19.html'
      },
      {
        name: 'Lua 5.1 Manual - Table Manipulation',
        url: 'https://www.lua.org/manual/5.1/manual.html#5.5'
      }
    ]
  },
  {
    id: 3,
    title: 'Funciones, Closures y Modulos',
    subtitle: 'El poder funcional de Lua',
    icon: '🥷',
    duration: '30 min',
    type: 'Teoria + Quiz',
    description:
      'Funciones como ciudadanos de primera clase, closures para encapsular estado, y el sistema de modulos con require(). Conceptos clave para plugins.',
    objectives: [
      'Definir funciones con nombre y anonimas',
      'Entender closures y upvalues',
      'Usar multiples valores de retorno',
      'Crear y consumir modulos con require()'
    ],
    sources: [
      { name: 'Programming in Lua - Functions', url: 'https://www.lua.org/pil/5.html' },
      {
        name: 'Programming in Lua - Closures',
        url: 'https://www.lua.org/pil/6.1.html'
      },
      {
        name: 'Programming in Lua - Modules and Packages',
        url: 'https://www.lua.org/pil/15.html'
      }
    ]
  },
  {
    id: 4,
    title: 'Tu Primer init.lua',
    subtitle: 'Configurando Neovim con Lua',
    icon: '⚙️',
    duration: '30 min',
    type: 'Teoria + Escenario Interactivo',
    description:
      'Pasa de zero a config. Aprende la estructura de la configuracion de Neovim, como setear opciones, crear keymaps y organizar tu init.lua.',
    objectives: [
      'Entender la estructura de ~/.config/nvim/',
      'Configurar opciones con vim.opt',
      'Crear keymaps con vim.keymap.set',
      'Organizar la configuracion en modulos'
    ],
    sources: [
      {
        name: 'Neovim Lua Guide (oficial)',
        url: 'https://neovim.io/doc/user/lua-guide.html'
      },
      {
        name: 'nvim-lua-guide - Getting started',
        url: 'https://github.com/nanotee/nvim-lua-guide'
      },
      {
        name: 'VonHeikemen - Build your first Lua config',
        url: 'https://vonheikemen.github.io/devlog/tools/build-your-first-lua-config-for-neovim/'
      }
    ]
  },
  {
    id: 5,
    title: 'La API de Neovim a Fondo',
    subtitle: 'vim.api, vim.fn, Buffers y Ventanas',
    icon: '🔍',
    duration: '30 min',
    type: 'Teoria + Quiz con Timer',
    description:
      'Domina la API que conecta Lua con Neovim. Buffers, ventanas, autocommands, user commands — todo lo que necesitas para crear plugins.',
    objectives: [
      'Usar vim.api para manipular buffers y ventanas',
      'Llamar funciones de Vimscript con vim.fn',
      'Crear autocommands con nvim_create_autocmd',
      'Definir user commands con nvim_create_user_command'
    ],
    sources: [
      { name: 'Neovim API Documentation', url: 'https://neovim.io/doc/user/api.html' },
      { name: 'Neovim Lua Reference', url: 'https://neovim.io/doc/user/lua.html' },
      {
        name: 'VonHeikemen - Configuring Neovim using Lua',
        url: 'https://vonheikemen.github.io/devlog/tools/configuring-neovim-using-lua/'
      }
    ]
  },
  {
    id: 6,
    title: 'Plugin: Nota Flotante',
    subtitle: 'Tu primer plugin real de Neovim',
    icon: '🔨',
    duration: '30 min',
    type: 'Simulacion Guiada',
    description:
      'Construye paso a paso un plugin que abre una ventana flotante para tomar notas rapidas. Aprende floating windows, file I/O y estructura de plugins.',
    objectives: [
      'Estructurar un plugin para Neovim',
      'Crear ventanas flotantes con nvim_open_win',
      'Leer y escribir archivos desde Lua',
      'Registrar comandos y keymaps del plugin'
    ],
    sources: [
      {
        name: 'Neovim Lua Plugin Guide',
        url: 'https://neovim.io/doc/user/lua-plugin.html'
      },
      {
        name: 'Max Shen - Develop a Neovim Plugin in Lua',
        url: 'https://m4xshen.dev/posts/develop-a-neovim-plugin-in-lua'
      },
      {
        name: 'Neovim API - nvim_open_win',
        url: 'https://neovim.io/doc/user/api.html#nvim_open_win()'
      }
    ]
  },
  {
    id: 7,
    title: 'Plugin: Pomodoro Neovim',
    subtitle: 'Timer en el statusline',
    icon: '🍅',
    duration: '30 min',
    type: 'Simulacion Guiada',
    description:
      'Construye un timer Pomodoro que vive en tu statusline. Aprende vim.loop (libuv), manejo de estado, notificaciones y statusline integration.',
    objectives: [
      'Usar vim.loop para timers asincrono',
      'Manejar estado del plugin con closures',
      'Integrar informacion en el statusline',
      'Enviar notificaciones con vim.notify'
    ],
    sources: [
      { name: 'Neovim Lua Reference - vim.loop', url: 'https://neovim.io/doc/user/lua.html' },
      {
        name: 'LuaJIT - FFI Library',
        url: 'http://luajit.org/ext_ffi.html'
      },
      {
        name: 'Linode - Write a Neovim Plugin with Lua',
        url: 'https://www.linode.com/docs/guides/write-a-neovim-plugin-with-lua/'
      }
    ]
  },
  {
    id: 8,
    title: 'Testing, Empaquetado y Publicacion',
    subtitle: 'De local a GitHub',
    icon: '📦',
    duration: '30 min',
    type: 'Teoria + Quiz',
    description:
      'Aprende a testear tus plugins, estructurarlos para gestores de paquetes (lazy.nvim), escribir documentacion y publicarlos en GitHub.',
    objectives: [
      'Estructurar un plugin para lazy.nvim',
      'Escribir tests con plenary.nvim',
      'Crear documentacion con vimdoc',
      'Publicar y versionar un plugin en GitHub'
    ],
    sources: [
      {
        name: 'plenary.nvim - Test Framework',
        url: 'https://github.com/nvim-lua/plenary.nvim'
      },
      {
        name: 'lazy.nvim - Plugin Manager',
        url: 'https://github.com/folke/lazy.nvim'
      },
      {
        name: 'Neovim Plugin Best Practices',
        url: 'https://neovim.io/doc/user/lua-plugin.html'
      }
    ]
  }
];
