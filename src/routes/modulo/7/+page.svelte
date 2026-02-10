<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import BranchingScenario from '$lib/components/BranchingScenario.svelte';
  import Quiz from '$lib/components/Quiz.svelte';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';

  const mod = modules.find(m => m.id === 7)!;

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
      courseStore.completeModule(7, scenarioScore + quizScore, scenarioMax + quizMax);
      const badge = allBadges.find(b => b.id === 'pomodoro-master')!;
      courseStore.unlockBadge(badge);
      earnedBadge = badge;
      showBadge = true;
    }
  }

  $effect(() => {
    courseStore.startModule(7);
  });

  // ── Branching Scenario: Construye el Pomodoro ──
  const scenarioNodes: Record<string, any> = {
    start: {
      id: 'start',
      narrative: 'Estas construyendo un plugin Pomodoro para Neovim. El primer paso es crear un timer que se ejecute cada segundo para hacer la cuenta regresiva. Neovim tiene varias formas de manejar timers. Cual API usas para crear un timer que se repita cada segundo?',
      choices: [
        {
          text: 'vim.loop.new_timer() — Timer asincrono de libuv integrado en Neovim',
          nextId: 'step2',
          points: 3,
          feedback: 'Excelente! vim.loop (alias de vim.uv) expone la API de libuv, que es el motor asincrono de Neovim. new_timer() crea un timer eficiente que no bloquea el editor.'
        },
        {
          text: 'vim.fn.timer_start() — Funcion de Vimscript para timers',
          nextId: 'step2',
          points: 1,
          feedback: 'Funciona, pero es la API de Vimscript. Para plugins en Lua es mejor usar vim.loop.new_timer() directamente, que te da mas control y es la forma idiomatica en Lua.'
        },
        {
          text: 'Un while loop con vim.wait() dentro — Esperar en un ciclo',
          nextId: 'step2',
          points: 0,
          feedback: 'Cuidado! Un while loop bloquea el hilo principal de Neovim. Tu editor se congelaria completamente mientras el timer corre. Nunca bloquees el main loop.'
        }
      ]
    },
    step2: {
      id: 'step2',
      narrative: 'Bien, ya tienes el timer corriendo. Pero hay un problema critico: el callback del timer se ejecuta en el hilo de libuv, que esta FUERA del main loop de Neovim. Si intentas llamar a funciones de la API de Neovim directamente desde ahi, el editor puede crashear. Como resuelves esto?',
      choices: [
        {
          text: 'Envolver el callback con vim.schedule_wrap() para ejecutarlo en el main loop',
          nextId: 'step3',
          points: 3,
          feedback: 'Perfecto! vim.schedule_wrap() agenda la ejecucion de tu callback en el main loop de Neovim, donde es seguro llamar a la API. Es OBLIGATORIO para cualquier callback de libuv que toque la API de Neovim.'
        },
        {
          text: 'Llamar vim.cmd("redrawstatus") directamente en el callback del timer',
          nextId: 'step3',
          points: 0,
          feedback: 'Peligroso! Llamar funciones de la API de Neovim fuera del main loop causa comportamiento indefinido y puede crashear el editor. Necesitas vim.schedule_wrap() para ser thread-safe.'
        },
        {
          text: 'Usar vim.defer_fn() en lugar del timer de libuv',
          nextId: 'step3',
          points: 1,
          feedback: 'vim.defer_fn() ejecuta una funcion una sola vez despues de un delay. No es ideal para callbacks repetidos como un timer de cada segundo. vim.schedule_wrap() con vim.loop.new_timer() es la combinacion correcta.'
        }
      ]
    },
    step3: {
      id: 'step3',
      narrative: 'El timer funciona y la cuenta regresiva baja correctamente. Ahora el pomodoro llego a 00:00 y necesitas notificar al usuario de que su sesion de trabajo termino. Como lo haces?',
      choices: [
        {
          text: 'vim.notify() con el nivel vim.log.levels.INFO — Sistema de notificaciones de Neovim',
          nextId: 'step4',
          points: 3,
          feedback: 'Correcto! vim.notify() es la API estandar de notificaciones en Neovim. Plugins como nvim-notify pueden interceptar estas notificaciones y mostrarlas con estilos avanzados. Es la forma idiomatica.'
        },
        {
          text: 'print() — La funcion basica de salida de Lua',
          nextId: 'step4',
          points: 1,
          feedback: 'print() funciona en Neovim, pero muestra el mensaje en la linea de comandos sin ningun estilo ni nivel de severidad. vim.notify() es mucho mas flexible y compatible con plugins de notificacion.'
        },
        {
          text: 'vim.api.nvim_echo() — La funcion de echo de la API',
          nextId: 'step4',
          points: 2,
          feedback: 'nvim_echo() funciona y permite controlar highlighting, pero vim.notify() es mas semantica: permite especificar niveles (INFO, WARN, ERROR) y es interceptable por plugins de notificacion como nvim-notify.'
        }
      ]
    },
    step4: {
      id: 'step4',
      narrative: 'Ultimo paso: necesitas mostrar el tiempo restante en el statusline de Neovim. El statusline se actualiza periodicamente y puede ejecutar expresiones Lua. Como expones la informacion del timer para que el statusline la consuma?',
      choices: [
        {
          text: 'Una funcion M.status() que retorna el string formateado con el tiempo',
          nextId: 'end-good',
          points: 3,
          feedback: 'Exacto! Una funcion publica que retorna un string es limpia, predecible y facil de integrar con cualquier statusline (nativo o lualine). El statusline llama a la funcion y obtiene el texto actualizado.'
        },
        {
          text: 'Una variable global que se actualiza con cada tick del timer',
          nextId: 'end-ok',
          points: 0,
          feedback: 'Variables globales son una mala practica. Contaminan el espacio de nombres, pueden colisionar con otros plugins, y hacen el codigo dificil de mantener. Siempre encapsula con funciones.'
        },
        {
          text: 'Un autocommand que escribe en una variable de vim con vim.g',
          nextId: 'end-ok',
          points: 1,
          feedback: 'Sobreingenieria. Crear un autocommand para cada tick del timer solo para actualizar una variable es innecesariamente complejo. Una funcion simple que retorna un string es mucho mas directa.'
        }
      ]
    },
    'end-good': {
      id: 'end-good',
      outcome: {
        title: 'Arquitecto de Plugins',
        description: 'Tomaste las decisiones correctas en cada paso. Entiendes el event loop de Neovim, la seguridad de hilos con vim.schedule_wrap, y los patrones idiomaticos para plugins en Lua.',
        score: 0,
        maxScore: 12,
        grade: 'excellent' as const,
        lessons: [
          'vim.loop.new_timer() es la forma idiomatica de crear timers en Neovim con Lua',
          'vim.schedule_wrap() es OBLIGATORIO para callbacks de libuv que tocan la API de Neovim',
          'vim.notify() es la API estandar de notificaciones, compatible con plugins externos',
          'Funciones publicas en el modulo son la forma limpia de exponer datos al statusline'
        ]
      }
    },
    'end-ok': {
      id: 'end-ok',
      outcome: {
        title: 'Buen Intento',
        description: 'Tienes la idea general pero algunos detalles de la arquitectura necesitan refuerzo. Revisa los conceptos de vim.schedule_wrap y los patrones de encapsulacion.',
        score: 0,
        maxScore: 12,
        grade: 'good' as const,
        lessons: [
          'Evita variables globales — usa funciones del modulo para exponer datos',
          'vim.schedule_wrap() es esencial para la seguridad de hilos en callbacks asincronos',
          'vim.notify() es preferible a print() para notificaciones al usuario',
          'Mantener el estado encapsulado en el modulo es clave para plugins mantenibles'
        ]
      }
    }
  };

  // ── Quiz Questions ──
  const quizQuestions = [
    {
      question: 'Por que es NECESARIO usar vim.schedule_wrap() en callbacks de timers creados con vim.loop?',
      options: [
        {
          text: 'Para que el callback se ejecute mas rapido',
          correct: false,
          explanation: 'vim.schedule_wrap() no afecta la velocidad. Su proposito es la seguridad: agenda la ejecucion en el main loop donde es seguro usar la API de Neovim.'
        },
        {
          text: 'Porque el timer corre fuera del main loop de Neovim y la API no es thread-safe',
          correct: true,
          explanation: 'Correcto! Los timers de libuv ejecutan callbacks en su propio hilo. La API de Neovim solo es segura en el main loop. vim.schedule_wrap() mueve la ejecucion al main loop.'
        },
        {
          text: 'Es opcional, solo mejora el rendimiento del timer',
          correct: false,
          explanation: 'No es opcional. Sin vim.schedule_wrap(), llamar funciones de la API de Neovim desde un callback de libuv causa comportamiento indefinido y puede crashear el editor.'
        },
        {
          text: 'Para poder usar funciones de Lua dentro del callback',
          correct: false,
          explanation: 'Las funciones puras de Lua funcionan sin problema fuera del main loop. El problema es especificamente con funciones de la API de Neovim (vim.cmd, vim.api, etc).'
        }
      ],
      source: 'Neovim Lua Reference',
      sourceUrl: 'https://neovim.io/doc/user/lua.html'
    },
    {
      question: 'Como fuerzas al statusline de Neovim a actualizarse despues de cambiar el estado del timer?',
      options: [
        {
          text: 'vim.cmd("redrawstatus") — Redibuja el statusline inmediatamente',
          correct: true,
          explanation: 'Correcto! redrawstatus fuerza a Neovim a redibujar el statusline, ejecutando de nuevo las expresiones que contiene y mostrando el tiempo actualizado.'
        },
        {
          text: 'vim.opt.statusline = vim.opt.statusline — Reasignar el statusline',
          correct: false,
          explanation: 'Reasignar la opcion no es necesario ni eficiente. redrawstatus es el comando especifico para forzar la actualizacion visual del statusline.'
        },
        {
          text: 'No hace falta, el statusline se actualiza solo cada segundo',
          correct: false,
          explanation: 'El statusline no se actualiza automaticamente por tiempo. Se actualiza en ciertos eventos (cambio de modo, escritura, etc). Necesitas redrawstatus para forzarlo.'
        },
        {
          text: 'vim.cmd("redraw!") — Redibujar toda la pantalla',
          correct: false,
          explanation: 'redraw! redibuja TODA la pantalla, lo cual es excesivo y puede causar parpadeo. redrawstatus es mas eficiente porque solo actualiza el statusline.'
        }
      ],
      source: 'Neovim Lua Reference',
      sourceUrl: 'https://neovim.io/doc/user/lua.html'
    },
    {
      question: 'Que hace vim.loop.new_timer():start(0, 1000, fn)?',
      options: [
        {
          text: 'Ejecuta fn una sola vez despues de 1000ms',
          correct: false,
          explanation: 'Eso seria start(1000, 0, fn) donde el repeat es 0. Con repeat en 1000, el timer se repite cada segundo.'
        },
        {
          text: 'Empieza inmediatamente (delay 0) y repite fn cada 1000ms (1 segundo)',
          correct: true,
          explanation: 'Correcto! El primer argumento (0) es el delay inicial en ms, el segundo (1000) es el intervalo de repeticion. Asi el callback se ejecuta de inmediato y luego cada segundo.'
        },
        {
          text: 'Ejecuta fn 1000 veces sin delay',
          correct: false,
          explanation: 'El segundo argumento no es la cantidad de veces, sino el intervalo de repeticion en milisegundos. El timer se repite indefinidamente hasta que lo detengas.'
        },
        {
          text: 'Crea un timer que espera entre 0 y 1000ms aleatoriamente',
          correct: false,
          explanation: 'No hay aleatoriedad. start(delay, repeat, callback) es determinista: delay es la espera inicial y repeat es el intervalo fijo entre ejecuciones.'
        }
      ],
      source: 'Neovim Lua Reference',
      sourceUrl: 'https://neovim.io/doc/user/lua.html'
    },
    {
      question: 'Cual es el proposito principal de vim.notify() en un plugin?',
      options: [
        {
          text: 'Escribir logs en un archivo del sistema',
          correct: false,
          explanation: 'vim.notify() muestra notificaciones al usuario dentro de Neovim, no escribe en archivos de log del sistema.'
        },
        {
          text: 'Enviar notificaciones del sistema operativo',
          correct: false,
          explanation: 'vim.notify() opera dentro de Neovim, no envia notificaciones nativas del OS. Es un sistema de mensajes interno del editor.'
        },
        {
          text: 'Mostrar notificaciones al usuario con niveles de severidad (INFO, WARN, ERROR)',
          correct: true,
          explanation: 'Correcto! vim.notify(msg, level) muestra mensajes al usuario dentro de Neovim. Soporta niveles de severidad y es interceptable por plugins como nvim-notify para mostrar notificaciones estilizadas.'
        },
        {
          text: 'Imprimir texto en la terminal externa',
          correct: false,
          explanation: 'vim.notify() muestra mensajes dentro de la interfaz de Neovim, no en la terminal externa. Para la terminal usarias io.write() o print().'
        }
      ],
      source: 'Neovim Lua Reference',
      sourceUrl: 'https://neovim.io/doc/user/lua.html'
    }
  ];
