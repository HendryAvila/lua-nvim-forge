<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import BranchingScenario from '$lib/components/BranchingScenario.svelte';
  import CodePlayground from '$lib/components/CodePlayground.svelte';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';

  const mod = modules.find(m => m.id === 4)!;

  let completed = $state(false);
  let showBadge = $state(false);
  let earnedBadge = $state<any>(null);
  let activeSection = $state(0);

  const sections = [
    'Estructura de ~/.config/nvim/',
    'vim.opt — Opciones del editor',
    'vim.g — Variables globales',
    'vim.keymap.set — Keymaps',
    'Autocommands basicos',
    'Organizando la config'
  ];

  function completeModule(score: number, maxScore: number) {
    courseStore.completeModule(4, score, maxScore);
    completed = true;
    const badge = allBadges.find(b => b.id === 'configurador')!;
    courseStore.unlockBadge(badge);
    earnedBadge = badge;
    showBadge = true;
  }

  const scenarioNodes: Record<string, any> = {
    start: {
      id: 'start',
      narrative: 'Acabas de instalar Neovim y abres tu terminal. El primer paso es crear tu configuracion. ¿Donde creas tu archivo de configuracion?',
      choices: [
        { text: 'Creo ~/.config/nvim/init.lua', nextId: 'correct-path', points: 3, feedback: 'Exacto! Esa es la ruta estandar en Linux/Mac para la config de Neovim en Lua.' },
        { text: 'Creo ~/.vimrc', nextId: 'vimrc', points: 0, feedback: 'Eso es para Vim clasico, no Neovim. Neovim usa ~/.config/nvim/.' },
        { text: 'Creo ~/nvim/config.lua', nextId: 'wrong-path', points: 0, feedback: 'Esa ruta no es reconocida por Neovim. La ruta correcta es ~/.config/nvim/init.lua.' }
      ]
    },
    'correct-path': {
      id: 'correct-path',
      narrative: 'Bien! Tu init.lua esta listo. Lo primero que quieres hacer es configurar las opciones basicas del editor. ¿Como activas los numeros de linea?',
      choices: [
        { text: 'vim.opt.number = true', nextId: 'leader-key', points: 3, feedback: 'Perfecto! vim.opt es la forma idiomatica de setear opciones en Lua.' },
        { text: 'set number', nextId: 'leader-key', points: 1, feedback: 'Eso es sintaxis de Vimscript. Funciona con vim.cmd("set number") pero vim.opt.number = true es mejor en Lua.' },
        { text: 'vim.g.number = true', nextId: 'leader-key', points: 0, feedback: 'vim.g es para variables globales, no opciones. Para opciones usa vim.opt.' }
      ]
    },
    vimrc: {
      id: 'vimrc',
      narrative: 'Neovim no usa .vimrc por defecto. Necesitas crear ~/.config/nvim/init.lua. Ahora, ¿como activas numeros de linea?',
      choices: [
        { text: 'vim.opt.number = true', nextId: 'leader-key', points: 3, feedback: 'Correcto! vim.opt es la API para opciones.' },
        { text: 'vim.cmd("set number")', nextId: 'leader-key', points: 1, feedback: 'Funciona, pero es un wrapper de Vimscript. Mejor usar vim.opt directamente.' }
      ]
    },
    'wrong-path': {
      id: 'wrong-path',
      narrative: 'La ruta correcta es ~/.config/nvim/init.lua. Ahora que lo sabes, ¿como activas numeros de linea?',
      choices: [
        { text: 'vim.opt.number = true', nextId: 'leader-key', points: 3, feedback: 'Perfecto!' },
        { text: 'vim.g.number = true', nextId: 'leader-key', points: 0, feedback: 'vim.g es para variables globales. Para opciones: vim.opt.' }
      ]
    },
    'leader-key': {
      id: 'leader-key',
      narrative: 'Excelente! Ahora necesitas configurar la tecla leader antes de definir keymaps. ¿Como la configuras?',
      choices: [
        { text: 'vim.g.mapleader = " " (antes de cualquier keymap)', nextId: 'keymap', points: 3, feedback: 'Correcto! La leader key debe setearse ANTES de definir keymaps que la usen.' },
        { text: 'vim.opt.leader = " "', nextId: 'keymap', points: 0, feedback: 'No existe vim.opt.leader. La leader key se setea con vim.g.mapleader.' },
        { text: 'vim.g.mapleader = " " (al final del archivo)', nextId: 'keymap', points: 1, feedback: 'La key es correcta pero debe ir AL INICIO, antes de cualquier keymap que use <leader>.' }
      ]
    },
    keymap: {
      id: 'keymap',
      narrative: 'Ultimo paso: quieres crear un keymap para guardar el archivo con <leader>w en modo normal. ¿Como lo haces?',
      choices: [
        { text: 'vim.keymap.set("n", "<leader>w", ":w<CR>", { desc = "Guardar" })', nextId: 'end-good', points: 3, feedback: 'Perfecto! vim.keymap.set es la API moderna para keymaps en Neovim.' },
        { text: 'vim.api.nvim_set_keymap("n", "<leader>w", ":w<CR>", { noremap = true })', nextId: 'end-ok', points: 2, feedback: 'Funciona, pero vim.keymap.set es la API mas nueva y preferida. Tiene noremap por defecto.' },
        { text: 'map <leader>w :w<CR>', nextId: 'end-ok', points: 0, feedback: 'Eso es Vimscript. En Lua usa vim.keymap.set().' }
      ]
    },
    'end-good': {
      id: 'end-good',
      narrative: '',
      outcome: {
        title: 'Configuracion Completada!',
        description: 'Has configurado tu Neovim correctamente usando las APIs de Lua. Tu init.lua esta listo para crecer.',
        score: 0,
        maxScore: 15,
        grade: 'excellent' as const,
        lessons: [
          'La config de Neovim vive en ~/.config/nvim/init.lua',
          'vim.opt para opciones, vim.g para variables globales',
          'vim.g.mapleader se setea ANTES de los keymaps',
          'vim.keymap.set es la API moderna para keymaps'
        ]
      }
    },
    'end-ok': {
      id: 'end-ok',
      narrative: '',
      outcome: {
        title: 'Configuracion Completada',
        description: 'Lograste configurar Neovim, aunque hay oportunidades para usar APIs mas modernas.',
        score: 0,
        maxScore: 15,
        grade: 'good' as const,
        lessons: [
          'Prefiere vim.opt sobre vim.cmd("set ...")',
          'vim.keymap.set es preferido sobre nvim_set_keymap',
          'Siempre usa las APIs nativas de Lua cuando esten disponibles'
        ]
      }
    }
  };

  const playgroundExercise = {
    id: 'mod4-config-table',
    title: 'Ejercicio: Tabla de configuracion',
    instructions: 'Crea una tabla de configuracion para un "plugin" con las claves: enabled (true), theme ("tokyonight"), indent (4), y features como subtabla con lsp (true) y format (false). Imprime config.theme, config.indent y config.features.lsp.',
    initialCode: '-- Crea la tabla de configuracion\nlocal config = {\n  \n}\n\n-- Imprime los valores\n',
    expectedOutput: 'tokyonight\n4\ntrue',
    hints: [
      'Las tablas usan clave = valor separados por comas',
      'Una subtabla se define como features = { lsp = true, format = false }',
      'Accede con config.theme, config.features.lsp, etc.'
    ],
    solution: 'local config = {\n  enabled = true,\n  theme = "tokyonight",\n  indent = 4,\n  features = {\n    lsp = true,\n    format = false,\n  },\n}\n\nprint(config.theme)\nprint(config.indent)\nprint(config.features.lsp)'
  };

  $effect(() => {
    courseStore.startModule(4);
  });
