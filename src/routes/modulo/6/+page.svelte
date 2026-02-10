<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import BranchingScenario from '$lib/components/BranchingScenario.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';

  const mod = modules.find(m => m.id === 6)!;

  let scenarioScore = $state(0);
  let scenarioMax = $state(0);
  let scenarioDone = $state(false);
  let quizScore = $state(0);
  let quizMax = $state(0);
  let quizDone = $state(false);
  let showBadge = $state(false);
  let earnedBadge = $state<any>(null);

  function onScenarioComplete(score: number, maxScore: number) {
    scenarioScore = score;
    scenarioMax = maxScore;
    scenarioDone = true;
    checkComplete();
  }

  function onQuizComplete(score: number, total: number) {
    quizScore = score;
    quizMax = total;
    quizDone = true;
    checkComplete();
  }

  function checkComplete() {
    if (scenarioDone && quizDone) {
      const total = scenarioScore + quizScore;
      const max = scenarioMax + quizMax;
      courseStore.completeModule(6, total, max);
      const badge = allBadges.find(b => b.id === 'plugin-creator')!;
      courseStore.unlockBadge(badge);
      earnedBadge = badge;
      showBadge = true;
    }
  }

  /* ── Branching Scenario: Construye tu Plugin ── */
  const scenarioNodes: Record<string, any> = {
    start: {
      id: 'start',
      narrative:
        'Vas a crear un plugin de notas flotantes para Neovim. El plugin debe abrir una ventana flotante donde puedas escribir notas rapidas y que se guarden automaticamente. Primero lo primero: ¿donde pones el codigo principal del modulo Lua de tu plugin?',
      choices: [
        {
          text: 'lua/floatnote/init.lua — Dentro del directorio lua/ siguiendo la convencion de modulos',
          nextId: 'step2',
          points: 3,
          feedback:
            'Correcto. El directorio lua/ es donde Neovim busca modulos Lua. Al poner tu codigo en lua/floatnote/init.lua, puedes hacer require("floatnote") y Neovim lo encuentra automaticamente.'
        },
        {
          text: 'plugin/floatnote.lua — En la carpeta plugin/ que se ejecuta al iniciar',
          nextId: 'step2',
          points: 1,
          feedback:
            'No del todo. La carpeta plugin/ se usa para registrar comandos y keymaps que se ejecutan al iniciar Neovim, pero la logica principal del modulo va en lua/. Si mezclas todo en plugin/ pierdes la capacidad de usar require() limpiamente.'
        },
        {
          text: 'init.lua en la raiz del plugin — Directo, sin subdirectorios',
          nextId: 'step2',
          points: 0,
          feedback:
            'Incorrecto. Un init.lua en la raiz NO es un modulo Lua valido para Neovim. La convencion es usar la estructura lua/nombre-plugin/init.lua para que require() lo pueda localizar correctamente.'
        }
      ]
    },
    step2: {
      id: 'step2',
      narrative:
        'Bien. Ahora necesitas crear un buffer temporal para la ventana flotante. Este buffer no deberia aparecer en la lista de buffers del usuario y debe ser un buffer de borrador (scratch). ¿Que funcion de la API usas para crearlo?',
      choices: [
        {
          text: 'vim.api.nvim_create_buf(false, true) — No listado y scratch',
          nextId: 'step3',
          points: 3,
          feedback:
            'Exacto. nvim_create_buf(false, true) crea un buffer donde el primer argumento (false) significa "no listar en :ls" y el segundo (true) lo marca como scratch buffer. Perfecto para ventanas temporales.'
        },
        {
          text: 'vim.api.nvim_open_win() — Crear la ventana directamente',
          nextId: 'step3',
          points: 1,
          feedback:
            'nvim_open_win() abre una ventana, pero necesita un buffer YA creado como argumento. Primero creas el buffer con nvim_create_buf() y luego lo muestras con nvim_open_win(). Son dos pasos separados.'
        },
        {
          text: 'vim.fn.bufnew() — La funcion clasica de Vimscript',
          nextId: 'step3',
          points: 1,
          feedback:
            'bufnew() funciona pero es la via Vimscript. En un plugin Lua moderno es mas idiomatico usar vim.api.nvim_create_buf() que te da control directo sobre listed y scratch sin pasos extra.'
        }
      ]
    },
    step3: {
      id: 'step3',
      narrative:
        'La ventana flotante ya se abre con tus notas. Ahora quieres que el usuario pueda cerrarla presionando "q" mientras esta dentro de la ventana. Pero OJO: no quieres que "q" deje de funcionar normalmente en otros buffers. ¿Como lo implementas?',
      choices: [
        {
          text: 'vim.keymap.set("n", "q", funcion, { buffer = buf }) — Keymap local al buffer',
          nextId: 'step4',
          points: 3,
          feedback:
            'Perfecto. Al pasar { buffer = buf } el keymap SOLO existe en ese buffer. Cuando el usuario esta en otro buffer, "q" funciona normalmente. Esta es la forma correcta de crear keymaps de plugin.'
        },
        {
          text: 'vim.keymap.set("n", "q", funcion, {}) — Keymap global',
          nextId: 'step4',
          points: 0,
          feedback:
            'Peligroso. Un keymap global sobreescribe "q" en TODOS los buffers. Eso rompe funcionalidad existente (como cerrar ventanas de ayuda, salir del modo de grabacion de macros, etc). Siempre usa { buffer = buf } para keymaps de plugin.'
        },
        {
          text: 'vim.api.nvim_create_autocmd("BufEnter", ...) — Autocmd que setea el keymap',
          nextId: 'step4',
          points: 1,
          feedback:
            'Funciona pero es innecesariamente complicado. ¿Para que usar un autocmd cuando puedes simplemente pasar { buffer = buf } al keymap? Mas codigo, mas complejidad, mas posibilidad de bugs.'
        }
      ]
    },
    step4: {
      id: 'step4',
      narrative:
        'Ultimo paso critico: las notas deben guardarse automaticamente cuando el usuario sale de la ventana flotante. No quieres que pierda su trabajo si olvida guardar manualmente. ¿Cual es tu estrategia?',
      choices: [
        {
          text: 'nvim_create_autocmd("BufLeave", { buffer = buf }) — Autoguardado al salir del buffer',
          nextId: 'end-good',
          points: 3,
          feedback:
            'Excelente. BufLeave se dispara cuando el usuario sale del buffer. Combinado con { buffer = buf } solo se activa para tu buffer de notas. Es la solucion mas limpia y la que mejor UX ofrece.'
        },
        {
          text: 'Crear un comando :FloatNoteSave que el usuario ejecute manualmente',
          nextId: 'end-ok',
          points: 1,
          feedback:
            'Funcional, pero mala experiencia de usuario. Si el usuario olvida guardar, pierde las notas. Un buen plugin automatiza las cosas tediosas. El autoguardado con BufLeave es siempre mejor.'
        },
        {
          text: 'No guardar, que las notas sean temporales',
          nextId: 'end-ok',
          points: 0,
          feedback:
            'Eso le quita toda la utilidad al plugin. Si las notas desaparecen al cerrar la ventana, el usuario no tiene motivo para usarlo. La persistencia es una funcionalidad fundamental.'
        }
      ]
    },
    'end-good': {
      id: 'end-good',
      narrative: '',
      outcome: {
        title: 'Arquitecto de Plugins',
        description:
          'Demostraste un entendimiento solido de la estructura de plugins de Neovim, el manejo de buffers, keymaps locales y autoguardado. Tu plugin seria funcional y con buena UX.',
        score: 0,
        maxScore: 12,
        grade: 'excellent',
        lessons: [
          'La estructura lua/plugin-name/init.lua es la convencion para modulos Lua en Neovim',
          'nvim_create_buf(false, true) crea buffers temporales no listados',
          'Los keymaps de plugin deben ser locales al buffer con { buffer = buf }',
          'BufLeave + autocmd es la forma idiomatica de autoguardar en plugins'
        ]
      }
    },
    'end-ok': {
      id: 'end-ok',
      narrative: '',
      outcome: {
        title: 'Aprendiz de Plugins',
        description:
          'Tienes una base pero hay areas que mejorar. Revisa la estructura de directorios, la diferencia entre keymaps locales y globales, y las estrategias de persistencia.',
        score: 0,
        maxScore: 12,
        grade: 'good',
        lessons: [
          'Revisa la convencion de directorios: lua/ para modulos, plugin/ para bootstrap',
          'nvim_create_buf() se usa ANTES de nvim_open_win() — buffer primero, ventana despues',
          'Siempre usa { buffer = buf } para keymaps que solo deben vivir en un buffer',
          'Automatiza lo que puedas: autoguardar con autocmds mejora la experiencia del usuario'
        ]
      }
    }
  };

  /* ── Quiz: Conceptos de Plugins ── */
  const quizQuestions = [
    {
      question:
        '¿Que patron usan los plugins de Neovim en Lua para exportar funciones?',
      options: [
        {
          text: 'local M = {} ... return M — Tabla de modulo con funciones publicas',
          correct: true,
          explanation:
            'El patron "local M = {}" crea una tabla donde agregas las funciones que quieres exponer. Al hacer "return M" al final, require() devuelve esa tabla y el usuario puede llamar M.toggle(), M.setup(), etc.'
        },
        {
          text: 'module("floatnote", package.seeall) — La funcion module() de Lua',
          correct: false,
          explanation:
            'module() es una funcion de Lua 5.1 que esta deprecada. Neovim usa LuaJIT pero la comunidad adopto el patron "local M = {} return M" como estandar. No uses module().'
        },
        {
          text: 'export default function toggle() — Como en JavaScript',
          correct: false,
          explanation:
            'Lua no tiene "export" ni "default". El sistema de modulos de Lua se basa en require() y return. Cada archivo es un modulo que retorna un valor (generalmente una tabla con funciones).'
        },
        {
          text: 'vim.plugin.register("floatnote", { toggle = ... }) — Registro global',
          correct: false,
          explanation:
            'No existe vim.plugin.register() en la API de Neovim. Los plugins simplemente usan el patron de modulos de Lua con require() y return.'
        }
      ],
      source: 'Neovim Lua Plugin Guide',
      sourceUrl: 'https://neovim.io/doc/user/lua-plugin.html'
    },
    {
      question:
        '¿Que significan los dos argumentos de nvim_create_buf(false, true)?',
      options: [
        {
          text: 'listed=false (no aparece en :ls), scratch=true (buffer temporal)',
          correct: true,
          explanation:
            'El primer argumento controla si el buffer aparece en la lista de buffers (:ls). El segundo lo marca como "scratch" — un buffer temporal sin archivo asociado. Ideal para ventanas flotantes y previews.'
        },
        {
          text: 'readonly=false (se puede editar), hidden=true (buffer oculto)',
          correct: false,
          explanation:
            'Los argumentos no son readonly/hidden. Son "listed" (si aparece en :ls) y "scratch" (si es un buffer temporal). Un buffer scratch no tiene archivo asociado y no pide guardar al cerrar.'
        },
        {
          text: 'modifiable=false, nofile=true',
          correct: false,
          explanation:
            'Esos son opciones de buffer (buftype, modifiable), no los argumentos de nvim_create_buf(). Los argumentos reales son listed (boolean) y scratch (boolean).'
        },
        {
          text: 'No importa el orden, ambos son opcionales',
          correct: false,
          explanation:
            'Ambos argumentos son requeridos y el orden importa. El primero es "listed" y el segundo es "scratch". Si los inviertes, creas un buffer listado y no-scratch, que no es lo que quieres para una ventana flotante.'
        }
      ],
      source: 'Neovim API - nvim_create_buf',
      sourceUrl: 'https://neovim.io/doc/user/api.html#nvim_create_buf()'
    },
    {
      question:
        '¿Como haces que un keymap solo funcione en un buffer especifico?',
      options: [
        {
          text: 'Pasar { buffer = bufnr } como opcion en vim.keymap.set()',
          correct: true,
          explanation:
            'Al incluir buffer = bufnr en la tabla de opciones, el keymap se crea SOLO para ese buffer. Cuando el usuario esta en otro buffer, la tecla tiene su comportamiento normal. Fundamental para plugins.'
        },
        {
          text: 'Usar vim.api.nvim_buf_set_keymap() sin opciones extras',
          correct: false,
          explanation:
            'nvim_buf_set_keymap() tambien funciona para keymaps locales, pero vim.keymap.set() con { buffer = buf } es la forma moderna y preferida. nvim_buf_set_keymap usa la API de bajo nivel y requiere mas argumentos.'
        },
        {
          text: 'Crear el keymap dentro de un if que verifica el buffer actual',
          correct: false,
          explanation:
            'Eso no funciona. Si creas un keymap global con un condicional dentro, el keymap sigue siendo global — solo la accion es condicional. La forma correcta es hacerlo local al buffer con { buffer = buf }.'
        },
        {
          text: 'Los keymaps siempre son globales en Neovim, no se puede',
          correct: false,
          explanation:
            'Falso. Neovim soporta keymaps locales al buffer. Es una funcionalidad fundamental que usan practicamente todos los plugins para no interferir con los keymaps del usuario.'
        }
      ],
      source: 'Neovim Lua Guide',
      sourceUrl: 'https://neovim.io/doc/user/lua-guide.html#lua-guide-mappings'
    },
    {
      question:
        '¿A que directorio apunta vim.fn.stdpath("data") en un sistema Linux?',
      options: [
        {
          text: '~/.local/share/nvim — El directorio de datos de Neovim',
          correct: true,
          explanation:
            'stdpath("data") sigue la especificacion XDG Base Directory. En Linux apunta a ~/.local/share/nvim. Es el lugar correcto para guardar datos persistentes del plugin como archivos de notas, caches, bases de datos, etc.'
        },
        {
          text: '~/.config/nvim — El directorio de configuracion',
          correct: false,
          explanation:
            'Ese es stdpath("config"), no stdpath("data"). La configuracion (init.lua, plugins) va en config. Los datos generados por plugins van en data. Son directorios diferentes a proposito.'
        },
        {
          text: '~/.cache/nvim — El directorio de cache',
          correct: false,
          explanation:
            'Ese es stdpath("cache"). El cache es para datos temporales que se pueden regenerar. Los datos persistentes como notas deben ir en stdpath("data") que no se borra automaticamente.'
        },
        {
          text: '/tmp/nvim — Directorio temporal del sistema',
          correct: false,
          explanation:
            'Nunca guardes datos persistentes en /tmp/. Se borra al reiniciar el sistema. stdpath("data") apunta a ~/.local/share/nvim que es persistente y especifico del usuario.'
        }
      ],
      source: 'Neovim - Standard Paths',
      sourceUrl: 'https://neovim.io/doc/user/starting.html#standard-path'
    }
  ];

  $effect(() => {
    courseStore.startModule(6);
  });