</script>

<svelte:head>
  <title>Modulo 7: {mod.title} — La Forja de Lua</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">

  <!-- ============================================ -->
  <!-- HEADER DEL MODULO                            -->
  <!-- ============================================ -->
  <header class="mb-12 fade-in">
    <div class="flex items-center gap-3 mb-2">
      <span class="text-5xl">{mod.icon}</span>
      <div>
        <p class="text-xs text-forge-muted uppercase tracking-wider font-bold">Modulo 7</p>
        <h1 class="text-3xl sm:text-4xl font-black text-forge-accent">{mod.title}</h1>
      </div>
    </div>
    <p class="text-forge-muted mt-1 text-lg">{mod.subtitle}</p>
    <p class="text-sm text-forge-muted mt-3 leading-relaxed">{mod.description}</p>

    <div class="mt-4 flex flex-wrap gap-2">
      <span class="badge bg-forge-accent/20 text-forge-accent">{mod.duration}</span>
      <span class="badge bg-forge-info/20 text-forge-info">{mod.type}</span>
    </div>

    <!-- Objetivos -->
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

  <!-- ============================================ -->
  <!-- SECCION 1: ESTRUCTURA DEL PLUGIN             -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">1.</span> Estructura del plugin Pomodoro
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      Antes de escribir codigo, necesitas entender como se organiza un plugin de Neovim.
      La estructura de directorios sigue convenciones que Neovim espera para cargar tu plugin
      automaticamente.
    </p>

    <div class="code-block">
      <pre>
