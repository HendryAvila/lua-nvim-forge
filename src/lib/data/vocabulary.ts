export interface VocabularyTerm {
  term: string;
  definition: string;
  module: number;
  category: string;
}

export const vocabulary: VocabularyTerm[] = [
  // Modulo 1 - Fundamentos
  {
    term: 'nil',
    definition: 'El tipo que representa la ausencia de valor. Una variable no asignada es nil.',
    module: 1,
    category: 'Tipos de Datos'
  },
  {
    term: 'local',
    definition: 'Keyword para declarar variables con scope limitado al bloque actual. Siempre preferir sobre globales.',
    module: 1,
    category: 'Sintaxis'
  },
  {
    term: 'string concatenation (..)',
    definition: 'El operador .. une dos strings. "Hola" .. " mundo" produce "Hola mundo".',
    module: 1,
    category: 'Operadores'
  },
  {
    term: 'coercion',
    definition: 'Lua convierte automaticamente entre numeros y strings en ciertas operaciones. "5" + 2 = 7.',
    module: 1,
    category: 'Tipos de Datos'
  },

  // Modulo 2 - Tablas
  {
    term: 'table',
    definition: 'La unica estructura de datos compuesta en Lua. Sirve como array, diccionario, objeto y mas.',
    module: 2,
    category: 'Estructuras'
  },
  {
    term: 'pairs()',
    definition: 'Iterador generico para tablas. Recorre TODAS las claves (numericas y string) sin orden garantizado.',
    module: 2,
    category: 'Iteracion'
  },
  {
    term: 'ipairs()',
    definition: 'Iterador para la parte de array de una tabla. Recorre indices numericos consecutivos desde 1.',
    module: 2,
    category: 'Iteracion'
  },
  {
    term: 'metatables',
    definition: 'Tablas especiales que definen el comportamiento de otras tablas (como operator overloading en otros lenguajes).',
    module: 2,
    category: 'Avanzado'
  },

  // Modulo 3 - Funciones
  {
    term: 'closure',
    definition: 'Una funcion que captura variables de su scope externo (upvalues). Permite encapsular estado.',
    module: 3,
    category: 'Funciones'
  },
  {
    term: 'upvalue',
    definition: 'Variable local externa que es capturada por una closure. Persiste mientras la closure exista.',
    module: 3,
    category: 'Funciones'
  },
  {
    term: 'require()',
    definition: 'Funcion para cargar modulos. Busca en package.path, ejecuta el archivo y cachea el resultado.',
    module: 3,
    category: 'Modulos'
  },
  {
    term: 'first-class function',
    definition: 'En Lua las funciones son valores: se asignan a variables, se pasan como argumentos y se retornan.',
    module: 3,
    category: 'Funciones'
  },

  // Modulo 4 - init.lua
  {
    term: 'vim.opt',
    definition: 'API para configurar opciones de Neovim desde Lua. Equivale a :set en Vimscript.',
    module: 4,
    category: 'Neovim Config'
  },
  {
    term: 'vim.g',
    definition: 'Tabla para acceder/setear variables globales de Vim (g:variable).',
    module: 4,
    category: 'Neovim Config'
  },
  {
    term: 'vim.keymap.set',
    definition: 'Funcion para crear keymaps en Lua. Reemplaza vim.api.nvim_set_keymap con una API mas limpia.',
    module: 4,
    category: 'Neovim Config'
  },
  {
    term: 'mapleader',
    definition: 'Tecla prefijo para keymaps personalizados. Se setea con vim.g.mapleader (usualmente espacio).',
    module: 4,
    category: 'Neovim Config'
  },

  // Modulo 5 - API Neovim
  {
    term: 'vim.api',
    definition: 'Namespace con todas las funciones de la API C de Neovim expuestas a Lua (nvim_*).',
    module: 5,
    category: 'API'
  },
  {
    term: 'buffer',
    definition: 'Representacion en memoria de un archivo. Cada archivo abierto tiene un buffer con un ID unico.',
    module: 5,
    category: 'Conceptos Nvim'
  },
  {
    term: 'nvim_create_autocmd',
    definition: 'Crea un autocommand desde Lua. Ejecuta codigo cuando ocurre un evento especifico.',
    module: 5,
    category: 'API'
  },
  {
    term: 'namespace',
    definition: 'Identificador para agrupar highlights, virtual text y signos. Se crea con nvim_create_namespace.',
    module: 5,
    category: 'API'
  },

  // Modulo 6 - Plugin Nota Flotante
  {
    term: 'nvim_open_win',
    definition: 'Crea una ventana flotante (floating window). Recibe buffer, enter flag y opciones de config.',
    module: 6,
    category: 'Plugin Dev'
  },
  {
    term: 'nvim_create_buf',
    definition: 'Crea un nuevo buffer vacio. El parametro listed controla si aparece en :ls.',
    module: 6,
    category: 'Plugin Dev'
  },
  {
    term: 'io.open()',
    definition: 'Funcion de Lua para abrir archivos. Retorna un file handle para leer/escribir.',
    module: 6,
    category: 'I/O'
  },

  // Modulo 7 - Plugin Pomodoro
  {
    term: 'vim.loop',
    definition: 'Acceso a libuv desde Lua. Permite timers, I/O asincrono y operaciones del sistema.',
    module: 7,
    category: 'Async'
  },
  {
    term: 'vim.notify',
    definition: 'Funcion para mostrar notificaciones al usuario. Soporta niveles: INFO, WARN, ERROR.',
    module: 7,
    category: 'UI'
  },
  {
    term: 'statusline',
    definition: 'Barra inferior de Neovim que muestra info del estado. Se configura con vim.opt.statusline.',
    module: 7,
    category: 'UI'
  },
  {
    term: 'vim.schedule',
    definition: 'Programa una funcion para ejecutarse en el main loop de Neovim. Necesario desde callbacks async.',
    module: 7,
    category: 'Async'
  },

  // Modulo 8 - Testing y Publicacion
  {
    term: 'lazy.nvim',
    definition: 'Gestor de plugins moderno para Neovim. Carga plugins de forma lazy y maneja dependencias.',
    module: 8,
    category: 'Ecosistema'
  },
  {
    term: 'plenary.nvim',
    definition: 'Libreria de utilidades para Neovim. Incluye un framework de testing para plugins.',
    module: 8,
    category: 'Testing'
  },
  {
    term: 'vimdoc',
    definition: 'Formato de documentacion de Vim/Neovim. Los archivos .txt en doc/ son accesibles via :help.',
    module: 8,
    category: 'Documentacion'
  }
];