</script>

<svelte:head>
  <title>{mod.title} — La Forja de Lua</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">

  <!-- ===================== MODULE HEADER ===================== -->
  <header class="mb-10 fade-in">
    <div class="flex items-center gap-3 mb-2">
      <span class="text-4xl">{mod.icon}</span>
      <div>
        <p class="text-xs text-forge-muted uppercase tracking-wider font-bold">Modulo 6</p>
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

  <!-- ===================== INTRO ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">Tu Primer Plugin Real</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Hasta ahora aprendiste Lua, configuraste Neovim y exploraste la API. Es hora de juntar
        <strong>todo</strong> en algo real: un plugin que abre una <strong>ventana flotante</strong>
        para tomar notas rapidas. Las notas se guardan automaticamente y persisten entre sesiones.
      </p>

      <div class="card bg-forge-darker border-forge-accent/30">
        <p class="text-xs text-forge-accent font-bold uppercase tracking-wider mb-2">Lo que vas a construir</p>
        <ul class="space-y-1 text-sm text-forge-muted">
          <li>&#10148; Un comando <code class="code-inline">:FloatNote</code> que abre/cierra la ventana</li>
          <li>&#10148; Una ventana flotante centrada con borde redondeado</li>
          <li>&#10148; Carga automatica de notas guardadas</li>
          <li>&#10148; Autoguardado al salir de la ventana</li>
          <li>&#10148; Keymap <code class="code-inline">&lt;leader&gt;fn</code> para toggle rapido</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- ===================== SECCION 1: ESTRUCTURA DEL PLUGIN ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">1. Estructura del Plugin</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Neovim espera que los plugins sigan una <strong>estructura de directorios especifica</strong>.
        No es opcional ni es capricho — es como Neovim localiza y carga el codigo. Esta es la estructura
        de nuestro plugin:
      </p>

      <div class="code-block"><pre>floatnote.nvim/