pomodoro.nvim/
├── lua/
│   └── pomodoro/
│       └── init.lua      -- Modulo principal (logica del timer)
├── plugin/
│   └── pomodoro.lua      -- Punto de entrada (comandos y keymaps)
└── README.md             -- Documentacion</pre>
    </div>

    <div class="card mt-4 border-l-4 border-forge-accent">
      <p class="text-sm text-forge-muted">
        <strong class="text-forge-accent">Dos carpetas, dos propositos:</strong>
        La carpeta <code class="code-inline">lua/</code> contiene modulos que se cargan con
        <code class="code-inline">require("pomodoro")</code>. La carpeta
        <code class="code-inline">plugin/</code> contiene scripts que Neovim ejecuta automaticamente
        al iniciar — aqui registras comandos y keymaps. Esta separacion es clave para
        mantener el plugin organizado.
      </p>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SECCION 2: ESTADO DEL TIMER                  -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">2.</span> Paso 1: Estado del timer
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      El primer paso es definir el estado interno del plugin. Usamos una <strong>tabla local</strong>
      que actua como el "cerebro" del Pomodoro. Al ser <code class="code-inline">local</code>,
      esta tabla queda <strong>encapsulada</strong> dentro del modulo — nadie fuera puede modificarla
      directamente. Esto es el <strong>patron de closure</strong> que vimos en el Modulo 3.
    </p>

    <div class="code-block">
      <pre>
