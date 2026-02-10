<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import Quiz from '$lib/components/Quiz.svelte';
  import DragDrop from '$lib/components/DragDrop.svelte';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';

  const mod = modules.find(m => m.id === 8)!;

  let dragScore = $state(0);
  let dragMax = $state(0);
  let dragDone = $state(false);
  let quizScore = $state(0);
  let quizMax = $state(0);
  let quizDone = $state(false);
  let showBadge = $state(false);
  let earnedBadge = $state<any>(null);

  /* ── Drag & Drop: archivos del plugin → proposito ── */
  const dragItems = [
    { id: 'init', label: 'lua/plugin/init.lua' },
    { id: 'plugindir', label: 'plugin/plugin.lua' },
    { id: 'doc', label: 'doc/plugin.txt' },
    { id: 'test', label: 'tests/plugin_spec.lua' },
    { id: 'readme', label: 'README.md' }
  ];

  const dropZones = [
    { id: 'z1', label: 'Codigo principal del plugin', correctItemId: 'init' },
    { id: 'z2', label: 'Auto-carga de comandos', correctItemId: 'plugindir' },
    { id: 'z3', label: 'Documentacion accesible via :help', correctItemId: 'doc' },
    { id: 'z4', label: 'Tests automatizados', correctItemId: 'test' },
    { id: 'z5', label: 'Instrucciones de instalacion', correctItemId: 'readme' }
  ];

  /* ── Quiz ── */
  const quizQuestions = [
    {
      question: 'Que funcion llama lazy.nvim para configurar un plugin?',
      options: [
        { text: 'init()', correct: false, explanation: 'init() es una funcion de ciclo de vida de lazy.nvim que se ejecuta durante el inicio, pero no es la que recibe la configuracion del usuario.' },
        { text: 'setup()', correct: true, explanation: 'Correcto! El patron estandar es que el plugin exponga una funcion setup(opts) que recibe la tabla de configuracion del usuario y la mezcla con los valores por defecto.' },
        { text: 'config()', correct: false, explanation: 'config es la clave que se usa en la spec de lazy.nvim para definir COMO configurar el plugin, pero la funcion que el plugin expone se llama setup().' },
        { text: 'load()', correct: false, explanation: 'load() no es parte del patron estandar de configuracion de plugins de Neovim.' }
      ],
      source: 'lazy.nvim - Plugin Spec',
      sourceUrl: 'https://github.com/folke/lazy.nvim'
    },
    {
      question: 'Que hace vim.tbl_deep_extend("force", a, b)?',
      options: [
        { text: 'Copia solo las claves que existen en a', correct: false, explanation: 'vim.tbl_deep_extend con "force" no filtra por claves existentes, sino que mezcla TODAS las claves de b en a.' },
        { text: 'Mezcla recursivamente b en a, donde b tiene prioridad', correct: true, explanation: 'Correcto! "force" significa que los valores de la ultima tabla (b) sobreescriben los de la primera (a). La mezcla es recursiva (deep), asi que las tablas anidadas tambien se mezclan.' },
        { text: 'Crea una tabla nueva solo con las claves comunes', correct: false, explanation: 'No calcula la interseccion. Mezcla TODAS las claves de ambas tablas, con b teniendo prioridad en caso de conflicto.' },
        { text: 'Concatena las dos tablas como arrays', correct: false, explanation: 'vim.tbl_deep_extend trabaja con tablas como diccionarios, no concatena arrays. Para eso usarias vim.list_extend.' }
      ],
      source: 'Neovim Lua Reference',
      sourceUrl: 'https://neovim.io/doc/user/lua.html'
    },
    {
      question: 'Que framework de testing se usa comunmente para plugins de Neovim?',
      options: [
        { text: 'busted (standalone)', correct: false, explanation: 'busted es el framework subyacente, pero en el ecosistema de Neovim se usa a traves de plenary.nvim que lo integra con el entorno de Neovim.' },
        { text: 'plenary.nvim', correct: true, explanation: 'Correcto! plenary.nvim incluye PlenaryBustedDirectory y PlenaryBustedFile que permiten correr tests estilo busted dentro de una instancia de Neovim.' },
        { text: 'luaunit', correct: false, explanation: 'luaunit es un framework de testing para Lua generico, pero no esta integrado con Neovim como plenary.nvim.' },
        { text: 'vim.test', correct: false, explanation: 'vim.test no existe en la API de Neovim. El framework estandar del ecosistema es plenary.nvim.' }
      ],
      source: 'plenary.nvim - Test Framework',
      sourceUrl: 'https://github.com/nvim-lua/plenary.nvim'
    },
    {
      question: 'Como generas las etiquetas de ayuda desde el directorio doc/?',
      options: [
        { text: ':helptags doc/', correct: true, explanation: 'Correcto! El comando :helptags doc/ escanea los archivos .txt en doc/ y genera el archivo tags que permite acceder a la documentacion con :help.' },
        { text: ':generate-tags doc/', correct: false, explanation: 'Ese comando no existe en Neovim. El comando correcto es :helptags.' },
        { text: ':docs build', correct: false, explanation: 'No existe un comando :docs en Neovim. Las helptags se generan con :helptags.' },
        { text: 'make docs', correct: false, explanation: 'Algunos plugins usan Makefiles, pero el mecanismo nativo de Neovim para generar tags de ayuda es :helptags doc/.' }
      ],
      source: 'Neovim - helptags',
      sourceUrl: 'https://neovim.io/doc/user/helphelp.html'
    },
    {
      question: 'En que directorio busca lazy.nvim el codigo que se auto-carga (commands, autocommands)?',
      options: [
        { text: 'lua/', correct: false, explanation: 'lua/ contiene los modulos que se cargan con require(). El codigo de auto-carga va en otro directorio.' },
        { text: 'plugin/', correct: true, explanation: 'Correcto! Los archivos en plugin/ se ejecutan automaticamente cuando Neovim carga el plugin. Ahi van los comandos de usuario, autocommands y todo lo que debe existir sin require() explicito.' },
        { text: 'autoload/', correct: false, explanation: 'autoload/ es un patron de Vimscript, no de plugins Lua modernos. En Lua se usa plugin/ para auto-carga.' },
        { text: 'init/', correct: false, explanation: 'No existe una convencion init/ para plugins. El punto de entrada es lua/nombre/init.lua y la auto-carga va en plugin/.' }
      ],
      source: 'lazy.nvim - Plugin Structure',
      sourceUrl: 'https://github.com/folke/lazy.nvim'
    },
    {
      question: 'Cual es la forma estandar de ejecutar los tests de un plugin headlessly?',
      options: [
        { text: 'lua tests/run.lua', correct: false, explanation: 'Ejecutar Lua directamente no carga el entorno de Neovim, que es necesario para testear plugins.' },
        { text: 'nvim --headless con PlenaryBustedDirectory', correct: true, explanation: 'Correcto! Se usa nvim --headless -c "PlenaryBustedDirectory tests/ {minimal_init = \'tests/minimal_init.lua\'}" para correr todos los tests sin interfaz grafica.' },
        { text: ':source tests/', correct: false, explanation: ':source ejecuta un archivo Vimscript/Lua pero no es un framework de testing. No tiene soporte para assertions ni reportes.' },
        { text: 'make test', correct: false, explanation: 'Algunos plugins usan make test como wrapper, pero internamente llaman a nvim --headless con PlenaryBustedDirectory. La forma estandar directa es esa.' }
      ],
      source: 'plenary.nvim - Running tests',
      sourceUrl: 'https://github.com/nvim-lua/plenary.nvim'
    }
  ];

  /* ── Callbacks de completado ── */
  function onDragComplete(correct: number, total: number) {
    dragScore = correct;
    dragMax = total;
    dragDone = true;
    checkComplete();
  }

  function onQuizComplete(score: number, total: number) {
    quizScore = score;
    quizMax = total;
    quizDone = true;
    checkComplete();
  }

  function checkComplete() {
    if (dragDone && quizDone) {
      const total = dragScore + quizScore;
      const max = dragMax + quizMax;
      courseStore.completeModule(8, total, max);

      // Verificar si TODOS los 8 modulos estan completados para el badge final
      let allDone = false;
      courseStore.subscribe(s => {
        allDone = Object.keys(s.modules).length === 8 &&
          Object.values(s.modules).every((m: any) => m.completed);
      })();

      if (allDone) {
        const badge = allBadges.find(b => b.id === 'forjador-completo')!;
        courseStore.unlockBadge(badge);
        earnedBadge = badge;
      }
      showBadge = true;
    }
  }

  $effect(() => {
    courseStore.startModule(8);
  });