├── lua/
│   └── floatnote/
│       └── init.lua      -- Modulo principal (logica del plugin)
├── plugin/
│   └── floatnote.lua     -- Bootstrap (comandos y keymaps)
└── README.md             -- Documentacion</pre></div>

      <div class="grid sm:grid-cols-2 gap-4">
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">lua/floatnote/init.lua</p>
          <p class="text-xs text-forge-muted">
            El <strong>modulo principal</strong>. Contiene toda la logica: crear ventana, cargar notas,
            guardar notas, toggle. Cuando haces <code class="code-inline">require("floatnote")</code>,
            Neovim busca exactamente este archivo.
          </p>
        </div>
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">plugin/floatnote.lua</p>
          <p class="text-xs text-forge-muted">
            El <strong>bootstrap</strong>. Se ejecuta automaticamente al cargar el plugin. Aqui registras
            los comandos (<code class="code-inline">:FloatNote</code>) y keymaps globales. Es el "punto de
            entrada" que conecta al usuario con tu modulo.
          </p>
        </div>
      </div>

      <div class="card bg-forge-darker border-forge-warning/30">
        <p class="text-xs text-forge-warning font-bold uppercase tracking-wider mb-2">Regla clave</p>
        <p>
          <strong>Logica en lua/, bootstrap en plugin/</strong>. No mezcles. Si pones toda la logica
          en plugin/ pierdes la capacidad de hacer lazy loading con <code class="code-inline">require()</code>.
          Si pones comandos en lua/ no se registran automaticamente al iniciar Neovim.
        </p>
      </div>
    </div>
  </section>

  <!-- ===================== SECCION 2: MODULO PRINCIPAL ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">2. Paso 1: El Modulo Principal</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Empezamos con el esqueleto del modulo en <code class="code-inline">lua/floatnote/init.lua</code>.
        Usamos el <strong>patron de modulo</strong> estandar de Lua: crear una tabla local, agregar
        funciones, y retornarla.
      </p>

      <div class="code-block"><pre><span class="text-forge-muted">-- lua/floatnote/init.lua</span>