local M = {'{'}{'}'}

local state = {'{'}
  running = false,
  paused = false,
  minutes = 25,
  seconds = 0,
  timer = nil,
  mode = "work",  -- "work" | "break"
  work_duration = 25,
  break_duration = 5,
  sessions = 0,
{'}'}</pre>
    </div>

    <div class="grid sm:grid-cols-2 gap-4 mt-4">
      <div class="card bg-forge-darker">
        <p class="text-forge-accent font-bold text-sm mb-2">La tabla M</p>
        <p class="text-xs text-forge-muted">
          Es la tabla que exportaremos con <code class="code-inline">return M</code> al final.
          Contiene las funciones publicas del plugin. Es el patron estandar de modulos en Lua.
        </p>
      </div>
      <div class="card bg-forge-darker">
        <p class="text-forge-accent font-bold text-sm mb-2">La tabla state</p>
        <p class="text-xs text-forge-muted">
          Es <strong>privada</strong> al modulo. Guarda todo el estado mutable: tiempo restante,
          si esta corriendo, el modo actual, y la referencia al timer de libuv.
        </p>
      </div>
    </div>

    <div class="card mt-4 border-l-4 border-forge-accent">
      <p class="text-sm text-forge-muted">
        <strong class="text-forge-accent">Por que una tabla para el estado?</strong>
        Podrias usar variables locales sueltas (<code class="code-inline">local running = false</code>),
        pero una tabla agrupa todo el estado en un solo lugar. Es mas facil de leer, debuggear
        y eventualmente resetear (<code class="code-inline">state.minutes = 25</code> en vez de
        buscar cada variable suelta).
      </p>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SECCION 3: VIM.LOOP PARA TIMERS              -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">3.</span> Paso 2: vim.loop para timers
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      Este es el corazon del plugin. <code class="code-inline">vim.loop</code> (tambien conocido como
      <code class="code-inline">vim.uv</code>) expone la API de <strong>libuv</strong>, el motor
      asincrono que usa Neovim internamente. Con <code class="code-inline">new_timer()</code> creamos
      un timer que se repite cada segundo.
    </p>

    <div class="code-block">
      <pre>