</script>

<svelte:head>
  <title>{mod.title} — La Forja de Lua</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">

  <!-- ===================== HEADER DEL MODULO ===================== -->
  <header class="mb-10 fade-in">
    <div class="flex items-center gap-3 mb-2">
      <span class="text-4xl">{mod.icon}</span>
      <div>
        <p class="text-xs text-forge-muted uppercase tracking-wider font-bold">Modulo 8</p>
        <h1 class="text-3xl font-black text-forge-accent">{mod.title}</h1>
      </div>
    </div>
    <p class="text-forge-muted mt-1 text-lg">{mod.subtitle}</p>
    <p class="text-sm text-forge-muted mt-3 leading-relaxed">{mod.description}</p>

    <div class="mt-4 flex flex-wrap gap-2">
      <span class="badge bg-forge-accent/20 text-forge-accent">{mod.duration}</span>
      <span class="badge bg-forge-info/20 text-forge-info">{mod.type}</span>
    </div>

    <div class="card mt-6">
      <p class="text-xs text-forge-muted uppercase tracking-wider font-bold mb-3">Objetivos de aprendizaje</p>
      <ul class="space-y-2">
        {#each mod.objectives as obj}
          <li class="flex items-start gap-2 text-sm">
            <span class="text-forge-accent mt-0.5">&#10148;</span>
            <span>{obj}</span>
          </li>
        {/each}
      </ul>
    </div>
  </header>

  <!-- ===================== SECCION 1: ESTRUCTURA PARA LAZY.NVIM ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">1. Estructura para lazy.nvim</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Para que <strong>lazy.nvim</strong> (el gestor de plugins mas popular de Neovim) pueda cargar tu
        plugin correctamente, necesitas respetar una estructura de directorios especifica. No es capricho:
        esta estructura sigue las convenciones del ecosistema y permite carga automatica, documentacion
        integrada y testing.
      </p>

      <div class="code-block"><pre>mi-plugin.nvim/
├── lua/
│   └── mi-plugin/
│       ├── init.lua      -- Punto de entrada (require("mi-plugin"))
│       └── config.lua    -- Configuracion por defecto
├── plugin/
│   └── mi-plugin.lua     -- Auto-carga (commands, autocommands)
├── doc/
│   └── mi-plugin.txt     -- Documentacion :help
├── tests/
│   └── mi-plugin_spec.lua
├── README.md
└── LICENSE</pre></div>

      <div class="card bg-forge-darker border-forge-accent/30">
        <p class="text-xs text-forge-accent font-bold uppercase tracking-wider mb-2">Como funciona</p>
        <ul class="space-y-2 text-forge-muted">
          <li>
            <span class="text-forge-accent">&#10148;</span>
            <strong>lua/</strong> — lazy.nvim agrega este directorio al <code class="code-inline">runtimepath</code>.
            Cuando alguien hace <code class="code-inline">require("mi-plugin")</code>, Neovim busca
            <code class="code-inline">lua/mi-plugin/init.lua</code>.
          </li>
          <li>
            <span class="text-forge-accent">&#10148;</span>
            <strong>plugin/</strong> — Los archivos aqui se ejecutan <strong>automaticamente</strong> cuando
            Neovim carga el plugin. Ideal para registrar comandos de usuario y autocommands.
          </li>
          <li>
            <span class="text-forge-accent">&#10148;</span>
            <strong>doc/</strong> — Documentacion en formato vimdoc. Accesible con <code class="code-inline">:help mi-plugin</code>
            despues de generar las tags.
          </li>
          <li>
            <span class="text-forge-accent">&#10148;</span>
            <strong>tests/</strong> — Tests automatizados usando plenary.nvim. La convencion es que los
            archivos terminen en <code class="code-inline">_spec.lua</code>.
          </li>
        </ul>
      </div>

      <p>
        El archivo <code class="code-inline">init.lua</code> es el corazon del plugin. Es lo que se carga
        cuando alguien hace <code class="code-inline">require("mi-plugin")</code>. Debe retornar una tabla
        (el modulo) con al menos la funcion <code class="code-inline">setup()</code>.
      </p>
    </div>
  </section>

  <!-- ===================== SECCION 2: EL PATRON SETUP() ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">2. El patron setup()</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        El patron <code class="code-inline">setup()</code> es la convencion universal para configurar plugins de
        Neovim. La idea es simple: el plugin define valores por defecto, y el usuario puede sobreescribir
        solo los que necesite. La funcion <code class="code-inline">vim.tbl_deep_extend</code> hace la
        mezcla recursiva.
      </p>

      <div class="code-block"><pre>-- lua/mi-plugin/init.lua
local M = {'{'}{'}'}

local config = {'{'}
  width = 0.6,
  height = 0.4,
  border = "rounded",
{'}'}

function M.setup(opts)
  config = vim.tbl_deep_extend("force", config, opts or {'{'}{'}'})
end

-- El resto del plugin usa `config` para acceder a la configuracion
function M.open()
  -- usa config.width, config.height, config.border
end

return M</pre></div>

      <p>
        Desde el lado del usuario, la configuracion del plugin en <strong>lazy.nvim</strong> se ve asi:
      </p>

      <div class="code-block"><pre>-- En la configuracion de lazy.nvim del usuario
{'{'}
  "usuario/mi-plugin.nvim",
  config = function()
    require("mi-plugin").setup({'{'}
      width = 0.8,       -- sobreescribe el default (0.6)
      border = "double",  -- sobreescribe el default ("rounded")
      -- height no se especifica, usa el default (0.4)
    {'}'})
  end,
{'}'}</pre></div>

      <div class="card bg-forge-darker border-forge-warning/30">
        <p class="text-xs text-forge-warning font-bold uppercase tracking-wider mb-2">Detalle importante</p>
        <p class="text-forge-muted">
          <code class="code-inline">vim.tbl_deep_extend("force", config, opts or {'{'}{'}'})</code> — El
          <code class="code-inline">"force"</code> significa que los valores del usuario (opts) tienen
          prioridad sobre los defaults. El <code class="code-inline">or {'{}'}</code> protege contra el caso
          donde el usuario llama <code class="code-inline">setup()</code> sin argumentos.
        </p>
      </div>
    </div>
  </section>

  <!-- ===================== SECCION 3: TESTING CON PLENARY.NVIM ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">3. Testing con plenary.nvim</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        <strong>plenary.nvim</strong> es la libreria de utilidades mas usada en el ecosistema de Neovim.
        Incluye un test runner basado en <strong>busted</strong> que permite escribir tests dentro de una
        instancia real de Neovim. Esto es clave porque tus tests pueden usar toda la API de Neovim.
      </p>

      <div class="code-block"><pre>-- tests/mi-plugin_spec.lua
describe("mi-plugin", function()
  local mi_plugin = require("mi-plugin")

  it("should have setup function", function()
    assert.is_function(mi_plugin.setup)
  end)

  it("should merge config with defaults", function()
    mi_plugin.setup({'{'} width = 0.8 {'}'})
    -- assert que la config se mezclo correctamente
  end)

  it("should create buffer on open", function()
    mi_plugin.open()
    -- assert que el buffer existe
  end)
end)</pre></div>

      <p>
        Para ejecutar los tests necesitas un archivo <code class="code-inline">minimal_init.lua</code> que
        configure el entorno minimo:
      </p>

      <div class="code-block"><pre>-- tests/minimal_init.lua
vim.opt.rtp:append(".")
vim.opt.rtp:append("../plenary.nvim")
vim.cmd("runtime plugin/plenary.vim")</pre></div>

      <p>
        Y luego los ejecutas con Neovim en modo headless (sin interfaz grafica):
      </p>

      <div class="code-block"><pre>nvim --headless -c "PlenaryBustedDirectory tests/ {'{'}minimal_init = 'tests/minimal_init.lua'{'}'}"</pre></div>

      <div class="card bg-forge-darker border-forge-success/30">
        <p class="text-xs text-forge-success font-bold uppercase tracking-wider mb-2">Tip</p>
        <p class="text-forge-muted">
          Puedes agregar este comando como un target en un <code class="code-inline">Makefile</code>
          o como un script en tu CI (GitHub Actions). Asi cada push verifica que tu plugin funciona.
        </p>
      </div>

      <div class="card bg-forge-darker border-forge-accent/30">
        <p class="text-xs text-forge-accent font-bold uppercase tracking-wider mb-2">Estructura de un test</p>
        <ul class="space-y-2 text-forge-muted">
          <li><span class="text-forge-accent">&#10148;</span> <code class="code-inline">describe("nombre", fn)</code> — Agrupa tests relacionados</li>
          <li><span class="text-forge-accent">&#10148;</span> <code class="code-inline">it("descripcion", fn)</code> — Define un test individual</li>
          <li><span class="text-forge-accent">&#10148;</span> <code class="code-inline">assert.is_function(val)</code> — Verifica que el valor es una funcion</li>
          <li><span class="text-forge-accent">&#10148;</span> <code class="code-inline">assert.are.same(expected, actual)</code> — Compara tablas recursivamente</li>
          <li><span class="text-forge-accent">&#10148;</span> <code class="code-inline">assert.is_true(val)</code> / <code class="code-inline">assert.is_nil(val)</code> — Assertions basicas</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- ===================== SECCION 4: DOCUMENTACION CON VIMDOC ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">4. Documentacion con vimdoc</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        La documentacion de plugins de Neovim usa el formato <strong>vimdoc</strong>, un formato de texto
        plano con convenciones especificas. Cuando escribes documentacion en <code class="code-inline">doc/mi-plugin.txt</code>,
        los usuarios pueden acceder a ella con <code class="code-inline">:help mi-plugin</code>.
      </p>

      <div class="code-block"><pre>*mi-plugin.txt*  Descripcion corta del plugin

==============================================================================
CONTENTS                                          *mi-plugin-contents*

  1. Introduction .................. |mi-plugin-introduction|
  2. Setup ........................ |mi-plugin-setup|
  3. Commands ..................... |mi-plugin-commands|

==============================================================================
INTRODUCTION                                     *mi-plugin-introduction*

Descripcion del plugin. Explica que hace, por que existe
y para quien esta disenado.

==============================================================================
SETUP                                            *mi-plugin-setup*

Configuracion por defecto y opciones disponibles:

>lua
  require("mi-plugin").setup({'{'}
    width = 0.6,    -- Ancho relativo de la ventana (0.0 - 1.0)
    height = 0.4,   -- Alto relativo de la ventana (0.0 - 1.0)
    border = "rounded",  -- Estilo del borde
  {'}'})
&lt;

==============================================================================
COMMANDS                                         *mi-plugin-commands*

:MiPluginOpen                                    *:MiPluginOpen*
  Abre la ventana del plugin.

:MiPluginClose                                   *:MiPluginClose*
  Cierra la ventana del plugin.

vim:tw=78:ts=8:ft=help:norl:</pre></div>

      <div class="card bg-forge-darker border-forge-accent/30">
        <p class="text-xs text-forge-accent font-bold uppercase tracking-wider mb-2">Convenciones de vimdoc</p>
        <ul class="space-y-2 text-forge-muted">
          <li><span class="text-forge-accent">&#10148;</span> <code class="code-inline">*tag*</code> — Define una etiqueta (accesible con <code class="code-inline">:help tag</code>)</li>
          <li><span class="text-forge-accent">&#10148;</span> <code class="code-inline">|tag|</code> — Enlace a una etiqueta (hipervinculo dentro de :help)</li>
          <li><span class="text-forge-accent">&#10148;</span> <code class="code-inline">&gt;lua ... &lt;</code> — Bloque de codigo Lua</li>
          <li><span class="text-forge-accent">&#10148;</span> Las lineas de <code class="code-inline">=</code> separan secciones</li>
        </ul>
      </div>

      <p>
        Despues de escribir la documentacion, genera las etiquetas ejecutando dentro de Neovim:
      </p>

      <div class="code-block"><pre>:helptags doc/</pre></div>

      <p>
        Esto crea el archivo <code class="code-inline">doc/tags</code> que Neovim usa internamente para
        resolver las busquedas de <code class="code-inline">:help</code>. lazy.nvim ejecuta
        <code class="code-inline">:helptags</code> automaticamente al instalar un plugin.
      </p>
    </div>
  </section>

  <!-- ===================== SECCION 5: PUBLICAR EN GITHUB ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">5. Publicar en GitHub</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Una vez que tu plugin esta listo, publicarlo es sorprendentemente simple. lazy.nvim instala plugins
        directamente desde repositorios de GitHub, asi que solo necesitas un repo publico con la estructura
        correcta.
      </p>

      <div class="card bg-forge-darker border-forge-accent/30">
        <p class="text-xs text-forge-accent font-bold uppercase tracking-wider mb-2">Pasos para publicar</p>
        <ol class="space-y-3 text-forge-muted list-decimal list-inside">
          <li>
            <strong>Crea un repositorio en GitHub</strong> con el nombre
            <code class="code-inline">mi-plugin.nvim</code> (la convencion <code class="code-inline">.nvim</code>
            indica que es un plugin de Neovim).
          </li>
          <li>
            <strong>Agrega una licencia</strong> — MIT es la mas comun en el ecosistema de Neovim.
          </li>
          <li>
            <strong>Escribe un buen README.md</strong> que incluya: descripcion, captura de pantalla o GIF,
            instrucciones de instalacion (snippet para lazy.nvim), configuracion, comandos disponibles y
            uso basico.
          </li>
          <li>
            <strong>Crea tags de version</strong> usando semantic versioning.
          </li>
          <li>
            <strong>Publica</strong> — haz push y tu plugin ya es instalable.
          </li>
        </ol>
      </div>

      <div class="code-block"><pre># Inicializar el repo y hacer el primer release
git init
git add .
git commit -m "feat: initial release"
git remote add origin https://github.com/usuario/mi-plugin.nvim.git
git push -u origin main

# Crear un tag de version
git tag v1.0.0
git push --tags</pre></div>

      <p>
        A partir de ese momento, cualquier usuario puede instalar tu plugin agregando una sola linea
        en su configuracion de lazy.nvim:
      </p>

      <div class="code-block"><pre>-- En la configuracion de lazy.nvim del usuario
{'{'} "usuario/mi-plugin.nvim" {'}'}</pre></div>

      <div class="card bg-forge-darker border-forge-accent/30">
        <p class="text-xs text-forge-accent font-bold uppercase tracking-wider mb-2">README ideal</p>
        <p class="text-forge-muted mb-3">Un buen README debe incluir estas secciones:</p>
        <ul class="space-y-1 text-forge-muted">
          <li><span class="text-forge-accent">&#10148;</span> <strong>Descripcion</strong> — Que hace tu plugin en una o dos frases</li>
          <li><span class="text-forge-accent">&#10148;</span> <strong>Screenshot/GIF</strong> — Una imagen vale mas que mil palabras</li>
          <li><span class="text-forge-accent">&#10148;</span> <strong>Instalacion</strong> — Snippet listo para copiar en lazy.nvim</li>
          <li><span class="text-forge-accent">&#10148;</span> <strong>Configuracion</strong> — Todas las opciones con sus valores por defecto</li>
          <li><span class="text-forge-accent">&#10148;</span> <strong>Uso</strong> — Comandos y keymaps disponibles</li>
          <li><span class="text-forge-accent">&#10148;</span> <strong>Licencia</strong> — MIT, Apache 2.0, etc.</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- ===================== SECCION 6: BUENAS PRACTICAS ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">6. Buenas practicas para plugins</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Antes de publicar tu plugin, asegurate de seguir estas buenas practicas. Son las que separan
        un plugin amateur de uno profesional.
      </p>

      <div class="grid sm:grid-cols-2 gap-4">
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">Configuracion</p>
          <ul class="space-y-1 text-xs text-forge-muted">
            <li>&#10148; Usa el patron <strong>setup()</strong> siempre</li>
            <li>&#10148; Proporciona valores por defecto <strong>sensatos</strong></li>
            <li>&#10148; Documenta TODAS las opciones</li>
            <li>&#10148; Usa <code class="code-inline">vim.validate</code> para validar inputs</li>
          </ul>
        </div>
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">Codigo limpio</p>
          <ul class="space-y-1 text-xs text-forge-muted">
            <li>&#10148; NO contamines el namespace global</li>
            <li>&#10148; Usa <code class="code-inline">local</code> para todo</li>
            <li>&#10148; Retorna una tabla M con la API publica</li>
            <li>&#10148; Maneja errores con <code class="code-inline">pcall</code></li>
          </ul>
        </div>
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">Calidad</p>
          <ul class="space-y-1 text-xs text-forge-muted">
            <li>&#10148; Escribe tests con plenary.nvim</li>
            <li>&#10148; Configura CI con GitHub Actions</li>
            <li>&#10148; Usa <code class="code-inline">luacheck</code> o <code class="code-inline">selene</code> como linter</li>
            <li>&#10148; Agrega soporte para <code class="code-inline">:checkhealth</code></li>
          </ul>
        </div>
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">Documentacion</p>
          <ul class="space-y-1 text-xs text-forge-muted">
            <li>&#10148; Escribe <code class="code-inline">doc/plugin.txt</code> en formato vimdoc</li>
            <li>&#10148; README completo con ejemplos</li>
            <li>&#10148; Versiona con <strong>semantic versioning</strong></li>
            <li>&#10148; Incluye un CHANGELOG si el plugin crece</li>
          </ul>
        </div>
      </div>

      <p>
        El soporte de <code class="code-inline">:checkhealth</code> permite a los usuarios diagnosticar
        problemas. Se implementa creando un archivo <code class="code-inline">lua/mi-plugin/health.lua</code>:
      </p>

      <div class="code-block"><pre>-- lua/mi-plugin/health.lua
local M = {'{'}{'}'}

function M.check()
  vim.health.start("mi-plugin")

  -- Verificar dependencias
  if pcall(require, "plenary") then
    vim.health.ok("plenary.nvim encontrado")
  else
    vim.health.error("plenary.nvim no encontrado", {'{'}
      "Instala plenary.nvim: https://github.com/nvim-lua/plenary.nvim"
    {'}'})
  end

  -- Verificar version de Neovim
  if vim.fn.has("nvim-0.10") == 1 then
    vim.health.ok("Neovim &gt;= 0.10")
  else
    vim.health.warn("Se recomienda Neovim &gt;= 0.10")
  end
end

return M</pre></div>

      <div class="card bg-forge-darker border-forge-success/30">
        <p class="text-xs text-forge-success font-bold uppercase tracking-wider mb-2">Checklist final</p>
        <p class="text-forge-muted">
          Antes de publicar, verifica: estructura de directorios correcta, setup() con defaults,
          tests pasando, documentacion escrita, README completo, licencia incluida, y al menos un tag
          de version. Con eso tu plugin esta listo para el mundo.
        </p>
      </div>
    </div>
  </section>

  <!-- ===================== EJERCICIO DRAG & DROP ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">Ejercicio: Estructura de un Plugin</h2>
    <p class="text-sm text-forge-muted mb-4">
      Demuestra que entiendes la estructura de un plugin de Neovim. Arrastra cada archivo
      a la descripcion de su proposito.
    </p>

    <DragDrop
      items={dragItems}
      zones={dropZones}
      instruction="Arrastra cada archivo del plugin a su proposito correcto"
      onComplete={onDragComplete}
    />
  </section>

  <!-- ===================== QUIZ ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">Quiz: Testing, Empaquetado y Publicacion</h2>
    <p class="text-sm text-forge-muted mb-4">
      Pon a prueba todo lo que aprendiste en este modulo final. Necesitas dominar estos conceptos
      para publicar plugins profesionales.
    </p>

    <Quiz questions={quizQuestions} onComplete={onQuizComplete} />
  </section>

  <!-- ===================== COMPLETION ===================== -->
  {#if dragDone && quizDone}
    <div class="card mt-6 border-forge-success/50 bg-forge-success/5 slide-in">
      <div class="flex items-center gap-3">
        <span class="text-3xl">&#127942;</span>
        <div>
          <p class="font-bold text-forge-success">Modulo completado!</p>
          <p class="text-sm text-forge-muted mt-1">
            Resultado: {dragScore + quizScore} / {dragMax + quizMax} puntos.
          </p>
          {#if earnedBadge}
            <p class="text-sm text-forge-accent mt-2 font-bold">
              Has completado TODOS los modulos del curso. Eres un Forjador Completo!
            </p>
          {:else}
            <p class="text-sm text-forge-muted mt-2">
              Ya sabes como testear, documentar y publicar plugins de Neovim. Tienes todas las
              herramientas para contribuir al ecosistema. Completa los modulos restantes para
              desbloquear el badge final!
            </p>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  <!-- ===================== SOURCES ===================== -->
  <SourcesSection sources={mod.sources} />

  <!-- ===================== NAVIGATION ===================== -->
  <ModuleNav currentModule={8} />

</div>

<!-- ===================== FLOATING VOCABULARY ===================== -->
<VocabularyFloat moduleId={8} />

<!-- ===================== BADGE NOTIFICATION ===================== -->
{#if showBadge && earnedBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => (showBadge = false)} />
{/if}