local M = {'{}'}

local buf = nil   <span class="text-forge-muted">-- referencia al buffer de notas</span>
local win = nil   <span class="text-forge-muted">-- referencia a la ventana flotante</span>

<span class="text-forge-muted">-- Ruta donde se guardan las notas (persistente entre sesiones)</span>
local notes_file = vim.fn.stdpath("data") .. "/floatnote.txt"

function M.toggle()
  <span class="text-forge-muted">-- Si la ventana existe y es valida, la cerramos</span>
  if win and vim.api.nvim_win_is_valid(win) then
    vim.api.nvim_win_close(win, true)
    win = nil
    return
  end
  <span class="text-forge-muted">-- Si no existe, la abrimos</span>
  M.open()
end

return M</pre></div>

      <p>Vamos a desglosar que esta pasando:</p>

      <ul class="space-y-2">
        <li class="flex items-start gap-2">
          <span class="text-forge-accent mt-0.5">&#10148;</span>
          <span><code class="code-inline">local M = {'{}'}</code> — La tabla que sera nuestro modulo publico. Solo las funciones que agregas a M son accesibles desde afuera.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-forge-accent mt-0.5">&#10148;</span>
          <span><code class="code-inline">local buf, win</code> — Variables locales del archivo. Son <strong>privadas</strong>: ningun otro modulo puede accederlas. Guardan las referencias al buffer y ventana activos.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-forge-accent mt-0.5">&#10148;</span>
          <span><code class="code-inline">vim.fn.stdpath("data")</code> — Devuelve el directorio de datos de Neovim (~/.local/share/nvim en Linux). Es el lugar correcto para guardar datos persistentes del plugin.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-forge-accent mt-0.5">&#10148;</span>
          <span><code class="code-inline">M.toggle()</code> — Funcion publica que alterna entre abrir y cerrar. Verifica si la ventana existe con <code class="code-inline">nvim_win_is_valid()</code> antes de intentar cerrarla.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-forge-accent mt-0.5">&#10148;</span>
          <span><code class="code-inline">return M</code> — Exporta la tabla. Sin esto, <code class="code-inline">require("floatnote")</code> devolveria <code class="code-inline">true</code> en vez de tu modulo.</span>
        </li>
      </ul>
    </div>
  </section>

  <!-- ===================== SECCION 3: VENTANA FLOTANTE ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">3. Paso 2: Crear la Ventana Flotante</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Esta es la funcion mas importante del plugin. Crea un buffer, calcula las dimensiones de la
        ventana, la abre centrada en la pantalla, y configura keymaps y autoguardado.
      </p>

      <div class="code-block"><pre>function M.open()
  <span class="text-forge-muted">-- 1. Crear un buffer: no listado (false) y scratch (true)</span>
  buf = vim.api.nvim_create_buf(false, true)

  <span class="text-forge-muted">-- 2. Calcular dimensiones (60% ancho, 40% alto del editor)</span>
  local width = math.floor(vim.o.columns * 0.6)
  local height = math.floor(vim.o.lines * 0.4)
  local row = math.floor((vim.o.lines - height) / 2)
  local col = math.floor((vim.o.columns - width) / 2)

  <span class="text-forge-muted">-- 3. Abrir la ventana flotante</span>
  win = vim.api.nvim_open_win(buf, true, {'{}'}
    relative = "editor",    <span class="text-forge-muted">-- posicion relativa al editor</span>
    width = width,
    height = height,
    row = row,              <span class="text-forge-muted">-- fila (desde arriba)</span>
    col = col,              <span class="text-forge-muted">-- columna (desde la izquierda)</span>
    style = "minimal",      <span class="text-forge-muted">-- sin numeros, sin signcolumn</span>
    border = "rounded",     <span class="text-forge-muted">-- borde redondeado</span>
    title = " Notas ",      <span class="text-forge-muted">-- titulo en el borde</span>
    title_pos = "center",   <span class="text-forge-muted">-- titulo centrado</span>
  {'}'})

  <span class="text-forge-muted">-- 4. Cargar notas guardadas</span>
  M.load_notes()

  <span class="text-forge-muted">-- 5. Keymap local: "q" cierra la ventana (solo en este buffer)</span>
  vim.keymap.set("n", "q", function()
    M.toggle()
  end, {'{'} buffer = buf {'}'})

  <span class="text-forge-muted">-- 6. Autoguardar cuando el usuario sale del buffer</span>
  vim.api.nvim_create_autocmd("BufLeave", {'{}'}
    buffer = buf,
    callback = function()
      M.save_notes()
    end,
  {'}'})