function M.start()
  if state.running then return end
  state.running = true
  state.paused = false

  state.timer = vim.loop.new_timer()
  state.timer:start(0, 1000, vim.schedule_wrap(function()
    if state.paused then return end

    if state.seconds > 0 then
      state.seconds = state.seconds - 1
    elseif state.minutes > 0 then
      state.minutes = state.minutes - 1
      state.seconds = 59
    else
      M.finish()
    end

    vim.cmd("redrawstatus")
  end))
end</pre>
    </div>

    <p class="text-forge-muted leading-relaxed mt-4 mb-4">
      Hay cuatro conceptos criticos en este bloque de codigo. Entender cada uno es fundamental:
    </p>

    <div class="space-y-3">
      <div class="card bg-forge-darker border-l-4 border-forge-accent">
        <p class="text-forge-accent font-bold text-sm mb-1">vim.loop.new_timer()</p>
        <p class="text-xs text-forge-muted">
          Crea un nuevo timer de libuv. Es un objeto con metodos <code class="code-inline">:start()</code>,
          <code class="code-inline">:stop()</code> y <code class="code-inline">:close()</code>.
          Es la misma tecnologia que usa Node.js para sus timers.
        </p>
      </div>

      <div class="card bg-forge-darker border-l-4 border-forge-danger">
        <p class="text-forge-danger font-bold text-sm mb-1">vim.schedule_wrap() — CRITICO</p>
        <p class="text-xs text-forge-muted">
          El callback del timer se ejecuta en el <strong>hilo de libuv</strong>, que esta fuera
          del main loop de Neovim. Si llamas a <code class="code-inline">vim.cmd</code> o cualquier
          funcion de la API directamente, el editor puede crashear.
          <code class="code-inline">vim.schedule_wrap()</code> envuelve tu funcion para que se
          ejecute de forma segura en el main loop. <strong>SIEMPRE</strong> usalo con callbacks de libuv.
        </p>
      </div>

      <div class="card bg-forge-darker border-l-4 border-forge-accent">
        <p class="text-forge-accent font-bold text-sm mb-1">:start(delay, repeat, callback)</p>
        <p class="text-xs text-forge-muted">
          Inicia el timer. El primer argumento (<code class="code-inline">0</code>) es el delay
          inicial en milisegundos. El segundo (<code class="code-inline">1000</code>) es el
          intervalo de repeticion. Asi, el callback se ejecuta inmediatamente y luego cada segundo.
        </p>
      </div>

      <div class="card bg-forge-darker border-l-4 border-forge-accent">
        <p class="text-forge-accent font-bold text-sm mb-1">vim.cmd("redrawstatus")</p>
        <p class="text-xs text-forge-muted">
          Fuerza a Neovim a redibujar el statusline. Sin esto, el tiempo que muestra el statusline
          no se actualiza visualmente hasta que ocurra otro evento (cambio de modo, tecleo, etc).
        </p>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SECCION 4: CONTROLES                         -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">4.</span> Paso 3: Controles (pause, stop, finish)
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      Un Pomodoro sin controles es un reloj sin botones. Necesitamos tres funciones: pausar/reanudar,
      detener completamente, y manejar el fin de un ciclo. Cada una modifica el estado de forma diferente.
    </p>

    <h3 class="text-lg font-bold mb-3">Pause — Toggle de pausa</h3>

    <div class="code-block mb-4">
      <pre>
function M.pause()
  state.paused = not state.paused
