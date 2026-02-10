<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import Quiz from '$lib/components/Quiz.svelte';
  import Timer from '$lib/components/Timer.svelte';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';

  const mod = modules.find(m => m.id === 5)!;

  let completed = $state(false);
  let showBadge = $state(false);
  let earnedBadge = $state<any>(null);
  let quizStarted = $state(false);
  let timeUp = $state(false);

  let activeSection = $state(0);

  const sections = [
    'vim.api',
    'vim.fn',
    'Buffers',
    'Ventanas',
    'Autocommands',
    'User Commands',
    'Namespaces'
  ];

  function completeModule(score: number, total: number) {
    courseStore.completeModule(5, score, total);
    completed = true;
    const badge = allBadges.find(b => b.id === 'api-explorer')!;
    courseStore.unlockBadge(badge);
    earnedBadge = badge;
    showBadge = true;
  }

  function handleTimeUp() {
    timeUp = true;
  }

  const questions = [
    {
      question: 'Que devuelve vim.api.nvim_buf_get_lines(0, 0, -1, false)?',
      options: [
        {
          text: 'Todas las lineas del buffer actual como una tabla de strings',
          correct: true,
          explanation:
            'Correcto. El primer argumento 0 indica el buffer actual, 0 y -1 definen el rango desde la primera hasta la ultima linea, y false indica indexacion no estricta.'
        },
        {
          text: 'Solo la primera linea del buffer',
          correct: false,
          explanation:
            'Incorrecto. El rango 0 a -1 significa desde la primera linea hasta el final del buffer, no solo la primera.'
        },
        {
          text: 'El contenido del buffer como un solo string',
          correct: false,
          explanation:
            'Incorrecto. nvim_buf_get_lines devuelve una tabla (array) de strings, una por cada linea, no un string unico.'
        },
        {
          text: 'El numero total de lineas del buffer',
          correct: false,
          explanation:
            'Incorrecto. Para obtener el conteo de lineas puedes usar nvim_buf_line_count(). nvim_buf_get_lines devuelve las lineas en si.'
        }
      ],
      source: 'Neovim API Documentation',
      sourceUrl: 'https://neovim.io/doc/user/api.html'
    },
    {
      question: 'Como se llama una funcion de Vimscript desde Lua en Neovim?',
      options: [
        {
          text: 'vim.call("funcion")',
          correct: false,
          explanation:
            'Incorrecto. Aunque vim.call existe, la forma idomiatica y recomendada es usar vim.fn.nombre_funcion().'
        },
        {
          text: 'vim.fn.nombre_funcion()',
          correct: true,
          explanation:
            'Correcto. vim.fn es un meta-accessor que permite llamar cualquier funcion de Vimscript directamente desde Lua con la sintaxis vim.fn.nombre().'
        },
        {
          text: 'vim.cmd("call funcion()")',
          correct: false,
          explanation:
            'Incorrecto. Aunque funcionaria via vim.cmd, la forma correcta y directa es vim.fn.nombre_funcion() que devuelve el valor de retorno de Lua.'
        },
        {
          text: 'require("vimscript").funcion()',
          correct: false,
          explanation:
            'Incorrecto. No existe un modulo "vimscript". La bridge entre Lua y Vimscript es vim.fn.'
        }
      ],
      source: 'Neovim API Documentation',
      sourceUrl: 'https://neovim.io/doc/user/api.html'
    },
    {
      question: 'Que funcion de la API se usa para crear una ventana flotante en Neovim?',
      options: [
        {
          text: 'nvim_create_win',
          correct: false,
          explanation:
            'Incorrecto. La funcion no se llama nvim_create_win. La correcta es nvim_open_win.'
        },
        {
          text: 'nvim_open_win',
          correct: true,
          explanation:
            'Correcto. nvim_open_win(buf, enter, config) crea una nueva ventana. Si config incluye relative, la ventana sera flotante.'
        },
        {
          text: 'nvim_float_win',
          correct: false,
          explanation:
            'Incorrecto. Esa funcion no existe. Se usa nvim_open_win con una configuracion que incluya el campo relative.'
        },
        {
          text: 'nvim_win_open',
          correct: false,
          explanation:
            'Incorrecto. El orden correcto es nvim_open_win, no nvim_win_open. La convencion es nvim_open_win(buf, enter, config).'
        }
      ],
      source: 'Neovim API Documentation',
      sourceUrl: 'https://neovim.io/doc/user/api.html'
    },
    {
      question: 'Que hace la funcion nvim_create_autocmd?',
      options: [
        {
          text: 'Crea un comando de usuario personalizado',
          correct: false,
          explanation:
            'Incorrecto. Para comandos de usuario se usa nvim_create_user_command. nvim_create_autocmd crea autocommands.'
        },
        {
          text: 'Crea un autocommand que se ejecuta cuando ocurre un evento especifico',
          correct: true,
          explanation:
            'Correcto. nvim_create_autocmd(event, opts) registra un callback que se ejecuta automaticamente cuando el evento especificado ocurre (por ejemplo BufEnter, BufWritePre, etc.).'
        },
        {
          text: 'Ejecuta un comando de Vim automaticamente al iniciar',
          correct: false,
          explanation:
            'Incorrecto. No se limita al inicio. Los autocommands se disparan ante eventos especificos como abrir un buffer, guardar un archivo, etc.'
        },
        {
          text: 'Crea un atajo de teclado automatico',
          correct: false,
          explanation:
            'Incorrecto. Los keymaps se crean con vim.keymap.set. nvim_create_autocmd es para reaccionar a eventos del editor.'
        }
      ],
      source: 'Neovim API Documentation',
      sourceUrl: 'https://neovim.io/doc/user/api.html'
    },
    {
      question: 'Para que se usa un namespace (nvim_create_namespace) en Neovim?',
      options: [
        {
          text: 'Para organizar archivos de configuracion en carpetas',
          correct: false,
          explanation:
            'Incorrecto. Los namespaces de la API no tienen relacion con el sistema de archivos. Son para agrupar highlights y extmarks.'
        },
        {
          text: 'Para agrupar highlights y extmarks de forma aislada',
          correct: true,
          explanation:
            'Correcto. Un namespace permite agrupar highlights virtuales y extmarks para poder limpiarlos o gestionarlos de forma independiente, evitando conflictos entre plugins.'
        },
        {
          text: 'Para importar modulos de Lua',
          correct: false,
          explanation:
            'Incorrecto. Para importar modulos se usa require(). Los namespaces de la API son un concepto diferente relacionado con highlights y extmarks.'
        },
        {
          text: 'Para crear un scope de variables locales',
          correct: false,
          explanation:
            'Incorrecto. El scope de variables es una caracteristica de Lua (local). Los namespaces de Neovim son para gestionar elementos visuales como highlights.'
        }
      ],
      source: 'Neovim API Documentation',
      sourceUrl: 'https://neovim.io/doc/user/api.html'
    },
    {
      question: 'Como se obtiene el numero del buffer actual en Lua?',
      options: [
        {
          text: 'vim.current.buffer',
          correct: false,
          explanation:
            'Incorrecto. Esa es la sintaxis de Python (pynvim). En Lua se usa vim.api.nvim_get_current_buf().'
        },
        {
          text: 'vim.api.nvim_get_current_buf()',
          correct: true,
          explanation:
            'Correcto. nvim_get_current_buf() devuelve el numero (handle) del buffer activo actualmente.'
        },
        {
          text: 'vim.fn.bufnr()',
          correct: false,
          explanation:
            'Incorrecto. Aunque vim.fn.bufnr("%") funcionaria, la forma idiomatica usando la API es nvim_get_current_buf().'
        },
        {
          text: 'vim.buf.current()',
          correct: false,
          explanation:
            'Incorrecto. Esa funcion no existe. La forma correcta es vim.api.nvim_get_current_buf().'
        }
      ],
      source: 'Neovim API Documentation',
      sourceUrl: 'https://neovim.io/doc/user/api.html'
    },
    {
      question: 'Que evento de autocommand se dispara ANTES de guardar un archivo?',
      options: [
        {
          text: 'BufSave',
          correct: false,
          explanation:
            'Incorrecto. No existe un evento llamado BufSave. Los eventos de guardado son BufWritePre (antes) y BufWritePost (despues).'
        },
        {
          text: 'BufWritePost',
          correct: false,
          explanation:
            'Incorrecto. BufWritePost se dispara DESPUES de guardar. El que se dispara ANTES es BufWritePre.'
        },
        {
          text: 'BufWritePre',
          correct: true,
          explanation:
            'Correcto. BufWritePre se dispara justo antes de escribir el buffer al archivo. Es ideal para formatear codigo o limpiar espacios en blanco antes de guardar.'
        },
        {
          text: 'FileWrite',
          correct: false,
          explanation:
            'Incorrecto. FileWritePre existe pero es para escrituras parciales. Para el guardado normal del buffer completo, el evento es BufWritePre.'
        }
      ],
      source: 'Neovim API Documentation',
      sourceUrl: 'https://neovim.io/doc/user/api.html'
    },
    {
      question: 'Como se crea un comando de usuario personalizado (como :MiComando) en Lua?',
      options: [
        {
          text: 'vim.cmd("command MiComando ...")',
          correct: false,
          explanation:
            'Incorrecto. Aunque funcionaria via Vimscript embebido, la forma idiomatica en Lua es usar vim.api.nvim_create_user_command().'
        },
        {
          text: 'vim.api.nvim_create_user_command("MiComando", callback, opts)',
          correct: true,
          explanation:
            'Correcto. nvim_create_user_command recibe el nombre del comando, un callback (funcion Lua) y una tabla de opciones como nargs, bang, range, etc.'
        },
        {
          text: 'vim.keymap.set("cmd", "MiComando", callback)',
          correct: false,
          explanation:
            'Incorrecto. vim.keymap.set es para keymaps, no para crear comandos de usuario. Se usa nvim_create_user_command.'
        },
        {
          text: 'vim.command.create("MiComando", callback)',
          correct: false,
          explanation:
            'Incorrecto. Esa API no existe. La funcion correcta es vim.api.nvim_create_user_command().'
        }
      ],
      source: 'Neovim API Documentation',
      sourceUrl: 'https://neovim.io/doc/user/api.html'
    }
  ];

  $effect(() => {
    courseStore.startModule(5);
  });