end</pre></div>

      <p>Cada parte tiene un proposito especifico:</p>

      <div class="grid sm:grid-cols-2 gap-4 mt-4">
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">nvim_create_buf(false, true)</p>
          <p class="text-xs text-forge-muted">
            <code class="code-inline">false</code> = no aparece en <code class="code-inline">:ls</code>.
            <code class="code-inline">true</code> = scratch buffer (sin archivo, sin aviso al cerrar).
            No queremos que nuestro buffer de notas contamine la lista de buffers del usuario.
          </p>
        </div>
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">Dimensiones dinamicas</p>
          <p class="text-xs text-forge-muted">
            Usamos <code class="code-inline">vim.o.columns</code> y <code class="code-inline">vim.o.lines</code>
            para calcular porcentajes. Asi la ventana se adapta al tamanio del terminal del usuario.
            60% de ancho y 40% de alto es un buen balance.
          </p>
        </div>
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">nvim_open_win()</p>
          <p class="text-xs text-forge-muted">
            El segundo argumento (<code class="code-inline">true</code>) indica que el cursor se mueve a la
            nueva ventana. <code class="code-inline">relative = "editor"</code> posiciona respecto al editor
            completo, no al cursor o a la ventana actual.
          </p>
        </div>
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">Keymap + Autocmd</p>
          <p class="text-xs text-forge-muted">
            <code class="code-inline">{'{'} buffer = buf {'}'}</code> hace que el keymap de "q" sea local
            al buffer. El <code class="code-inline">BufLeave</code> autocmd guarda automaticamente las notas
            cuando el usuario navega fuera de la ventana flotante.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ===================== SECCION 4: FILE I/O ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">4. Paso 3: Leer y Escribir Notas</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        El plugin necesita <strong>persistencia</strong>: leer notas guardadas previamente y escribir
        las nuevas. Usamos las funciones de I/O estandar de Lua (<code class="code-inline">io.open</code>)
        combinadas con la API de buffers de Neovim.
      </p>

      <div class="code-block"><pre><span class="text-forge-muted">-- Cargar notas del archivo al buffer</span>