end</pre>
    </div>

    <p class="text-forge-muted text-sm leading-relaxed mb-4">
      Simple pero elegante: <code class="code-inline">not state.paused</code> alterna entre
      <code class="code-inline">true</code> y <code class="code-inline">false</code>. El timer
      sigue corriendo, pero el callback verifica <code class="code-inline">if state.paused then return end</code>
      y no modifica el tiempo. Asi evitamos detener y recrear el timer cada vez.
    </p>

    <h3 class="text-lg font-bold mb-3">Stop — Detener y resetear</h3>

    <div class="code-block mb-4">
      <pre>
function M.stop()
  if state.timer then
    state.timer:stop()
    state.timer:close()
    state.timer = nil
  end
  state.running = false
  state.paused = false
  state.minutes = state.work_duration
  state.seconds = 0
  state.mode = "work"
end</pre>
    </div>

    <div class="card mt-2 mb-4 border-l-4 border-forge-accent">
      <p class="text-sm text-forge-muted">
        <strong class="text-forge-accent">Limpieza del timer:</strong> Siempre llama
        <code class="code-inline">:stop()</code> Y <code class="code-inline">:close()</code>
        al terminar con un timer de libuv. <code class="code-inline">:stop()</code> detiene
        la ejecucion pero el recurso sigue existiendo. <code class="code-inline">:close()</code>
        libera la memoria. Si no haces <code class="code-inline">:close()</code>, tienes un
        memory leak.
      </p>
    </div>

    <h3 class="text-lg font-bold mb-3">Finish — Completar un ciclo</h3>

    <div class="code-block">
      <pre>
function M.finish()
  M.stop()
  state.sessions = state.sessions + 1

  if state.mode == "work" then
    vim.notify("Pomodoro completado! Toma un descanso.", vim.log.levels.INFO)
    state.mode = "break"
    state.minutes = state.break_duration
  else
    vim.notify("Descanso terminado! A trabajar.", vim.log.levels.INFO)
    state.mode = "work"
    state.minutes = state.work_duration
  end
end</pre>
    </div>

    <p class="text-forge-muted text-sm leading-relaxed mt-4">
      <code class="code-inline">vim.notify()</code> es la API estandar de Neovim para
      notificaciones. El segundo argumento es el nivel de severidad
      (<code class="code-inline">vim.log.levels.INFO</code>,
      <code class="code-inline">WARN</code>, <code class="code-inline">ERROR</code>).
      Plugins como <strong>nvim-notify</strong> pueden interceptar estas notificaciones
      y mostrarlas con animaciones y estilos personalizados.
    </p>
  </section>

  <!-- ============================================ -->
  <!-- SECCION 5: INTEGRACION CON STATUSLINE        -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">5.</span> Paso 4: Integracion con el statusline
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      El statusline es la barra inferior de Neovim que muestra informacion contextual. Nuestro plugin
      expone una funcion que retorna un string con el estado actual del timer. El statusline
      la llama cada vez que se redibuja.
    </p>

    <div class="code-block">
      <pre>
function M.status()
  if not state.running then return "" end

  local icon = state.mode == "work" and "T" or "C"
  local pause_icon = state.paused and " [P]" or ""
  local time = string.format("%02d:%02d", state.minutes, state.seconds)

  return string.format(" %s %s%s ", icon, time, pause_icon)
end</pre>
    </div>

    <p class="text-forge-muted text-sm leading-relaxed mt-4 mb-4">
      La funcion retorna un <strong>string vacio</strong> si el timer no esta corriendo — asi el
      statusline no muestra nada cuando no hay pomodoro activo.
      <code class="code-inline">string.format("%02d:%02d", ...)</code> formatea los numeros con
      cero a la izquierda (ejemplo: "05:03" en vez de "5:3").
    </p>

    <h3 class="text-lg font-bold mb-3">Conectar con el statusline nativo</h3>

    <div class="code-block mb-4">
      <pre>
-- En tu init.lua o en plugin/pomodoro.lua:
vim.opt.statusline:append("%{'{'}%v:lua.require('pomodoro').status()%{'}'}")</pre>
    </div>

    <h3 class="text-lg font-bold mb-3">Conectar con lualine.nvim</h3>

    <div class="code-block">
      <pre>