</script>

<svelte:head>
  <title>{mod.title} — La Forja de Lua</title>
  <meta name="description" content={mod.description} />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">

  <!-- Header del modulo -->
  <header class="mb-10 fade-in">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-4xl">{mod.icon}</span>
      <div>
        <p class="text-xs text-forge-accent uppercase tracking-wider font-bold">Modulo {mod.id}</p>
        <h1 class="text-3xl font-black">{mod.title}</h1>
        <p class="text-forge-muted text-sm">{mod.subtitle}</p>
      </div>
    </div>
    <p class="text-forge-muted leading-relaxed">{mod.description}</p>

    <div class="flex flex-wrap gap-3 mt-4">
      <span class="badge bg-forge-accent/20 text-forge-accent">{mod.duration}</span>
      <span class="badge bg-forge-info/20 text-forge-info">{mod.type}</span>
    </div>

    <!-- Objetivos -->
    <div class="card mt-6">
      <h2 class="text-sm font-bold text-forge-accent uppercase tracking-wider mb-3">Objetivos del modulo</h2>
      <ul class="space-y-2">
        {#each mod.objectives as objective}
          <li class="flex items-start gap-2 text-sm text-forge-muted">
            <span class="text-forge-accent mt-0.5">&#9670;</span>
            {objective}
          </li>
        {/each}
      </ul>
    </div>
  </header>

  <!-- Navegacion de secciones -->
  <nav class="mb-8 fade-in">
    <div class="flex flex-wrap gap-2">
      {#each sections as section, i}
        <button
          onclick={() => activeSection = i}
          class="text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer {activeSection === i
            ? 'bg-forge-accent text-forge-darker border-forge-accent font-bold'
            : 'border-forge-border text-forge-muted hover:border-forge-accent/50 hover:text-forge-accent'}"
        >
          {i + 1}. {section}
        </button>
      {/each}
    </div>
  </nav>

  <!-- ========================================== -->
  <!-- SECCION 1: Estructura de ~/.config/nvim/   -->
  <!-- ========================================== -->
  {#if activeSection === 0}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span class="text-forge-accent">1.</span> Estructura de ~/.config/nvim/
        </h2>

        <p class="text-forge-muted leading-relaxed mb-4">
          Neovim busca su configuracion en un directorio especifico segun tu sistema operativo.
          En <strong class="text-forge-text">Linux y macOS</strong>, la ruta es
          <code class="code-inline">~/.config/nvim/</code>. En
          <strong class="text-forge-text">Windows</strong>, es
          <code class="code-inline">~/AppData/Local/nvim/</code>.
        </p>

        <p class="text-forge-muted leading-relaxed mb-4">
          El archivo de entrada es <code class="code-inline">init.lua</code>. Es lo primero que
          Neovim ejecuta al arrancar. Desde ahi, puedes cargar otros archivos usando
          <code class="code-inline">require()</code>.
        </p>

        <div class="code-block">
          <p class="text-forge-accent text-xs mb-2 font-bold">-- Estructura tipica</p>
          <pre class="text-forge-text leading-relaxed"><span class="text-forge-muted">~/.config/nvim/</span>
<span class="text-forge-accent">├──</span> init.lua              <span class="text-forge-muted">-- Punto de entrada</span>
<span class="text-forge-accent">├──</span> lua/
<span class="text-forge-accent">│   ├──</span> config/
<span class="text-forge-accent">│   │   ├──</span> options.lua   <span class="text-forge-muted">-- vim.opt settings</span>
<span class="text-forge-accent">│   │   ├──</span> keymaps.lua   <span class="text-forge-muted">-- Keymaps generales</span>
<span class="text-forge-accent">│   │   └──</span> autocmds.lua  <span class="text-forge-muted">-- Autocommands</span>
<span class="text-forge-accent">│   └──</span> plugins/
<span class="text-forge-accent">│       ├──</span> init.lua      <span class="text-forge-muted">-- Setup de lazy.nvim</span>
<span class="text-forge-accent">│       ├──</span> telescope.lua
<span class="text-forge-accent">│       └──</span> treesitter.lua
<span class="text-forge-accent">└──</span> after/                  <span class="text-forge-muted">-- Se carga DESPUES de plugins</span></pre>
        </div>

        <div class="mt-4 p-4 bg-forge-darker rounded-lg border border-forge-accent/20">
          <p class="text-xs text-forge-accent font-bold mb-1">CONCEPTO CLAVE: Lazy Loading</p>
          <p class="text-sm text-forge-muted leading-relaxed">
            Todo lo que esta dentro de <code class="code-inline">lua/</code> NO se ejecuta automaticamente.
            Solo se carga cuando lo llamas con <code class="code-inline">require("nombre_del_modulo")</code>.
            Esto te permite organizar tu config en archivos separados sin afectar el tiempo de arranque.
            Neovim busca dentro de <code class="code-inline">lua/</code> cuando usas <code class="code-inline">require()</code>,
            asi que <code class="code-inline">require("config.options")</code> buscara el archivo
            <code class="code-inline">lua/config/options.lua</code>.
          </p>
        </div>

        <div class="code-block mt-4">
          <p class="text-forge-accent text-xs mb-2 font-bold">-- init.lua minimo</p>
          <pre class="text-forge-text leading-relaxed"><span class="text-forge-accent">-- Cargar configuracion desde archivos separados</span>
<span class="text-forge-warning">require</span>(<span class="text-forge-success">"config.options"</span>)
<span class="text-forge-warning">require</span>(<span class="text-forge-success">"config.keymaps"</span>)
<span class="text-forge-warning">require</span>(<span class="text-forge-success">"config.autocmds"</span>)</pre>
        </div>
      </div>
    </section>
  {/if}

  <!-- ========================================== -->
  <!-- SECCION 2: vim.opt                         -->
  <!-- ========================================== -->
  {#if activeSection === 1}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span class="text-forge-accent">2.</span> vim.opt — Opciones del editor
        </h2>

        <p class="text-forge-muted leading-relaxed mb-4">
          <code class="code-inline">vim.opt</code> es la interfaz Lua para configurar las opciones de Neovim.
          Es el equivalente al comando <code class="code-inline">:set</code> de Vimscript, pero con la
          ventaja de ser Lua nativo: autocompletado, type checking, y sin escapar strings raros.
        </p>

        <div class="code-block">
          <p class="text-forge-accent text-xs mb-2 font-bold">-- Opciones basicas del editor</p>
          <pre class="text-forge-text leading-relaxed"><span class="text-forge-accent">-- Numeros de linea</span>
<span class="text-forge-warning">vim.opt</span>.number = <span class="text-forge-info">true</span>            <span class="text-forge-muted">-- Mostrar numeros absolutos</span>
<span class="text-forge-warning">vim.opt</span>.relativenumber = <span class="text-forge-info">true</span>    <span class="text-forge-muted">-- Numeros relativos a la linea actual</span>

<span class="text-forge-accent">-- Indentacion</span>
<span class="text-forge-warning">vim.opt</span>.tabstop = <span class="text-forge-info">2</span>              <span class="text-forge-muted">-- Ancho visual de un tab</span>
<span class="text-forge-warning">vim.opt</span>.shiftwidth = <span class="text-forge-info">2</span>           <span class="text-forge-muted">-- Espacios para autoindent</span>
<span class="text-forge-warning">vim.opt</span>.expandtab = <span class="text-forge-info">true</span>          <span class="text-forge-muted">-- Convertir tabs a espacios</span>
<span class="text-forge-warning">vim.opt</span>.smartindent = <span class="text-forge-info">true</span>        <span class="text-forge-muted">-- Indentacion inteligente</span>

<span class="text-forge-accent">-- Visual</span>
<span class="text-forge-warning">vim.opt</span>.termguicolors = <span class="text-forge-info">true</span>      <span class="text-forge-muted">-- Colores 24-bit en terminal</span>
<span class="text-forge-warning">vim.opt</span>.cursorline = <span class="text-forge-info">true</span>         <span class="text-forge-muted">-- Resaltar linea actual</span>
<span class="text-forge-warning">vim.opt</span>.signcolumn = <span class="text-forge-success">"yes"</span>        <span class="text-forge-muted">-- Siempre mostrar columna de signos</span>

<span class="text-forge-accent">-- Comportamiento</span>
<span class="text-forge-warning">vim.opt</span>.mouse = <span class="text-forge-success">"a"</span>              <span class="text-forge-muted">-- Habilitar mouse en todos los modos</span>
<span class="text-forge-warning">vim.opt</span>.clipboard = <span class="text-forge-success">"unnamedplus"</span> <span class="text-forge-muted">-- Usar clipboard del sistema</span>
<span class="text-forge-warning">vim.opt</span>.wrap = <span class="text-forge-info">false</span>             <span class="text-forge-muted">-- No hacer wrap de lineas largas</span>
<span class="text-forge-warning">vim.opt</span>.scrolloff = <span class="text-forge-info">8</span>            <span class="text-forge-muted">-- Lineas de contexto al scrollear</span>

<span class="text-forge-accent">-- Busqueda</span>
<span class="text-forge-warning">vim.opt</span>.ignorecase = <span class="text-forge-info">true</span>        <span class="text-forge-muted">-- Ignorar mayusculas en busqueda</span>
<span class="text-forge-warning">vim.opt</span>.smartcase = <span class="text-forge-info">true</span>          <span class="text-forge-muted">-- Si pones mayuscula, busca exacto</span>
<span class="text-forge-warning">vim.opt</span>.hlsearch = <span class="text-forge-info">false</span>         <span class="text-forge-muted">-- No resaltar busquedas previas</span>

<span class="text-forge-accent">-- Archivos</span>
<span class="text-forge-warning">vim.opt</span>.undofile = <span class="text-forge-info">true</span>           <span class="text-forge-muted">-- Persistir undo entre sesiones</span>
<span class="text-forge-warning">vim.opt</span>.swapfile = <span class="text-forge-info">false</span>          <span class="text-forge-muted">-- Sin archivos .swp</span></pre>
        </div>

        <div class="mt-4 p-4 bg-forge-darker rounded-lg border border-forge-accent/20">
          <p class="text-xs text-forge-accent font-bold mb-1">vim.opt vs vim.o vs vim.bo vs vim.wo</p>
          <p class="text-sm text-forge-muted leading-relaxed">
            <code class="code-inline">vim.opt</code> es el mas flexible: detecta si la opcion es global, de
            buffer o de ventana. <code class="code-inline">vim.o</code> setea solo la opcion global.
            <code class="code-inline">vim.bo</code> setea opciones de buffer y
            <code class="code-inline">vim.wo</code> de ventana. En la practica,
            <strong class="text-forge-text">usa vim.opt para todo</strong> — es la API recomendada.
          </p>
        </div>

        <div class="mt-4 p-4 bg-forge-darker rounded-lg border border-forge-info/20">
          <p class="text-xs text-forge-info font-bold mb-1">METODOS DE vim.opt</p>
          <p class="text-sm text-forge-muted leading-relaxed mb-2">
            Para opciones tipo lista (como <code class="code-inline">wildignore</code>), puedes usar
            <code class="code-inline">:append()</code>, <code class="code-inline">:prepend()</code> y
            <code class="code-inline">:remove()</code>:
          </p>
          <div class="code-block">
            <pre class="text-forge-text leading-relaxed"><span class="text-forge-warning">vim.opt</span>.wildignore:append({'{'} <span class="text-forge-success">"*.o"</span>, <span class="text-forge-success">"*.pyc"</span> {'}'})
<span class="text-forge-warning">vim.opt</span>.shortmess:append(<span class="text-forge-success">"c"</span>)</pre>
          </div>
        </div>
      </div>
    </section>
  {/if}

  <!-- ========================================== -->
  <!-- SECCION 3: vim.g                           -->
  <!-- ========================================== -->
  {#if activeSection === 2}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span class="text-forge-accent">3.</span> vim.g — Variables globales
        </h2>

        <p class="text-forge-muted leading-relaxed mb-4">
          <code class="code-inline">vim.g</code> te da acceso a las variables globales de Vim
          (las que en Vimscript escribias como <code class="code-inline">g:variable</code>).
          Muchos plugins y el propio Neovim las usan para configuracion.
        </p>

        <div class="code-block">
          <p class="text-forge-accent text-xs mb-2 font-bold">-- Variables globales esenciales</p>
          <pre class="text-forge-text leading-relaxed"><span class="text-forge-accent">-- Leader keys (DEBEN ir al inicio del init.lua)</span>
<span class="text-forge-warning">vim.g</span>.mapleader = <span class="text-forge-success">" "</span>           <span class="text-forge-muted">-- Espacio como leader key</span>
<span class="text-forge-warning">vim.g</span>.maplocalleader = <span class="text-forge-success">"\\"</span>    <span class="text-forge-muted">-- Backslash como local leader</span>

<span class="text-forge-accent">-- Deshabilitar providers que no usas</span>
<span class="text-forge-warning">vim.g</span>.loaded_netrw = <span class="text-forge-info">1</span>          <span class="text-forge-muted">-- Deshabilitar netrw (si usas nvim-tree)</span>
<span class="text-forge-warning">vim.g</span>.loaded_netrwPlugin = <span class="text-forge-info">1</span>    <span class="text-forge-muted">-- Deshabilitar plugin de netrw</span>
<span class="text-forge-warning">vim.g</span>.loaded_python3_provider = <span class="text-forge-info">0</span> <span class="text-forge-muted">-- Deshabilitar provider de Python</span>
<span class="text-forge-warning">vim.g</span>.loaded_ruby_provider = <span class="text-forge-info">0</span>   <span class="text-forge-muted">-- Deshabilitar provider de Ruby</span>
<span class="text-forge-warning">vim.g</span>.loaded_perl_provider = <span class="text-forge-info">0</span>   <span class="text-forge-muted">-- Deshabilitar provider de Perl</span></pre>
        </div>

        <div class="mt-4 p-4 bg-forge-darker rounded-lg border border-forge-danger/20">
          <p class="text-xs text-forge-danger font-bold mb-1">IMPORTANTE: Orden de mapleader</p>
          <p class="text-sm text-forge-muted leading-relaxed">
            <code class="code-inline">vim.g.mapleader</code> <strong class="text-forge-text">DEBE</strong> setearse
            antes de llamar a <code class="code-inline">require()</code> de cualquier modulo que defina keymaps
            usando <code class="code-inline">&lt;leader&gt;</code>. Si no, esos keymaps usaran la leader por
            defecto (backslash) en vez de la que tu quieres. Esta es una de las causas mas comunes de
            "mis keymaps no funcionan".
          </p>
        </div>

        <div class="mt-4 p-4 bg-forge-darker rounded-lg border border-forge-accent/20">
          <p class="text-xs text-forge-accent font-bold mb-1">vim.g vs vim.opt — ¿Cual uso?</p>
          <div class="mt-2 space-y-2">
            <div class="flex items-start gap-2 text-sm text-forge-muted">
              <span class="text-forge-accent font-bold">vim.opt</span>
              <span>— Para opciones del editor (number, tabstop, wrap, etc.). Son las que cambian el comportamiento de Neovim.</span>
            </div>
            <div class="flex items-start gap-2 text-sm text-forge-muted">
              <span class="text-forge-accent font-bold">vim.g</span>
              <span>— Para variables globales (mapleader, variables de plugins, providers). Son datos que tu o los plugins leen.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}

  <!-- ========================================== -->
  <!-- SECCION 4: vim.keymap.set                  -->
  <!-- ========================================== -->
  {#if activeSection === 3}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span class="text-forge-accent">4.</span> vim.keymap.set — Creando keymaps
        </h2>

        <p class="text-forge-muted leading-relaxed mb-4">
          <code class="code-inline">vim.keymap.set</code> es la API moderna para definir keymaps en Neovim.
          Reemplaza a la vieja <code class="code-inline">vim.api.nvim_set_keymap</code> con una interfaz
          mucho mas limpia. Por defecto ya es <code class="code-inline">noremap</code>, lo cual evita
          mappings recursivos accidentales.
        </p>

        <div class="code-block">
          <p class="text-forge-accent text-xs mb-2 font-bold">-- Sintaxis de vim.keymap.set</p>
          <pre class="text-forge-text leading-relaxed"><span class="text-forge-warning">vim.keymap.set</span>(modo, tecla, accion, opciones)

<span class="text-forge-accent">-- modo: string o tabla de strings</span>
<span class="text-forge-muted">-- "n" = Normal, "i" = Insert, "v" = Visual</span>
<span class="text-forge-muted">-- "x" = Visual Block, "t" = Terminal, "c" = Command</span>
<span class="text-forge-muted">-- {"n", "v"} = Normal Y Visual</span></pre>
        </div>

        <div class="code-block mt-4">
          <p class="text-forge-accent text-xs mb-2 font-bold">-- Keymaps practicos</p>
          <pre class="text-forge-text leading-relaxed"><span class="text-forge-accent">-- Guardar archivo</span>
<span class="text-forge-warning">vim.keymap.set</span>(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;leader&gt;w"</span>, <span class="text-forge-success">":w&lt;CR&gt;"</span>, &#123;
  desc = <span class="text-forge-success">"Guardar archivo"</span>
&#125;)

<span class="text-forge-accent">-- Cerrar buffer</span>
<span class="text-forge-warning">vim.keymap.set</span>(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;leader&gt;q"</span>, <span class="text-forge-success">":bd&lt;CR&gt;"</span>, &#123;
  desc = <span class="text-forge-success">"Cerrar buffer"</span>
&#125;)

<span class="text-forge-accent">-- Limpiar resaltado de busqueda</span>
<span class="text-forge-warning">vim.keymap.set</span>(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;Esc&gt;"</span>, <span class="text-forge-success">":nohlsearch&lt;CR&gt;"</span>, &#123;
  desc = <span class="text-forge-success">"Limpiar busqueda"</span>
&#125;)

<span class="text-forge-accent">-- Mover lineas en visual mode</span>
<span class="text-forge-warning">vim.keymap.set</span>(<span class="text-forge-success">"v"</span>, <span class="text-forge-success">"J"</span>, <span class="text-forge-success">":m '&gt;+1&lt;CR&gt;gv=gv"</span>, &#123;
  desc = <span class="text-forge-success">"Mover seleccion abajo"</span>
&#125;)
<span class="text-forge-warning">vim.keymap.set</span>(<span class="text-forge-success">"v"</span>, <span class="text-forge-success">"K"</span>, <span class="text-forge-success">":m '&lt;-2&lt;CR&gt;gv=gv"</span>, &#123;
  desc = <span class="text-forge-success">"Mover seleccion arriba"</span>
&#125;)

<span class="text-forge-accent">-- Navegar entre ventanas</span>
<span class="text-forge-warning">vim.keymap.set</span>(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;C-h&gt;"</span>, <span class="text-forge-success">"&lt;C-w&gt;h"</span>, &#123;
  desc = <span class="text-forge-success">"Ir a ventana izquierda"</span>
&#125;)
<span class="text-forge-warning">vim.keymap.set</span>(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;C-l&gt;"</span>, <span class="text-forge-success">"&lt;C-w&gt;l"</span>, &#123;
  desc = <span class="text-forge-success">"Ir a ventana derecha"</span>
&#125;)

<span class="text-forge-accent">-- Usar funcion de Lua como accion</span>
<span class="text-forge-warning">vim.keymap.set</span>(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;leader&gt;x"</span>, <span class="text-forge-info">function</span>()
  <span class="text-forge-warning">print</span>(<span class="text-forge-success">"Ejecutando funcion Lua!"</span>)
<span class="text-forge-info">end</span>, &#123; desc = <span class="text-forge-success">"Ejecutar funcion"</span> &#125;)</pre>
        </div>

        <div class="mt-4 p-4 bg-forge-darker rounded-lg border border-forge-accent/20">
          <p class="text-xs text-forge-accent font-bold mb-1">La tabla de opciones</p>
          <div class="mt-2 space-y-2 text-sm text-forge-muted">
            <p><code class="code-inline">desc</code> — Descripcion del keymap. Aparece en <code class="code-inline">:map</code> y en plugins como which-key.</p>
            <p><code class="code-inline">silent</code> — No mostrar el comando en la barra de comandos (default: false).</p>
            <p><code class="code-inline">noremap</code> — No permitir remapping recursivo (default: true en vim.keymap.set).</p>
            <p><code class="code-inline">buffer</code> — Keymap solo para el buffer actual (util en autocommands).</p>
            <p><code class="code-inline">expr</code> — La accion es una expresion que se evalua (para keymaps dinamicos).</p>
          </div>
        </div>
      </div>
    </section>
  {/if}

  <!-- ========================================== -->
  <!-- SECCION 5: Autocommands basicos            -->
  <!-- ========================================== -->
  {#if activeSection === 4}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span class="text-forge-accent">5.</span> Autocommands basicos
        </h2>

        <p class="text-forge-muted leading-relaxed mb-4">
          Los autocommands ejecutan codigo automaticamente cuando ocurre un evento en Neovim.
          Piensa en ellos como <strong class="text-forge-text">event listeners</strong>: "cuando pase X, haz Y".
          En Lua se crean con <code class="code-inline">vim.api.nvim_create_autocmd</code>.
        </p>

        <div class="code-block">
          <p class="text-forge-accent text-xs mb-2 font-bold">-- Sintaxis basica</p>
          <pre class="text-forge-text leading-relaxed"><span class="text-forge-warning">vim.api.nvim_create_autocmd</span>(evento, &#123;
  group = grupo,       <span class="text-forge-muted">-- Grupo (para evitar duplicados)</span>
  pattern = patron,    <span class="text-forge-muted">-- Patron de archivo/filetype</span>
  callback = funcion,  <span class="text-forge-muted">-- Funcion a ejecutar</span>
&#125;)</pre>
        </div>

        <div class="code-block mt-4">
          <p class="text-forge-accent text-xs mb-2 font-bold">-- Ejemplos practicos</p>
          <pre class="text-forge-text leading-relaxed"><span class="text-forge-accent">-- Crear un grupo para evitar duplicados al recargar config</span>
<span class="text-forge-info">local</span> augroup = <span class="text-forge-warning">vim.api.nvim_create_augroup</span>(<span class="text-forge-success">"MiConfig"</span>, &#123;
  clear = <span class="text-forge-info">true</span>
&#125;)

<span class="text-forge-accent">-- Resaltar texto cuando lo copias (yank)</span>
<span class="text-forge-warning">vim.api.nvim_create_autocmd</span>(<span class="text-forge-success">"TextYankPost"</span>, &#123;
  group = augroup,
  callback = <span class="text-forge-info">function</span>()
    <span class="text-forge-warning">vim.highlight.on_yank</span>(&#123; timeout = <span class="text-forge-info">200</span> &#125;)
  <span class="text-forge-info">end</span>,
  desc = <span class="text-forge-success">"Resaltar texto copiado"</span>,
&#125;)

<span class="text-forge-accent">-- Quitar espacios en blanco al guardar</span>
<span class="text-forge-warning">vim.api.nvim_create_autocmd</span>(<span class="text-forge-success">"BufWritePre"</span>, &#123;
  group = augroup,
  pattern = <span class="text-forge-success">"*"</span>,
  callback = <span class="text-forge-info">function</span>()
    <span class="text-forge-warning">vim.cmd</span>(<span class="text-forge-success">[[%s/\s\+$//e]]</span>)
  <span class="text-forge-info">end</span>,
  desc = <span class="text-forge-success">"Limpiar espacios trailing"</span>,
&#125;)

<span class="text-forge-accent">-- Configuracion especifica por tipo de archivo</span>
<span class="text-forge-warning">vim.api.nvim_create_autocmd</span>(<span class="text-forge-success">"FileType"</span>, &#123;
  group = augroup,
  pattern = &#123; <span class="text-forge-success">"lua"</span>, <span class="text-forge-success">"javascript"</span>, <span class="text-forge-success">"typescript"</span> &#125;,
  callback = <span class="text-forge-info">function</span>()
    <span class="text-forge-warning">vim.opt_local</span>.tabstop = <span class="text-forge-info">2</span>
    <span class="text-forge-warning">vim.opt_local</span>.shiftwidth = <span class="text-forge-info">2</span>
  <span class="text-forge-info">end</span>,
  desc = <span class="text-forge-success">"Tabs de 2 para Lua/JS/TS"</span>,
&#125;)

<span class="text-forge-accent">-- Abrir archivos en la ultima posicion editada</span>
<span class="text-forge-warning">vim.api.nvim_create_autocmd</span>(<span class="text-forge-success">"BufReadPost"</span>, &#123;
  group = augroup,
  callback = <span class="text-forge-info">function</span>(args)
    <span class="text-forge-info">local</span> mark = <span class="text-forge-warning">vim.api.nvim_buf_get_mark</span>(args.buf, <span class="text-forge-success">'"'</span>)
    <span class="text-forge-info">local</span> lcount = <span class="text-forge-warning">vim.api.nvim_buf_line_count</span>(args.buf)
    <span class="text-forge-info">if</span> mark[<span class="text-forge-info">1</span>] &gt; <span class="text-forge-info">0</span> <span class="text-forge-info">and</span> mark[<span class="text-forge-info">1</span>] &lt;= lcount <span class="text-forge-info">then</span>
      <span class="text-forge-warning">pcall</span>(<span class="text-forge-warning">vim.api.nvim_win_set_cursor</span>, <span class="text-forge-info">0</span>, mark)
    <span class="text-forge-info">end</span>
  <span class="text-forge-info">end</span>,
  desc = <span class="text-forge-success">"Restaurar posicion del cursor"</span>,
&#125;)</pre>
        </div>

        <div class="mt-4 p-4 bg-forge-darker rounded-lg border border-forge-accent/20">
          <p class="text-xs text-forge-accent font-bold mb-1">Eventos mas comunes</p>
          <div class="mt-2 space-y-1 text-sm text-forge-muted">
            <p><code class="code-inline">BufWritePre</code> — Antes de guardar un archivo</p>
            <p><code class="code-inline">BufReadPost</code> — Despues de leer un archivo</p>
            <p><code class="code-inline">FileType</code> — Cuando se detecta el tipo de archivo</p>
            <p><code class="code-inline">TextYankPost</code> — Despues de copiar texto</p>
            <p><code class="code-inline">VimEnter</code> — Cuando Neovim termina de iniciar</p>
            <p><code class="code-inline">BufEnter</code> — Al entrar a un buffer</p>
            <p><code class="code-inline">InsertEnter</code> / <code class="code-inline">InsertLeave</code> — Al entrar/salir del modo insert</p>
          </div>
        </div>

        <div class="mt-4 p-4 bg-forge-darker rounded-lg border border-forge-danger/20">
          <p class="text-xs text-forge-danger font-bold mb-1">¿Por que usar augroup con clear = true?</p>
          <p class="text-sm text-forge-muted leading-relaxed">
            Si recargas tu configuracion con <code class="code-inline">:source %</code>, los autocommands se
            registran de nuevo sin eliminar los anteriores. Esto causa que se ejecuten multiples veces.
            Al usar <code class="code-inline">nvim_create_augroup</code> con <code class="code-inline">clear = true</code>,
            se limpian los autocommands previos del grupo cada vez que se carga el archivo.
          </p>
        </div>
      </div>
    </section>
  {/if}

  <!-- ========================================== -->
  <!-- SECCION 6: Organizando la config           -->
  <!-- ========================================== -->
  {#if activeSection === 5}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span class="text-forge-accent">6.</span> Organizando la configuracion
        </h2>

        <p class="text-forge-muted leading-relaxed mb-4">
          Un init.lua de 500 lineas es dificil de mantener. La solucion es dividir tu config en
          multiples archivos usando <code class="code-inline">require()</code>, que ya aprendiste en el
          modulo anterior. Cada archivo se convierte en un modulo Lua que se carga bajo demanda.
        </p>

        <div class="code-block">
          <p class="text-forge-accent text-xs mb-2 font-bold">-- init.lua limpio y organizado</p>
          <pre class="text-forge-text leading-relaxed"><span class="text-forge-accent">-- Leader key PRIMERO (antes de cualquier require)</span>
<span class="text-forge-warning">vim.g</span>.mapleader = <span class="text-forge-success">" "</span>
<span class="text-forge-warning">vim.g</span>.maplocalleader = <span class="text-forge-success">"\\"</span>

<span class="text-forge-accent">-- Cargar modulos de configuracion</span>
<span class="text-forge-warning">require</span>(<span class="text-forge-success">"config.options"</span>)    <span class="text-forge-muted">-- lua/config/options.lua</span>
<span class="text-forge-warning">require</span>(<span class="text-forge-success">"config.keymaps"</span>)    <span class="text-forge-muted">-- lua/config/keymaps.lua</span>
<span class="text-forge-warning">require</span>(<span class="text-forge-success">"config.autocmds"</span>)   <span class="text-forge-muted">-- lua/config/autocmds.lua</span>

<span class="text-forge-accent">-- Cargar setup de plugins</span>
<span class="text-forge-warning">require</span>(<span class="text-forge-success">"plugins"</span>)            <span class="text-forge-muted">-- lua/plugins/init.lua</span></pre>
        </div>

        <div class="code-block mt-4">
          <p class="text-forge-accent text-xs mb-2 font-bold">-- lua/config/options.lua</p>
          <pre class="text-forge-text leading-relaxed"><span class="text-forge-accent">-- Este archivo solo contiene vim.opt settings</span>
<span class="text-forge-info">local</span> opt = <span class="text-forge-warning">vim.opt</span>

opt.number = <span class="text-forge-info">true</span>
opt.relativenumber = <span class="text-forge-info">true</span>
opt.tabstop = <span class="text-forge-info">2</span>
opt.shiftwidth = <span class="text-forge-info">2</span>
opt.expandtab = <span class="text-forge-info">true</span>
opt.smartindent = <span class="text-forge-info">true</span>
opt.termguicolors = <span class="text-forge-info">true</span>
opt.cursorline = <span class="text-forge-info">true</span>
opt.mouse = <span class="text-forge-success">"a"</span>
opt.clipboard = <span class="text-forge-success">"unnamedplus"</span>
opt.undofile = <span class="text-forge-info">true</span></pre>
        </div>

        <div class="code-block mt-4">
          <p class="text-forge-accent text-xs mb-2 font-bold">-- lua/config/keymaps.lua</p>
          <pre class="text-forge-text leading-relaxed"><span class="text-forge-accent">-- Alias local para no escribir tanto</span>
<span class="text-forge-info">local</span> map = <span class="text-forge-warning">vim.keymap.set</span>

<span class="text-forge-accent">-- Guardar y cerrar</span>
map(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;leader&gt;w"</span>, <span class="text-forge-success">":w&lt;CR&gt;"</span>, &#123; desc = <span class="text-forge-success">"Guardar"</span> &#125;)
map(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;leader&gt;q"</span>, <span class="text-forge-success">":bd&lt;CR&gt;"</span>, &#123; desc = <span class="text-forge-success">"Cerrar buffer"</span> &#125;)

<span class="text-forge-accent">-- Navegacion entre ventanas</span>
map(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;C-h&gt;"</span>, <span class="text-forge-success">"&lt;C-w&gt;h"</span>, &#123; desc = <span class="text-forge-success">"Ventana izquierda"</span> &#125;)
map(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;C-j&gt;"</span>, <span class="text-forge-success">"&lt;C-w&gt;j"</span>, &#123; desc = <span class="text-forge-success">"Ventana abajo"</span> &#125;)
map(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;C-k&gt;"</span>, <span class="text-forge-success">"&lt;C-w&gt;k"</span>, &#123; desc = <span class="text-forge-success">"Ventana arriba"</span> &#125;)
map(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;C-l&gt;"</span>, <span class="text-forge-success">"&lt;C-w&gt;l"</span>, &#123; desc = <span class="text-forge-success">"Ventana derecha"</span> &#125;)

<span class="text-forge-accent">-- Mover lineas en visual</span>
map(<span class="text-forge-success">"v"</span>, <span class="text-forge-success">"J"</span>, <span class="text-forge-success">":m '&gt;+1&lt;CR&gt;gv=gv"</span>, &#123; desc = <span class="text-forge-success">"Mover abajo"</span> &#125;)
map(<span class="text-forge-success">"v"</span>, <span class="text-forge-success">"K"</span>, <span class="text-forge-success">":m '&lt;-2&lt;CR&gt;gv=gv"</span>, &#123; desc = <span class="text-forge-success">"Mover arriba"</span> &#125;)</pre>
        </div>

        <div class="mt-4 p-4 bg-forge-darker rounded-lg border border-forge-accent/20">
          <p class="text-xs text-forge-accent font-bold mb-1">Patron comun: alias locales</p>
          <p class="text-sm text-forge-muted leading-relaxed">
            Notaras que al inicio de cada archivo creamos variables locales como
            <code class="code-inline">local opt = vim.opt</code> o
            <code class="code-inline">local map = vim.keymap.set</code>.
            Esto no es solo por comodidad — en Lua, acceder a una variable local es mas rapido que
            acceder a una tabla global. Es una micro-optimizacion, pero es un buen habito y hace el
            codigo mas legible.
          </p>
        </div>

        <div class="mt-4 p-4 bg-forge-darker rounded-lg border border-forge-info/20">
          <p class="text-xs text-forge-info font-bold mb-1">RECUERDA: require() cachea modulos</p>
          <p class="text-sm text-forge-muted leading-relaxed">
            Lua cachea los modulos en <code class="code-inline">package.loaded</code>.
            Si haces <code class="code-inline">require("config.options")</code> dos veces, solo se ejecuta
            la primera. Esto es bueno para rendimiento, pero si modificas el archivo y quieres
            recargarlo sin reiniciar Neovim, necesitas limpiar el cache:
            <code class="code-inline">package.loaded["config.options"] = nil</code>.
          </p>
        </div>
      </div>
    </section>
  {/if}

  <!-- ========================================== -->
  <!-- PLAYGROUND                                  -->
  <!-- ========================================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-xl font-bold text-forge-accent mb-4">Practica: Tabla de configuracion</h2>
    <p class="text-sm text-forge-muted mb-4">
      Aunque no puedes ejecutar vim.opt en el navegador, las tablas de configuracion son Lua puro.
      Practica creando una estructura de config como las que usarias en tu init.lua.
    </p>
    <CodePlayground exercise={playgroundExercise} />
  </section>

  <!-- ========================================== -->
  <!-- SEPARADOR ANTES DEL ESCENARIO              -->
  <!-- ========================================== -->
  <div class="my-10 border-t border-forge-border"></div>

  <!-- ========================================== -->
  <!-- ESCENARIO INTERACTIVO                      -->
  <!-- ========================================== -->
  <section class="fade-in">
    <div class="text-center mb-6">
      <span class="text-3xl">🛠️</span>
      <h2 class="text-2xl font-black mt-2">Pon a prueba tus conocimientos</h2>
      <p class="text-forge-muted text-sm mt-1">
        Simula la configuracion de tu Neovim desde cero. Cada decision cuenta.
      </p>
    </div>

    <BranchingScenario
      title="Configura tu Neovim"
      nodes={scenarioNodes}
      startId="start"
      onComplete={completeModule}
    />
  </section>

  <!-- ========================================== -->
  <!-- MENSAJE DE COMPLETADO                      -->
  <!-- ========================================== -->
  {#if completed}
    <div class="card mt-8 border-forge-accent/50 glow-accent fade-in text-center">
      <span class="text-4xl">⚙️</span>
      <h3 class="text-xl font-bold mt-2">Modulo completado!</h3>
      <p class="text-forge-muted text-sm mt-2">
        Ya sabes como estructurar tu init.lua, configurar opciones, crear keymaps
        y organizar tu config en modulos. En el siguiente modulo exploraremos la
        API de Neovim a fondo.
      </p>
    </div>
  {/if}

  <!-- ========================================== -->
  <!-- FUENTES Y NAVEGACION                       -->
  <!-- ========================================== -->
  <SourcesSection sources={mod.sources} />
  <ModuleNav currentModule={4} />
</div>

<!-- ========================================== -->
<!-- COMPONENTES FLOTANTES                      -->
<!-- ========================================== -->
<VocabularyFloat moduleId={4} />

{#if showBadge && earnedBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}