function M.load_notes()
  local file = io.open(notes_file, "r")  <span class="text-forge-muted">-- abrir en modo lectura</span>
  if file then
    local lines = {'{}'}
    for line in file:lines() do           <span class="text-forge-muted">-- leer linea por linea</span>
      table.insert(lines, line)
    end
    file:close()                          <span class="text-forge-muted">-- SIEMPRE cerrar el archivo</span>
    <span class="text-forge-muted">-- Escribir las lineas en el buffer</span>
    vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)
  end
end

<span class="text-forge-muted">-- Guardar el contenido del buffer al archivo</span>
function M.save_notes()
  if buf and vim.api.nvim_buf_is_valid(buf) then
    <span class="text-forge-muted">-- Leer todas las lineas del buffer</span>
    local lines = vim.api.nvim_buf_get_lines(buf, 0, -1, false)
    local file = io.open(notes_file, "w") <span class="text-forge-muted">-- abrir en modo escritura</span>
    if file then
      for _, line in ipairs(lines) do
        file:write(line .. "\n")
      end
      file:close()
    end
  end
end</pre></div>

      <div class="card bg-forge-darker border-forge-accent/30">
        <p class="text-xs text-forge-accent font-bold uppercase tracking-wider mb-2">Conceptos clave de File I/O</p>
        <ul class="space-y-2 text-sm text-forge-muted">
          <li>&#10148; <code class="code-inline">io.open(path, "r")</code> — Abre en modo lectura. Devuelve <code class="code-inline">nil</code> si el archivo no existe (por eso verificamos con <code class="code-inline">if file</code>).</li>
          <li>&#10148; <code class="code-inline">io.open(path, "w")</code> — Abre en modo escritura. <strong>Sobreescribe</strong> el contenido anterior. Crea el archivo si no existe.</li>
          <li>&#10148; <code class="code-inline">file:lines()</code> — Iterador que devuelve una linea por cada iteracion. Eficiente en memoria.</li>
          <li>&#10148; <code class="code-inline">file:close()</code> — Cierra el descriptor de archivo. <strong>Nunca lo olvides</strong>: dejarlo abierto puede causar perdida de datos o leaks.</li>
        </ul>
      </div>

      <div class="card bg-forge-darker border-forge-warning/30">
        <p class="text-xs text-forge-warning font-bold uppercase tracking-wider mb-2">API de buffers</p>
        <p>
          <code class="code-inline">nvim_buf_set_lines(buf, 0, -1, false, lines)</code> reemplaza
          <strong>todo</strong> el contenido del buffer. Los argumentos son: buffer, linea inicio (0),
          linea fin (-1 = hasta el final), strict_indexing (false), y la tabla de lineas.
          <code class="code-inline">nvim_buf_get_lines()</code> hace lo inverso: lee las lineas del buffer
          como una tabla de strings.
        </p>
      </div>
    </div>
  </section>

  <!-- ===================== SECCION 5: REGISTRAR COMANDO ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">5. Paso 4: Registrar el Comando</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        El modulo Lua ya esta completo, pero el usuario no puede usarlo todavia. Necesitamos crear
        un <strong>comando de Neovim</strong> y un <strong>keymap</strong> que el usuario pueda ejecutar.
        Esto va en <code class="code-inline">plugin/floatnote.lua</code> (el archivo bootstrap).
      </p>

      <div class="code-block"><pre><span class="text-forge-muted">-- plugin/floatnote.lua</span>