-- En la configuracion de lualine:
require("lualine").setup({'{'}
  sections = {'{'}
    lualine_x = {'{'}
      function() return require("pomodoro").status() end
    {'}'}
  {'}'}
{'}'})</pre>
    </div>

    <div class="card mt-4 border-l-4 border-forge-accent">
      <p class="text-sm text-forge-muted">
        <strong class="text-forge-accent">Patron importante:</strong> Exponer datos mediante
        funciones que retornan strings es el patron estandar para integrar con el statusline.
        La funcion se ejecuta cada vez que el statusline se redibuja, obteniendo siempre
        el valor actualizado. Es la misma tecnica que usan plugins como git-signs y lsp-status.
      </p>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SECCION 6: COMANDOS Y KEYMAPS               -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">6.</span> Paso 5: Comandos y keymaps
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      El archivo <code class="code-inline">plugin/pomodoro.lua</code> es el punto de entrada
      que Neovim carga automaticamente. Aqui registramos los <strong>user commands</strong>
      (comandos que el usuario puede ejecutar con <code class="code-inline">:</code>) y los
      <strong>keymaps</strong> (atajos de teclado).
    </p>

    <div class="code-block">
      <pre>
-- plugin/pomodoro.lua
local pomodoro = require("pomodoro")

vim.api.nvim_create_user_command("PomodoroStart", pomodoro.start, {'{}'})
vim.api.nvim_create_user_command("PomodoroStop", pomodoro.stop, {'{}'})
vim.api.nvim_create_user_command("PomodoroPause", pomodoro.pause, {'{}'})