</script>

<svelte:head>
  <title>Modulo 5: {mod.title} — La Forja de Lua</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <!-- Header -->
  <header class="mb-12 fade-in">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-4xl">{mod.icon}</span>
      <div>
        <span class="text-xs text-forge-muted uppercase tracking-wider">Modulo 5</span>
        <h1 class="text-3xl sm:text-4xl font-black">
          {mod.title}
        </h1>
      </div>
    </div>
    <p class="text-forge-muted text-lg leading-relaxed">{mod.description}</p>
    <div class="flex flex-wrap items-center gap-4 mt-4 text-sm text-forge-muted">
      <span>🕐 {mod.duration}</span>
      <span class="badge bg-forge-accent/10 text-forge-accent">{mod.type}</span>
    </div>

    <!-- Objetivos -->
    <div class="card mt-6">
      <h2 class="font-bold text-forge-accent text-sm uppercase tracking-wider mb-3">Objetivos del modulo</h2>
      <ul class="space-y-2">
        {#each mod.objectives as obj}
          <li class="flex items-start gap-2 text-sm">
            <span class="text-forge-accent mt-0.5">▸</span>
            <span>{obj}</span>
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
          class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer {
            activeSection === i
              ? 'bg-forge-accent text-forge-darker'
              : 'bg-forge-card border border-forge-border text-forge-muted hover:border-forge-accent/50 hover:text-forge-accent'
          }"
        >
          {section}
        </button>
      {/each}
    </div>
  </nav>

  <!-- ============================== -->
  <!-- SECCION 1: vim.api -->
  <!-- ============================== -->
  {#if activeSection === 0}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-2xl font-black mb-4">
          <span class="text-forge-accent">vim.api</span> — La API C de Neovim en Lua
        </h2>
        <p class="text-forge-muted leading-relaxed mb-4">
          <code class="code-inline">vim.api</code> es el puente directo entre Lua y el nucleo de Neovim.
          Todas las funciones siguen el patron <code class="code-inline">nvim_*</code> y corresponden
          a la API en C que Neovim expone. Esto significa que cada funcion que ves en la documentacion
          de la API es accesible desde Lua mediante <code class="code-inline">vim.api.nvim_nombre()</code>.
        </p>
        <p class="text-forge-muted leading-relaxed mb-4">
          La convencion de nombres sigue un patron consistente. Las funciones que operan sobre un buffer
          empiezan con <code class="code-inline">nvim_buf_*</code>, las de ventanas con
          <code class="code-inline">nvim_win_*</code>, y las globales simplemente
          <code class="code-inline">nvim_*</code>.
        </p>

        <h3 class="font-bold text-lg mt-6 mb-3">Funciones clave de vim.api</h3>

        <div class="code-block">
          <pre><span class="text-forge-muted">-- Obtener el buffer actual</span>
<span class="text-forge-accent">local</span> buf = vim.api.nvim_get_current_buf()

<span class="text-forge-muted">-- Obtener la ventana actual</span>
<span class="text-forge-accent">local</span> win = vim.api.nvim_get_current_win()

<span class="text-forge-muted">-- Obtener TODAS las lineas del buffer actual</span>
<span class="text-forge-accent">local</span> lines = vim.api.nvim_buf_get_lines(0, 0, -1, <span class="text-forge-danger">false</span>)
<span class="text-forge-muted">-- 0 = buffer actual, 0 = desde linea 0, -1 = hasta el final</span>

<span class="text-forge-muted">-- Reemplazar lineas en un buffer</span>
vim.api.nvim_buf_set_lines(buf, 0, 0, <span class="text-forge-danger">false</span>, {'{'}"-- Insertado por Lua!"{'}'})

<span class="text-forge-muted">-- Obtener informacion del buffer</span>
<span class="text-forge-accent">local</span> name = vim.api.nvim_buf_get_name(0)   <span class="text-forge-muted">-- ruta del archivo</span>
<span class="text-forge-accent">local</span> count = vim.api.nvim_buf_line_count(0) <span class="text-forge-muted">-- total de lineas</span></pre>
        </div>

        <div class="mt-4 p-4 rounded-lg bg-forge-darker border border-forge-border">
          <p class="text-sm text-forge-muted">
            <span class="text-forge-accent font-bold">Tip:</span> El parametro
            <code class="code-inline">0</code> como buffer significa "buffer actual". Es equivalente a
            llamar <code class="code-inline">nvim_get_current_buf()</code> y pasar el resultado.
          </p>
        </div>
      </div>

      <div class="card">
        <h3 class="font-bold text-lg mb-3">Ejemplo practico: Contar palabras del buffer</h3>
        <div class="code-block">
          <pre><span class="text-forge-accent">local</span> <span class="text-forge-info">function</span> contar_palabras()
  <span class="text-forge-accent">local</span> lines = vim.api.nvim_buf_get_lines(0, 0, -1, <span class="text-forge-danger">false</span>)
  <span class="text-forge-accent">local</span> count = 0
  <span class="text-forge-accent">for</span> _, line <span class="text-forge-accent">in</span> <span class="text-forge-info">ipairs</span>(lines) <span class="text-forge-accent">do</span>
    <span class="text-forge-accent">for</span> _ <span class="text-forge-accent">in</span> line:<span class="text-forge-info">gmatch</span>(<span class="text-forge-success">"%S+"</span>) <span class="text-forge-accent">do</span>
      count = count + 1
    <span class="text-forge-accent">end</span>
  <span class="text-forge-accent">end</span>
  vim.notify(<span class="text-forge-success">"Palabras: "</span> .. count, vim.log.levels.INFO)
<span class="text-forge-accent">end</span>

contar_palabras()</pre>
        </div>
      </div>
    </section>
  {/if}

  <!-- ============================== -->
  <!-- SECCION 2: vim.fn -->
  <!-- ============================== -->
  {#if activeSection === 1}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-2xl font-black mb-4">
          <span class="text-forge-accent">vim.fn</span> — Funciones de Vimscript en Lua
        </h2>
        <p class="text-forge-muted leading-relaxed mb-4">
          <code class="code-inline">vim.fn</code> es un meta-accessor que te permite llamar
          <strong>cualquier</strong> funcion de Vimscript directamente desde Lua. Neovim tiene
          cientos de funciones heredadas de Vim, y con <code class="code-inline">vim.fn</code>
          puedes acceder a todas sin escribir una sola linea de Vimscript.
        </p>
        <p class="text-forge-muted leading-relaxed mb-4">
          La conversion de tipos entre Lua y Vimscript es automatica: strings, numeros,
          listas (tablas) y diccionarios se convierten transparentemente.
        </p>

        <h3 class="font-bold text-lg mt-6 mb-3">Funciones mas usadas</h3>

        <div class="code-block">
          <pre><span class="text-forge-muted">-- Expandir el nombre del archivo actual</span>
<span class="text-forge-accent">local</span> filename = vim.fn.expand(<span class="text-forge-success">'%'</span>)       <span class="text-forge-muted">-- nombre relativo</span>
<span class="text-forge-accent">local</span> fullpath = vim.fn.expand(<span class="text-forge-success">'%:p'</span>)     <span class="text-forge-muted">-- ruta completa</span>
<span class="text-forge-accent">local</span> extension = vim.fn.expand(<span class="text-forge-success">'%:e'</span>)    <span class="text-forge-muted">-- extension del archivo</span>

<span class="text-forge-muted">-- Obtener la linea actual del cursor</span>
<span class="text-forge-accent">local</span> linea = vim.fn.line(<span class="text-forge-success">'.'</span>)              <span class="text-forge-muted">-- numero de linea</span>
<span class="text-forge-accent">local</span> columna = vim.fn.col(<span class="text-forge-success">'.'</span>)             <span class="text-forge-muted">-- numero de columna</span>

<span class="text-forge-muted">-- Verificar si algo existe</span>
<span class="text-forge-accent">local</span> tiene_git = vim.fn.exists(<span class="text-forge-success">':Git'</span>)    <span class="text-forge-muted">-- comando :Git?</span>
<span class="text-forge-accent">local</span> existe = vim.fn.filereadable(<span class="text-forge-success">'init.lua'</span>) <span class="text-forge-muted">-- archivo legible?</span>

<span class="text-forge-muted">-- Ejecutar un comando del sistema</span>
<span class="text-forge-accent">local</span> output = vim.fn.system(<span class="text-forge-success">'git branch --show-current'</span>)
<span class="text-forge-accent">local</span> trimmed = vim.trim(output) <span class="text-forge-muted">-- quitar el \n final</span>

<span class="text-forge-muted">-- Obtener el directorio actual</span>
<span class="text-forge-accent">local</span> cwd = vim.fn.getcwd()

<span class="text-forge-muted">-- Funciones de input/confirmacion</span>
<span class="text-forge-accent">local</span> nombre = vim.fn.input(<span class="text-forge-success">'Tu nombre: '</span>)
<span class="text-forge-accent">local</span> ok = vim.fn.confirm(<span class="text-forge-success">'Guardar?'</span>, <span class="text-forge-success">'&Si\n&No'</span>)</pre>
        </div>

        <div class="mt-4 p-4 rounded-lg bg-forge-darker border border-forge-border">
          <p class="text-sm text-forge-muted">
            <span class="text-forge-accent font-bold">vim.api vs vim.fn:</span> Usa
            <code class="code-inline">vim.api</code> cuando exista una funcion nvim_* especifica
            (mas eficiente, pura API). Usa <code class="code-inline">vim.fn</code> para funciones
            legacy de Vimscript que no tienen equivalente en la API moderna.
          </p>
        </div>
      </div>

      <div class="card">
        <h3 class="font-bold text-lg mb-3">Ejemplo: Abrir archivo en el navegador</h3>
        <div class="code-block">
          <pre><span class="text-forge-accent">local</span> <span class="text-forge-info">function</span> abrir_en_navegador()
  <span class="text-forge-accent">local</span> file = vim.fn.expand(<span class="text-forge-success">'%:p'</span>)
  <span class="text-forge-accent">local</span> ext = vim.fn.expand(<span class="text-forge-success">'%:e'</span>)

  <span class="text-forge-accent">if</span> ext == <span class="text-forge-success">"html"</span> <span class="text-forge-accent">or</span> ext == <span class="text-forge-success">"md"</span> <span class="text-forge-accent">then</span>
    vim.fn.system(<span class="text-forge-success">"xdg-open "</span> .. vim.fn.shellescape(file))
    vim.notify(<span class="text-forge-success">"Abriendo en navegador..."</span>)
  <span class="text-forge-accent">else</span>
    vim.notify(<span class="text-forge-success">"No es un archivo web"</span>, vim.log.levels.WARN)
  <span class="text-forge-accent">end</span>
<span class="text-forge-accent">end</span></pre>
        </div>
      </div>
    </section>
  {/if}

  <!-- ============================== -->
  <!-- SECCION 3: Buffers -->
  <!-- ============================== -->
  {#if activeSection === 2}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-2xl font-black mb-4">
          <span class="text-forge-accent">Buffers</span> — El contenido en memoria
        </h2>
        <p class="text-forge-muted leading-relaxed mb-4">
          Un <strong>buffer</strong> en Neovim es la representacion en memoria del contenido de un archivo
          (o de texto sin archivo asociado). Cuando abres un archivo, Neovim crea un buffer con su
          contenido. Puedes tener multiples buffers abiertos simultaneamente, aunque solo algunos
          sean visibles en ventanas.
        </p>
        <p class="text-forge-muted leading-relaxed mb-4">
          Cada buffer tiene un numero unico (handle) que lo identifica. El buffer actual se puede
          obtener con <code class="code-inline">nvim_get_current_buf()</code> o simplemente
          usando <code class="code-inline">0</code> como atajo.
        </p>

        <h3 class="font-bold text-lg mt-6 mb-3">Crear un buffer scratch</h3>
        <div class="code-block">
          <pre><span class="text-forge-muted">-- Crear un buffer nuevo (no asociado a archivo)</span>
<span class="text-forge-accent">local</span> buf = vim.api.nvim_create_buf(
  <span class="text-forge-danger">false</span>,  <span class="text-forge-muted">-- listed: no aparece en :ls</span>
  <span class="text-forge-danger">true</span>   <span class="text-forge-muted">-- scratch: buffer temporal</span>
)

<span class="text-forge-muted">-- Escribir contenido en el buffer</span>
vim.api.nvim_buf_set_lines(buf, 0, -1, <span class="text-forge-danger">false</span>, {'{'}
  <span class="text-forge-success">"Linea 1: Hola desde Lua!"</span>,
  <span class="text-forge-success">"Linea 2: Este es un buffer scratch"</span>,
  <span class="text-forge-success">"Linea 3: No tiene archivo asociado"</span>,
{'}'})</pre>
        </div>

        <h3 class="font-bold text-lg mt-6 mb-3">Leer y modificar lineas</h3>
        <div class="code-block">
          <pre><span class="text-forge-muted">-- Leer lineas 5 a 10 (0-indexed, end-exclusive)</span>
<span class="text-forge-accent">local</span> lines = vim.api.nvim_buf_get_lines(0, 4, 10, <span class="text-forge-danger">false</span>)

<span class="text-forge-muted">-- Reemplazar la linea 3 (indice 2)</span>
vim.api.nvim_buf_set_lines(0, 2, 3, <span class="text-forge-danger">false</span>, {'{'}<span class="text-forge-success">"Nueva linea 3"</span>{'}'})

<span class="text-forge-muted">-- Insertar lineas al final del buffer</span>
<span class="text-forge-accent">local</span> last = vim.api.nvim_buf_line_count(0)
vim.api.nvim_buf_set_lines(0, last, last, <span class="text-forge-danger">false</span>, {'{'}
  <span class="text-forge-success">"-- Agregado al final"</span>
{'}'})

<span class="text-forge-muted">-- Borrar las primeras 5 lineas</span>
vim.api.nvim_buf_set_lines(0, 0, 5, <span class="text-forge-danger">false</span>, {'{'}{'}'})</pre>
        </div>

        <h3 class="font-bold text-lg mt-6 mb-3">Opciones del buffer</h3>
        <div class="code-block">
          <pre><span class="text-forge-muted">-- API moderna (Neovim 0.10+): nvim_set_option_value</span>
vim.api.nvim_set_option_value(<span class="text-forge-success">"modifiable"</span>, <span class="text-forge-danger">false</span>, {'{'} buf = buf {'}'})
vim.api.nvim_set_option_value(<span class="text-forge-success">"buftype"</span>, <span class="text-forge-success">"nofile"</span>, {'{'} buf = buf {'}'})
vim.api.nvim_set_option_value(<span class="text-forge-success">"filetype"</span>, <span class="text-forge-success">"lua"</span>, {'{'} buf = buf {'}'})
vim.api.nvim_set_option_value(<span class="text-forge-success">"buflisted"</span>, <span class="text-forge-danger">false</span>, {'{'} buf = buf {'}'})

<span class="text-forge-muted">-- Tambien puedes usar vim.bo (buffer options shorthand)</span>
vim.bo[buf].modifiable = <span class="text-forge-danger">false</span>
vim.bo[buf].filetype = <span class="text-forge-success">"markdown"</span></pre>
        </div>

        <div class="mt-4 p-4 rounded-lg bg-forge-darker border border-forge-border">
          <p class="text-sm text-forge-muted">
            <span class="text-forge-accent font-bold">Nota:</span>
            <code class="code-inline">nvim_buf_set_option</code> esta marcado como deprecated.
            Usa <code class="code-inline">nvim_set_option_value</code> con
            <code class="code-inline">{'{'}buf = id{'}'}</code> o el shorthand
            <code class="code-inline">vim.bo[buf]</code>.
          </p>
        </div>
      </div>
    </section>
  {/if}

  <!-- ============================== -->
  <!-- SECCION 4: Ventanas -->
  <!-- ============================== -->
  {#if activeSection === 3}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-2xl font-black mb-4">
          <span class="text-forge-accent">Ventanas</span> — Splits y ventanas flotantes
        </h2>
        <p class="text-forge-muted leading-relaxed mb-4">
          Una <strong>ventana</strong> en Neovim es una vista de un buffer. Multiples ventanas
          pueden mostrar el mismo buffer, o diferentes buffers simultaneamente. Las ventanas
          pueden ser <strong>normales</strong> (splits) o <strong>flotantes</strong> (floating windows).
        </p>
        <p class="text-forge-muted leading-relaxed mb-4">
          Las ventanas flotantes son una de las features mas poderosas para plugins. Permiten
          crear popups, menus, previews y cualquier interfaz que flote sobre el contenido.
        </p>

        <h3 class="font-bold text-lg mt-6 mb-3">Crear una ventana flotante</h3>
        <div class="code-block">
          <pre><span class="text-forge-accent">local</span> <span class="text-forge-info">function</span> crear_flotante()
  <span class="text-forge-muted">-- 1. Crear buffer para la ventana</span>
  <span class="text-forge-accent">local</span> buf = vim.api.nvim_create_buf(<span class="text-forge-danger">false</span>, <span class="text-forge-danger">true</span>)

  <span class="text-forge-muted">-- 2. Calcular dimensiones centradas</span>
  <span class="text-forge-accent">local</span> width = math.floor(vim.o.columns * 0.6)
  <span class="text-forge-accent">local</span> height = math.floor(vim.o.lines * 0.4)
  <span class="text-forge-accent">local</span> row = math.floor((vim.o.lines - height) / 2)
  <span class="text-forge-accent">local</span> col = math.floor((vim.o.columns - width) / 2)

  <span class="text-forge-muted">-- 3. Configuracion de la ventana flotante</span>
  <span class="text-forge-accent">local</span> opts = {'{'}
    relative = <span class="text-forge-success">"editor"</span>,  <span class="text-forge-muted">-- posicion relativa al editor</span>
    width = width,
    height = height,
    row = row,
    col = col,
    style = <span class="text-forge-success">"minimal"</span>,    <span class="text-forge-muted">-- sin numeros de linea, etc.</span>
    border = <span class="text-forge-success">"rounded"</span>,   <span class="text-forge-muted">-- borde redondeado</span>
    title = <span class="text-forge-success">" Mi Ventana Flotante "</span>,
    title_pos = <span class="text-forge-success">"center"</span>,
  {'}'}

  <span class="text-forge-muted">-- 4. Abrir la ventana</span>
  <span class="text-forge-accent">local</span> win = vim.api.nvim_open_win(buf, <span class="text-forge-danger">true</span>, opts)
  <span class="text-forge-muted">-- buf = buffer a mostrar, true = entrar en la ventana</span>

  <span class="text-forge-muted">-- 5. Contenido y opciones</span>
  vim.api.nvim_buf_set_lines(buf, 0, -1, <span class="text-forge-danger">false</span>, {'{'}
    <span class="text-forge-success">"  Bienvenido a la ventana flotante!"</span>,
    <span class="text-forge-success">""</span>,
    <span class="text-forge-success">"  Presiona 'q' para cerrar."</span>,
  {'}'})

  <span class="text-forge-muted">-- 6. Keymap para cerrar con 'q'</span>
  vim.keymap.set(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"q"</span>, <span class="text-forge-accent">function</span>()
    vim.api.nvim_win_close(win, <span class="text-forge-danger">true</span>)
  <span class="text-forge-accent">end</span>, {'{'} buffer = buf {'}'})

  <span class="text-forge-accent">return</span> win, buf
<span class="text-forge-accent">end</span></pre>
        </div>

        <h3 class="font-bold text-lg mt-6 mb-3">Modificar una ventana existente</h3>
        <div class="code-block">
          <pre><span class="text-forge-muted">-- Obtener la ventana actual</span>
<span class="text-forge-accent">local</span> win = vim.api.nvim_get_current_win()

<span class="text-forge-muted">-- Cambiar la configuracion de una ventana flotante</span>
vim.api.nvim_win_set_config(win, {'{'}
  relative = <span class="text-forge-success">"editor"</span>,
  width = 40,
  height = 10,
  row = 5,
  col = 5,
{'}'})

<span class="text-forge-muted">-- Opciones de ventana</span>
vim.api.nvim_set_option_value(<span class="text-forge-success">"cursorline"</span>, <span class="text-forge-danger">true</span>, {'{'} win = win {'}'})
vim.api.nvim_set_option_value(<span class="text-forge-success">"winblend"</span>, 15, {'{'} win = win {'}'})
<span class="text-forge-muted">-- winblend = transparencia (0-100)</span>

<span class="text-forge-muted">-- O con el shorthand vim.wo</span>
vim.wo[win].cursorline = <span class="text-forge-danger">true</span>
vim.wo[win].winblend = 15</pre>
        </div>

        <div class="mt-4 p-4 rounded-lg bg-forge-darker border border-forge-border">
          <p class="text-sm text-forge-muted">
            <span class="text-forge-accent font-bold">Opciones de borde:</span>
            <code class="code-inline">"none"</code>, <code class="code-inline">"single"</code>,
            <code class="code-inline">"double"</code>, <code class="code-inline">"rounded"</code>,
            <code class="code-inline">"solid"</code>, <code class="code-inline">"shadow"</code>,
            o una tabla custom con 8 caracteres para cada esquina y lado.
          </p>
        </div>
      </div>
    </section>
  {/if}

  <!-- ============================== -->
  <!-- SECCION 5: Autocommands -->
  <!-- ============================== -->
  {#if activeSection === 4}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-2xl font-black mb-4">
          <span class="text-forge-accent">Autocommands</span> — Reaccionar a eventos
        </h2>
        <p class="text-forge-muted leading-relaxed mb-4">
          Los <strong>autocommands</strong> son callbacks que se ejecutan automaticamente cuando
          ocurre un evento especifico en Neovim. Son fundamentales para crear plugins reactivos:
          formatear al guardar, resaltar al copiar, configurar segun el tipo de archivo, etc.
        </p>

        <h3 class="font-bold text-lg mt-6 mb-3">Eventos comunes</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-forge-border">
                <th class="text-left py-2 text-forge-accent">Evento</th>
                <th class="text-left py-2 text-forge-muted">Cuando se dispara</th>
              </tr>
            </thead>
            <tbody class="text-forge-muted">
              <tr class="border-b border-forge-border/50">
                <td class="py-2 font-mono text-forge-accent">BufEnter</td>
                <td class="py-2">Al entrar a un buffer</td>
              </tr>
              <tr class="border-b border-forge-border/50">
                <td class="py-2 font-mono text-forge-accent">BufWritePre</td>
                <td class="py-2">Justo antes de guardar un archivo</td>
              </tr>
              <tr class="border-b border-forge-border/50">
                <td class="py-2 font-mono text-forge-accent">BufWritePost</td>
                <td class="py-2">Despues de guardar un archivo</td>
              </tr>
              <tr class="border-b border-forge-border/50">
                <td class="py-2 font-mono text-forge-accent">FileType</td>
                <td class="py-2">Cuando se detecta el tipo de archivo</td>
              </tr>
              <tr class="border-b border-forge-border/50">
                <td class="py-2 font-mono text-forge-accent">VimEnter</td>
                <td class="py-2">Cuando Neovim termina de iniciar</td>
              </tr>
              <tr class="border-b border-forge-border/50">
                <td class="py-2 font-mono text-forge-accent">TextYankPost</td>
                <td class="py-2">Despues de copiar (yank) texto</td>
              </tr>
              <tr>
                <td class="py-2 font-mono text-forge-accent">InsertEnter</td>
                <td class="py-2">Al entrar en modo Insert</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="font-bold text-lg mt-6 mb-3">Crear autocommands con Lua</h3>
        <div class="code-block">
          <pre><span class="text-forge-muted">-- Crear un grupo (evita duplicados al recargar)</span>
<span class="text-forge-accent">local</span> grupo = vim.api.nvim_create_augroup(<span class="text-forge-success">"MiPlugin"</span>, {'{'}
  clear = <span class="text-forge-danger">true</span>  <span class="text-forge-muted">-- limpiar autocommands previos del grupo</span>
{'}'})

<span class="text-forge-muted">-- Autocommand basico</span>
vim.api.nvim_create_autocmd(<span class="text-forge-success">"BufWritePre"</span>, {'{'}
  group = grupo,
  pattern = <span class="text-forge-success">"*.lua"</span>,  <span class="text-forge-muted">-- solo archivos .lua</span>
  callback = <span class="text-forge-accent">function</span>()
    <span class="text-forge-muted">-- Eliminar espacios en blanco al final de cada linea</span>
    <span class="text-forge-accent">local</span> lines = vim.api.nvim_buf_get_lines(0, 0, -1, <span class="text-forge-danger">false</span>)
    <span class="text-forge-accent">for</span> i, line <span class="text-forge-accent">in</span> <span class="text-forge-info">ipairs</span>(lines) <span class="text-forge-accent">do</span>
      lines[i] = line:gsub(<span class="text-forge-success">"%s+$"</span>, <span class="text-forge-success">""</span>)
    <span class="text-forge-accent">end</span>
    vim.api.nvim_buf_set_lines(0, 0, -1, <span class="text-forge-danger">false</span>, lines)
  <span class="text-forge-accent">end</span>,
  desc = <span class="text-forge-success">"Limpiar trailing whitespace en Lua"</span>,
{'}'})</pre>
        </div>

        <h3 class="font-bold text-lg mt-6 mb-3">Highlight on Yank (clasico)</h3>
        <div class="code-block">
          <pre><span class="text-forge-muted">-- Resaltar brevemente el texto copiado</span>
vim.api.nvim_create_autocmd(<span class="text-forge-success">"TextYankPost"</span>, {'{'}
  group = vim.api.nvim_create_augroup(<span class="text-forge-success">"HighlightYank"</span>, {'{'} clear = <span class="text-forge-danger">true</span> {'}'}),
  callback = <span class="text-forge-accent">function</span>()
    vim.highlight.on_yank({'{'}
      higroup = <span class="text-forge-success">"IncSearch"</span>,  <span class="text-forge-muted">-- grupo de highlight a usar</span>
      timeout = 200,          <span class="text-forge-muted">-- duracion en ms</span>
    {'}'})
  <span class="text-forge-accent">end</span>,
  desc = <span class="text-forge-success">"Resaltar texto al hacer yank"</span>,
{'}'})</pre>
        </div>

        <h3 class="font-bold text-lg mt-6 mb-3">Configuracion por tipo de archivo</h3>
        <div class="code-block">
          <pre>vim.api.nvim_create_autocmd(<span class="text-forge-success">"FileType"</span>, {'{'}
  group = grupo,
  pattern = {'{'} <span class="text-forge-success">"python"</span>, <span class="text-forge-success">"lua"</span> {'}'},
  callback = <span class="text-forge-accent">function</span>(args)
    vim.bo[args.buf].tabstop = 4
    vim.bo[args.buf].shiftwidth = 4
    vim.bo[args.buf].expandtab = <span class="text-forge-danger">true</span>
  <span class="text-forge-accent">end</span>,
  desc = <span class="text-forge-success">"Indentacion de 4 espacios para Python y Lua"</span>,
{'}'})</pre>
        </div>

        <div class="mt-4 p-4 rounded-lg bg-forge-darker border border-forge-border">
          <p class="text-sm text-forge-muted">
            <span class="text-forge-accent font-bold">Importante:</span> Siempre usa
            <code class="code-inline">nvim_create_augroup</code> con
            <code class="code-inline">clear = true</code>. Esto previene que los autocommands
            se dupliquen cada vez que recargues tu configuracion con <code class="code-inline">:source</code>.
          </p>
        </div>
      </div>
    </section>
  {/if}

  <!-- ============================== -->
  <!-- SECCION 6: User Commands -->
  <!-- ============================== -->
  {#if activeSection === 5}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-2xl font-black mb-4">
          <span class="text-forge-accent">User Commands</span> — Comandos personalizados
        </h2>
        <p class="text-forge-muted leading-relaxed mb-4">
          Con <code class="code-inline">nvim_create_user_command</code> puedes crear tus propios
          comandos de Neovim (como <code class="code-inline">:MiComando</code>). Estos aparecen
          en la linea de comandos con autocompletado y pueden recibir argumentos, rangos y el bang (!).
        </p>

        <h3 class="font-bold text-lg mt-6 mb-3">Comando basico: :Hello</h3>
        <div class="code-block">
          <pre>vim.api.nvim_create_user_command(<span class="text-forge-success">"Hello"</span>, <span class="text-forge-accent">function</span>(opts)
  <span class="text-forge-accent">local</span> name = opts.args ~= <span class="text-forge-success">""</span> <span class="text-forge-accent">and</span> opts.args <span class="text-forge-accent">or</span> <span class="text-forge-success">"Mundo"</span>
  vim.notify(<span class="text-forge-success">"Hola, "</span> .. name .. <span class="text-forge-success">"!"</span>, vim.log.levels.INFO)
<span class="text-forge-accent">end</span>, {'{'}
  nargs = <span class="text-forge-success">"?"</span>,  <span class="text-forge-muted">-- 0 o 1 argumento</span>
  desc = <span class="text-forge-success">"Saluda al usuario"</span>,
{'}'})
<span class="text-forge-muted">-- Uso: :Hello          -> "Hola, Mundo!"</span>
<span class="text-forge-muted">-- Uso: :Hello Neovim   -> "Hola, Neovim!"</span></pre>
        </div>

        <h3 class="font-bold text-lg mt-6 mb-3">Opciones de nargs</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-forge-border">
                <th class="text-left py-2 text-forge-accent">Valor</th>
                <th class="text-left py-2 text-forge-muted">Significado</th>
              </tr>
            </thead>
            <tbody class="text-forge-muted">
              <tr class="border-b border-forge-border/50">
                <td class="py-2 font-mono text-forge-accent">"0"</td>
                <td class="py-2">Sin argumentos</td>
              </tr>
              <tr class="border-b border-forge-border/50">
                <td class="py-2 font-mono text-forge-accent">"1"</td>
                <td class="py-2">Exactamente 1 argumento</td>
              </tr>
              <tr class="border-b border-forge-border/50">
                <td class="py-2 font-mono text-forge-accent">"?"</td>
                <td class="py-2">0 o 1 argumento</td>
              </tr>
              <tr class="border-b border-forge-border/50">
                <td class="py-2 font-mono text-forge-accent">"*"</td>
                <td class="py-2">Cualquier cantidad (0 o mas)</td>
              </tr>
              <tr>
                <td class="py-2 font-mono text-forge-accent">"+"</td>
                <td class="py-2">Al menos 1 argumento</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="font-bold text-lg mt-6 mb-3">Comando con bang y rango</h3>
        <div class="code-block">
          <pre>vim.api.nvim_create_user_command(<span class="text-forge-success">"Upper"</span>, <span class="text-forge-accent">function</span>(opts)
  <span class="text-forge-accent">local</span> start_line = opts.line1 - 1  <span class="text-forge-muted">-- convertir a 0-indexed</span>
  <span class="text-forge-accent">local</span> end_line = opts.line2

  <span class="text-forge-accent">local</span> lines = vim.api.nvim_buf_get_lines(0, start_line, end_line, <span class="text-forge-danger">false</span>)

  <span class="text-forge-accent">for</span> i, line <span class="text-forge-accent">in</span> <span class="text-forge-info">ipairs</span>(lines) <span class="text-forge-accent">do</span>
    <span class="text-forge-accent">if</span> opts.bang <span class="text-forge-accent">then</span>
      lines[i] = line:lower()  <span class="text-forge-muted">-- con ! convierte a minusculas</span>
    <span class="text-forge-accent">else</span>
      lines[i] = line:upper()  <span class="text-forge-muted">-- sin ! convierte a mayusculas</span>
    <span class="text-forge-accent">end</span>
  <span class="text-forge-accent">end</span>

  vim.api.nvim_buf_set_lines(0, start_line, end_line, <span class="text-forge-danger">false</span>, lines)
<span class="text-forge-accent">end</span>, {'{'}
  range = <span class="text-forge-danger">true</span>,   <span class="text-forge-muted">-- acepta rango de lineas</span>
  bang = <span class="text-forge-danger">true</span>,    <span class="text-forge-muted">-- acepta ! al final</span>
  desc = <span class="text-forge-success">"Convertir a mayusculas (con ! a minusculas)"</span>,
{'}'})
<span class="text-forge-muted">-- Uso: :Upper      -> todo el buffer a MAYUSCULAS</span>
<span class="text-forge-muted">-- Uso: :5,10Upper  -> lineas 5-10 a MAYUSCULAS</span>
<span class="text-forge-muted">-- Uso: :Upper!     -> todo a minusculas</span></pre>
        </div>

        <h3 class="font-bold text-lg mt-6 mb-3">Comando con autocompletado</h3>
        <div class="code-block">
          <pre>vim.api.nvim_create_user_command(<span class="text-forge-success">"Color"</span>, <span class="text-forge-accent">function</span>(opts)
  vim.cmd.colorscheme(opts.args)
<span class="text-forge-accent">end</span>, {'{'}
  nargs = 1,
  complete = <span class="text-forge-success">"color"</span>,  <span class="text-forge-muted">-- autocompletar con colorschemes</span>
  desc = <span class="text-forge-success">"Cambiar colorscheme"</span>,
{'}'})</pre>
        </div>
      </div>
    </section>
  {/if}

  <!-- ============================== -->
  <!-- SECCION 7: Namespaces -->
  <!-- ============================== -->
  {#if activeSection === 6}
    <section class="space-y-6 fade-in">
      <div class="card">
        <h2 class="text-2xl font-black mb-4">
          <span class="text-forge-accent">Namespaces</span> — Highlights y extmarks aislados
        </h2>
        <p class="text-forge-muted leading-relaxed mb-4">
          Un <strong>namespace</strong> en Neovim es un identificador numerico que permite agrupar
          highlights virtuales y extmarks. Al usar namespaces, tu plugin puede agregar decoraciones
          al buffer sin interferir con las de otros plugins, y puede limpiar solo las suyas
          cuando sea necesario.
        </p>

        <h3 class="font-bold text-lg mt-6 mb-3">Crear y usar un namespace</h3>
        <div class="code-block">
          <pre><span class="text-forge-muted">-- Crear un namespace con nombre (para depuracion)</span>
<span class="text-forge-accent">local</span> ns = vim.api.nvim_create_namespace(<span class="text-forge-success">"mi_plugin"</span>)

<span class="text-forge-muted">-- Agregar highlight virtual a una linea</span>
vim.api.nvim_buf_add_highlight(
  0,       <span class="text-forge-muted">-- buffer</span>
  ns,      <span class="text-forge-muted">-- namespace</span>
  <span class="text-forge-success">"Error"</span>,  <span class="text-forge-muted">-- grupo de highlight</span>
  0,       <span class="text-forge-muted">-- linea (0-indexed)</span>
  0,       <span class="text-forge-muted">-- columna inicio</span>
  5        <span class="text-forge-muted">-- columna fin (-1 = toda la linea)</span>
)

<span class="text-forge-muted">-- Limpiar todos los highlights de nuestro namespace</span>
vim.api.nvim_buf_clear_namespace(0, ns, 0, -1)</pre>
        </div>

        <h3 class="font-bold text-lg mt-6 mb-3">Extmarks: marcadores avanzados</h3>
        <div class="code-block">
          <pre><span class="text-forge-accent">local</span> ns = vim.api.nvim_create_namespace(<span class="text-forge-success">"diagnosticos"</span>)

<span class="text-forge-muted">-- Crear un extmark con texto virtual</span>
<span class="text-forge-accent">local</span> mark_id = vim.api.nvim_buf_set_extmark(0, ns, 0, 0, {'{'}
  virt_text = {'{'} {'{'} <span class="text-forge-success">" ← esta linea tiene un error"</span>, <span class="text-forge-success">"DiagnosticError"</span> {'}'} {'}'},
  virt_text_pos = <span class="text-forge-success">"eol"</span>,  <span class="text-forge-muted">-- al final de la linea</span>
{'}'})

<span class="text-forge-muted">-- Obtener la posicion de un extmark</span>
<span class="text-forge-accent">local</span> pos = vim.api.nvim_buf_get_extmark_by_id(0, ns, mark_id, {'{'}{'}'})
<span class="text-forge-muted">-- pos = {'{'} linea, columna {'}'}</span>

<span class="text-forge-muted">-- Listar todos los extmarks en un rango</span>
<span class="text-forge-accent">local</span> marks = vim.api.nvim_buf_get_extmarks(0, ns, 0, -1, {'{'}{'}'})


<span class="text-forge-muted">-- Borrar un extmark especifico</span>
vim.api.nvim_buf_del_extmark(0, ns, mark_id)</pre>
        </div>

        <h3 class="font-bold text-lg mt-6 mb-3">Ejemplo: Marcar lineas largas</h3>
        <div class="code-block">
          <pre><span class="text-forge-accent">local</span> ns = vim.api.nvim_create_namespace(<span class="text-forge-success">"lineas_largas"</span>)

<span class="text-forge-accent">local</span> <span class="text-forge-info">function</span> marcar_lineas_largas(max_len)
  max_len = max_len <span class="text-forge-accent">or</span> 80
  <span class="text-forge-muted">-- Limpiar marcas anteriores</span>
  vim.api.nvim_buf_clear_namespace(0, ns, 0, -1)

  <span class="text-forge-accent">local</span> lines = vim.api.nvim_buf_get_lines(0, 0, -1, <span class="text-forge-danger">false</span>)
  <span class="text-forge-accent">for</span> i, line <span class="text-forge-accent">in</span> <span class="text-forge-info">ipairs</span>(lines) <span class="text-forge-accent">do</span>
    <span class="text-forge-accent">if</span> #line > max_len <span class="text-forge-accent">then</span>
      vim.api.nvim_buf_set_extmark(0, ns, i - 1, max_len, {'{'}
        virt_text = {'{'}
          {'{'} <span class="text-forge-success">" ↑ "</span> .. #line .. <span class="text-forge-success">" chars"</span>, <span class="text-forge-success">"DiagnosticWarn"</span> {'}'}
        {'}'},
        virt_text_pos = <span class="text-forge-success">"eol"</span>,
        line_hl_group = <span class="text-forge-success">"DiagnosticWarn"</span>,
      {'}'})
    <span class="text-forge-accent">end</span>
  <span class="text-forge-accent">end</span>
<span class="text-forge-accent">end</span></pre>
        </div>

        <div class="mt-4 p-4 rounded-lg bg-forge-darker border border-forge-border">
          <p class="text-sm text-forge-muted">
            <span class="text-forge-accent font-bold">Tip pro:</span> Los extmarks "se mueven"
            con el texto. Si insertas lineas arriba de un extmark, su posicion se actualiza
            automaticamente. Esto los hace ideales para diagnosticos, decoraciones y marcadores.
          </p>
        </div>
      </div>
    </section>
  {/if}

  <!-- ============================== -->
  <!-- QUIZ CON TIMER -->
  <!-- ============================== -->
  <section class="mt-12 space-y-6 fade-in">
    <div class="card">
      <h2 class="text-2xl font-black mb-2">Pon a prueba tu conocimiento</h2>
      <p class="text-forge-muted mb-6">
        8 preguntas sobre la API de Neovim. Tienes 3 minutos para completarlas.
        El timer es solo un desafio extra — puedes seguir respondiendo aunque se acabe el tiempo.
      </p>

      {#if !quizStarted}
        <div class="text-center py-8">
          <div class="text-5xl mb-4">🔍</div>
          <h3 class="text-xl font-bold mb-2">Desafio: API Explorer</h3>
          <p class="text-forge-muted text-sm mb-6">
            Demuestra que dominas vim.api, vim.fn, buffers, ventanas, autocommands y mas.
          </p>
          <button
            onclick={() => quizStarted = true}
            class="btn-primary"
          >
            Iniciar desafio
          </button>
        </div>
      {:else}
        <div class="flex items-center justify-between mb-6">
          <Timer
            duration={180}
            onTimeUp={handleTimeUp}
            autoStart={true}
            label="Desafio cronometrado"
          />
          {#if timeUp}
            <span class="text-forge-warning text-sm font-bold slide-in">
              Tiempo agotado — pero puedes seguir
            </span>
          {/if}
        </div>

        {#if completed}
          <div class="text-center py-4 slide-in">
            <p class="text-forge-success font-bold text-lg">Modulo completado!</p>
            <p class="text-forge-muted text-sm mt-1">
              {#if timeUp}
                Completaste el quiz despues del tiempo, pero lo importante es aprender.
              {:else}
                Completaste el quiz dentro del tiempo. Excelente!
              {/if}
            </p>
          </div>
        {/if}

        <Quiz {questions} onComplete={completeModule} />
      {/if}
    </div>
  </section>

  <!-- Fuentes -->
  <SourcesSection sources={mod.sources} />

  <!-- Navegacion -->
  <ModuleNav currentModule={5} />
</div>

<!-- Vocabulario flotante -->
<VocabularyFloat moduleId={5} />

<!-- Badge notification -->
{#if showBadge && earnedBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => showBadge = false} />
{/if}