<span class="text-forge-muted">-- Registrar el comando :FloatNote</span>
vim.api.nvim_create_user_command("FloatNote", function()
  require("floatnote").toggle()
end, {'{'} desc = "Toggle floating notes" {'}'})

<span class="text-forge-muted">-- Keymap global para toggle rapido</span>
vim.keymap.set("n", "&lt;leader&gt;fn", function()
  require("floatnote").toggle()
end, {'{'} desc = "Float Note toggle" {'}'})</pre></div>

      <div class="card bg-forge-darker border-forge-success/30">
        <p class="text-xs text-forge-success font-bold uppercase tracking-wider mb-2">¿Por que require() dentro de la funcion?</p>
        <p>
          Fijate que hacemos <code class="code-inline">require("floatnote")</code> <strong>dentro</strong> del
          callback, no al inicio del archivo. Esto es <strong>lazy loading</strong>: el modulo no se carga en
          memoria hasta que el usuario ejecuta el comando por primera vez. Esto hace que Neovim arranque mas
          rapido porque no carga plugins que quizas nunca uses en esa sesion.
        </p>
      </div>

      <p>Dos detalles importantes:</p>
      <ul class="space-y-2">
        <li class="flex items-start gap-2">
          <span class="text-forge-accent mt-0.5">&#10148;</span>
          <span><code class="code-inline">nvim_create_user_command</code> — Crea un comando Ex que el usuario puede ejecutar con <code class="code-inline">:FloatNote</code>. El tercer argumento es una tabla de opciones (aqui solo usamos desc para documentacion).</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-forge-accent mt-0.5">&#10148;</span>
          <span><code class="code-inline">vim.keymap.set</code> — El keymap global <code class="code-inline">&lt;leader&gt;fn</code> le da al usuario acceso rapido sin tener que escribir el comando. Nota que este keymap SI es global (no tiene <code class="code-inline">buffer =</code>) porque es el punto de entrada del plugin.</span>
        </li>
      </ul>
    </div>
  </section>

  <!-- ===================== SECCION 6: INSTALACION ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">6. Paso 5: Instalacion con lazy.nvim</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Para probar tu plugin durante el desarrollo, puedes usar <strong>lazy.nvim</strong> con una
        ruta local. No necesitas subir nada a GitHub todavia.
      </p>

      <div class="code-block"><pre><span class="text-forge-muted">-- En tu configuracion de lazy.nvim (init.lua o plugins/)</span>
{'{}'}
  dir = "~/projects/floatnote.nvim",  <span class="text-forge-muted">-- ruta local al plugin</span>
  name = "floatnote",
  keys = {'{}'}
    {'{'} "&lt;leader&gt;fn", "&lt;cmd&gt;FloatNote&lt;cr&gt;", desc = "Toggle Float Note" {'}'},
  {'}'},
{'}'}</pre></div>

      <p>
        La opcion <code class="code-inline">dir</code> le dice a lazy.nvim que el plugin esta en tu
        disco, no en un repositorio remoto. La opcion <code class="code-inline">keys</code> configura
        lazy loading: el plugin solo se carga cuando presionas <code class="code-inline">&lt;leader&gt;fn</code>
        por primera vez.
      </p>

      <div class="card bg-forge-darker border-forge-accent/30">
        <p class="text-xs text-forge-accent font-bold uppercase tracking-wider mb-2">Codigo completo de init.lua</p>
        <p class="text-xs text-forge-muted mb-3">
          Este es el archivo <code class="code-inline">lua/floatnote/init.lua</code> completo con todas las funciones juntas:
        </p>
        <div class="code-block" style="margin: 0;"><pre>local M = {'{}'}