vim.keymap.set("n", "&lt;leader&gt;ps", pomodoro.start, {'{'} desc = "Pomodoro Start" {'}'})
vim.keymap.set("n", "&lt;leader&gt;pp", pomodoro.pause, {'{'} desc = "Pomodoro Pause" {'}'})
vim.keymap.set("n", "&lt;leader&gt;px", pomodoro.stop, {'{'} desc = "Pomodoro Stop" {'}'})</pre>
    </div>

    <div class="grid sm:grid-cols-2 gap-4 mt-4">
      <div class="card bg-forge-darker">
        <p class="text-forge-accent font-bold text-sm mb-2">User Commands</p>
        <p class="text-xs text-forge-muted">
          <code class="code-inline">nvim_create_user_command</code> registra comandos que
          aparecen con <code class="code-inline">:Pomodoro</code> y soportan autocompletado.
          El nombre debe empezar con mayuscula (convencion de Neovim).
        </p>
      </div>
      <div class="card bg-forge-darker">
        <p class="text-forge-accent font-bold text-sm mb-2">Keymaps</p>
        <p class="text-xs text-forge-muted">
          <code class="code-inline">vim.keymap.set</code> crea atajos de teclado.
          El campo <code class="code-inline">desc</code> es importante: permite que plugins como
          <strong>which-key</strong> muestren la descripcion del atajo.
        </p>
      </div>
    </div>

    <div class="card mt-4 bg-forge-darker border border-forge-border">
      <p class="text-xs text-forge-muted uppercase tracking-wider font-bold mb-2">No olvides el return</p>
      <p class="text-sm text-forge-muted">
        Al final de <code class="code-inline">lua/pomodoro/init.lua</code> necesitas
        <code class="code-inline">return M</code>. Sin esto, <code class="code-inline">require("pomodoro")</code>
        retorna <code class="code-inline">true</code> en vez del modulo, y nada funciona.
      </p>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SECCION 7: CONCEPTOS CLAVE                   -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">7.</span> Conceptos clave — Resumen
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      Antes de pasar al escenario interactivo, asegurate de tener claros estos cuatro conceptos
      fundamentales que usamos en el plugin:
    </p>

    <div class="space-y-3">
      <div class="card bg-forge-darker">
        <div class="flex items-start gap-3">
          <span class="text-2xl">&#9888;</span>
          <div>
            <p class="text-forge-accent font-bold text-sm">vim.schedule_wrap()</p>
            <p class="text-xs text-forge-muted mt-1">
              Los timers de libuv ejecutan callbacks en un hilo separado. La API de Neovim
              <strong>no es thread-safe</strong>. vim.schedule_wrap() mueve la ejecucion al
              main loop donde es seguro usar vim.cmd, vim.api, etc. Sin esto, tu plugin puede
              crashear Neovim.
            </p>
          </div>
        </div>
      </div>

      <div class="card bg-forge-darker">
        <div class="flex items-start gap-3">
          <span class="text-2xl">&#128276;</span>
          <div>
            <p class="text-forge-accent font-bold text-sm">vim.notify()</p>
            <p class="text-xs text-forge-muted mt-1">
              La forma estandar de mostrar notificaciones al usuario. Acepta un mensaje y un
              nivel de severidad. Es extensible: plugins como nvim-notify pueden reemplazar
              la implementacion por defecto con notificaciones visuales avanzadas.
            </p>
          </div>
        </div>
      </div>

      <div class="card bg-forge-darker">
        <div class="flex items-start gap-3">
          <span class="text-2xl">&#128260;</span>
          <div>
            <p class="text-forge-accent font-bold text-sm">redrawstatus</p>
            <p class="text-xs text-forge-muted mt-1">
              El statusline no se redibuja automaticamente por tiempo. Necesitas forzar
              el redibujado con <code class="code-inline">vim.cmd("redrawstatus")</code>
              cada vez que el estado del timer cambia. Es la forma eficiente de actualizar
              solo el statusline sin redibujar toda la pantalla.
            </p>
          </div>
        </div>
      </div>

      <div class="card bg-forge-darker">
        <div class="flex items-start gap-3">
          <span class="text-2xl">&#128274;</span>
          <div>
            <p class="text-forge-accent font-bold text-sm">Patron de closure para estado</p>
            <p class="text-xs text-forge-muted mt-1">
              La tabla <code class="code-inline">state</code> es local al modulo. Las funciones
              en <code class="code-inline">M</code> son closures que capturan
              <code class="code-inline">state</code> como upvalue. Esto encapsula el estado:
              nadie fuera del modulo puede modificarlo directamente, solo a traves de las
              funciones publicas.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- ESCENARIO: CONSTRUYE EL POMODORO             -->
  <!-- ============================================ -->
  <section class="mb-12">
    <h2 class="text-2xl font-black mb-6 flex items-center gap-2">
      <span class="text-forge-accent">&#127919;</span> Escenario: Construye el Pomodoro
    </h2>
    <p class="text-forge-muted mb-6">
      Pon a prueba tus decisiones de arquitectura. En cada paso, elige la mejor opcion
      para construir el plugin Pomodoro. Tus elecciones determinan la calidad del resultado.
    </p>

    <BranchingScenario
      nodes={scenarioNodes}
      startId="start"
      title="Construye el Pomodoro"
      onComplete={onScenarioComplete}
    />
  </section>

  <!-- ============================================ -->
  <!-- QUIZ                                          -->
  <!-- ============================================ -->
  <section class="mb-12">
    <h2 class="text-2xl font-black mb-6 flex items-center gap-2">
      <span class="text-forge-accent">&#129514;</span> Quiz: Timers y Statusline
    </h2>
    <p class="text-forge-muted mb-6">
      Verifica que entiendes los conceptos fundamentales del plugin. Estas preguntas
      cubren los puntos mas criticos que vimos en la teoria.
    </p>

    <Quiz questions={quizQuestions} onComplete={onQuizComplete} />
  </section>

  <!-- ============================================ -->
  <!-- COMPLETADO                                    -->
  <!-- ============================================ -->
  {#if scenarioDone && quizDone}
    <section class="mb-12 slide-in">
      <div class="card border-forge-success/50 bg-forge-success/5">
        <div class="flex items-center gap-3">
          <span class="text-3xl">&#9878;</span>
          <div>
            <p class="font-bold text-forge-success">Modulo completado!</p>
            <p class="text-sm text-forge-muted mt-1">
              Has construido un plugin Pomodoro completo para Neovim. Dominas timers asincronos
              con vim.loop, el patron vim.schedule_wrap para seguridad de hilos, notificaciones
              con vim.notify, e integracion con el statusline. En el siguiente modulo veras
              como testear, empaquetar y publicar tus plugins.
            </p>
            <p class="text-xs text-forge-muted mt-2">
              Puntuacion: {scenarioScore + quizScore} / {scenarioMax + quizMax} puntos
            </p>
          </div>
        </div>
      </div>
    </section>
  {/if}

  <!-- ============================================ -->
  <!-- FUENTES                                       -->
  <!-- ============================================ -->
  <SourcesSection sources={mod.sources} />

  <!-- ============================================ -->
  <!-- NAVEGACION                                    -->
  <!-- ============================================ -->
  <ModuleNav currentModule={7} />

</div>

<!-- ============================================ -->
<!-- COMPONENTES FLOTANTES                         -->
<!-- ============================================ -->
<VocabularyFloat moduleId={7} />

{#if showBadge && earnedBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => (showBadge = false)} />
{/if}