local buf = nil
local win = nil
local notes_file = vim.fn.stdpath("data") .. "/floatnote.txt"

function M.toggle()
  if win and vim.api.nvim_win_is_valid(win) then
    vim.api.nvim_win_close(win, true)
    win = nil
    return
  end
  M.open()
end

function M.open()
  buf = vim.api.nvim_create_buf(false, true)

  local width = math.floor(vim.o.columns * 0.6)
  local height = math.floor(vim.o.lines * 0.4)
  local row = math.floor((vim.o.lines - height) / 2)
  local col = math.floor((vim.o.columns - width) / 2)

  win = vim.api.nvim_open_win(buf, true, {'{}'}
    relative = "editor",
    width = width,
    height = height,
    row = row,
    col = col,
    style = "minimal",
    border = "rounded",
    title = " Notas ",
    title_pos = "center",
  {'}'})

  M.load_notes()

  vim.keymap.set("n", "q", function()
    M.toggle()
  end, {'{'} buffer = buf {'}'})

  vim.api.nvim_create_autocmd("BufLeave", {'{}'}
    buffer = buf,
    callback = function()
      M.save_notes()
    end,
  {'}'})
end

function M.load_notes()
  local file = io.open(notes_file, "r")
  if file then
    local lines = {'{}'}
    for line in file:lines() do
      table.insert(lines, line)
    end
    file:close()
    vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)
  end
end

function M.save_notes()
  if buf and vim.api.nvim_buf_is_valid(buf) then
    local lines = vim.api.nvim_buf_get_lines(buf, 0, -1, false)
    local file = io.open(notes_file, "w")
    if file then
      for _, line in ipairs(lines) do
        file:write(line .. "\n")
      end
      file:close()
    end
  end
end

return M</pre></div>
      </div>
    </div>
  </section>

  <!-- ===================== BRANCHING SCENARIO ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">Simulacion: Construye tu Plugin</h2>
    <p class="text-sm text-forge-muted mb-4">
      Es hora de poner a prueba lo que aprendiste. En este escenario interactivo vas a tomar las
      decisiones clave de arquitectura para construir el plugin de notas flotantes. Cada decision
      importa.
    </p>

    <BranchingScenario
      nodes={scenarioNodes}
      startId="start"
      title="Construye tu Plugin: Nota Flotante"
      onComplete={onScenarioComplete}
    />
  </section>

  <!-- ===================== QUIZ ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">Quiz: Conceptos de Plugins</h2>
    <p class="text-sm text-forge-muted mb-4">
      Cuatro preguntas sobre los conceptos clave que usaste en el plugin. No es memorizar codigo —
      es entender <strong>por que</strong> se hace de cada forma.
    </p>

    <Quiz
      questions={quizQuestions}
      onComplete={onQuizComplete}
    />
  </section>

  <!-- ===================== COMPLETION ===================== -->
  {#if scenarioDone && quizDone}
    <section class="mb-10 slide-in">
      <div class="card border-forge-success/50 bg-forge-success/5">
        <div class="flex items-center gap-3">
          <span class="text-3xl">&#9878;</span>
          <div>
            <p class="font-bold text-forge-success">Modulo completado!</p>
            <p class="text-sm text-forge-muted mt-1">
              Has construido tu primer plugin real de Neovim. Ya sabes estructurar un plugin, crear
              ventanas flotantes, manejar File I/O en Lua, y registrar comandos y keymaps. En el
              siguiente modulo llevaremos esto mas lejos con un timer Pomodoro en el statusline.
            </p>
            <div class="mt-3 flex items-center gap-4">
              <span class="text-sm text-forge-accent font-bold">
                Escenario: {scenarioScore}/{scenarioMax}
              </span>
              <span class="text-sm text-forge-accent font-bold">
                Quiz: {quizScore}/{quizMax}
              </span>
              <span class="text-sm text-forge-success font-bold">
                Total: {scenarioScore + quizScore}/{scenarioMax + quizMax}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  {/if}

  <!-- ===================== SOURCES ===================== -->
  <SourcesSection sources={mod.sources} />

  <!-- ===================== NAVIGATION ===================== -->
  <ModuleNav currentModule={6} />

</div>

<!-- ===================== FLOATING VOCABULARY ===================== -->
<VocabularyFloat moduleId={6} />

<!-- ===================== BADGE NOTIFICATION ===================== -->
{#if showBadge && earnedBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => (showBadge = false)} />
{/if}
