<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import Quiz from '$lib/components/Quiz.svelte';
  import CodePlayground from '$lib/components/CodePlayground.svelte';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';

  const mod = modules.find(m => m.id === 3)!;

  let completed = $state(false);
  let showBadge = $state(false);
  let earnedBadge = $state<any>(null);

  $effect(() => {
    courseStore.startModule(3);
  });

  function completeModule(score: number, total: number) {
    courseStore.completeModule(3, score, total);
    completed = true;
    const badge = allBadges.find(b => b.id === 'closure-ninja')!;
    courseStore.unlockBadge(badge);
    earnedBadge = badge;
    showBadge = true;
  }

  const quizQuestions = [
    {
      question: 'Que es un closure en Lua?',
      codeBlock: 'local function crear_saludo(prefijo)\n  return function(nombre)\n    return prefijo .. ", " .. nombre\n  end\nend\n\nlocal hola = crear_saludo("Hola")\nprint(hola("mundo"))  -- "Hola, mundo"',
      options: [
        {
          text: 'Una funcion que captura variables locales externas (upvalues) de su scope',
          correct: true,
          explanation: 'Correcto. Un closure es una funcion que "cierra" sobre las variables de su entorno. Esas variables externas capturadas se llaman upvalues y persisten mientras el closure exista.'
        },
        {
          text: 'Una funcion que se ejecuta inmediatamente al ser definida, conocida como IIFE en otros lenguajes',
          correct: false,
          explanation: 'Eso seria una IIFE (Immediately Invoked Function Expression). Un closure se refiere a la captura de variables externas, no al momento de ejecucion.'
        },
        {
          text: 'Una tabla que contiene funciones',
          correct: false,
          explanation: 'Eso describe un modulo o namespace, no un closure. Un closure es especificamente una funcion que captura variables de su scope exterior.'
        },
        {
          text: 'Una funcion que no retorna ningun valor',
          correct: false,
          explanation: 'Los closures pueden retornar valores sin problema. Lo que los define es la captura de variables externas (upvalues), no su valor de retorno.'
        }
      ],
      source: 'Programming in Lua - Closures',
      sourceUrl: 'https://www.lua.org/pil/6.1.html'
    },
    {
      question: 'Que retorna require() cuando carga un modulo?',
      options: [
        {
          text: 'Siempre retorna true si el modulo se cargo correctamente',
          correct: false,
          explanation: 'No. require() retorna lo que el archivo del modulo retorne explicitamente con return. Si el modulo hace return M (una tabla), eso es lo que obtienes.'
        },
        {
          text: 'El valor que retorna el archivo del modulo (tipicamente una tabla)',
          correct: true,
          explanation: 'Exacto. require() ejecuta el archivo del modulo y retorna lo que ese archivo retorne con return. La convencion es retornar una tabla con las funciones publicas del modulo.'
        },
        {
          text: 'Una referencia al archivo en el sistema de archivos',
          correct: false,
          explanation: 'require() no retorna un file handle. Ejecuta el codigo Lua del archivo y retorna el valor de su sentencia return.'
        },
        {
          text: 'Un string con el path del modulo cargado',
          correct: false,
          explanation: 'El path se usa internamente para encontrar el archivo, pero require() retorna el valor que el modulo retorna explicitamente.'
        }
      ],
      source: 'Programming in Lua - Modules and Packages',
      sourceUrl: 'https://www.lua.org/pil/15.html'
    },
    {
      question: 'Como se define una funcion anonima en Lua?',
      codeBlock: 'local duplicar = function(x) return x * 2 end\nprint(duplicar(5))  -- 10',
      options: [
        {
          text: 'lambda(x) return x * 2 end',
          correct: false,
          explanation: 'Lua no tiene keyword lambda. Las funciones anonimas usan la misma keyword function, solo que sin nombre.'
        },
        {
          text: 'function(x) return x * 2 end',
          correct: true,
          explanation: 'Correcto. En Lua, una funcion anonima se crea con function(...) ... end sin darle nombre. Es un valor que se puede asignar a variables, pasar como argumento o retornar.'
        },
        {
          text: '(x) => x * 2',
          correct: false,
          explanation: 'Esa es la sintaxis de arrow functions de JavaScript. En Lua se usa function(x) return x * 2 end.'
        },
        {
          text: 'def(x) return x * 2 end',
          correct: false,
          explanation: 'def es keyword de Python, no de Lua. En Lua siempre se usa function para definir funciones, tanto nombradas como anonimas.'
        }
      ],
      source: 'Programming in Lua - Functions',
      sourceUrl: 'https://www.lua.org/pil/5.html'
    },
    {
      question: 'Que sucede con los valores extra cuando una funcion retorna mas valores de los que se asignan?',
      options: [
        {
          text: 'Lua lanza un error de runtime',
          correct: false,
          explanation: 'Lua es flexible con los valores de retorno multiples. No lanza errores, simplemente descarta los que sobran.'
        },
        {
          text: 'Se guardan automaticamente en una tabla global',
          correct: false,
          explanation: 'No se guardan en ninguna tabla automatica. Los valores extra simplemente se descartan silenciosamente.'
        },
        {
          text: 'Los valores extra se descartan silenciosamente',
          correct: true,
          explanation: 'Correcto. Si una funcion retorna 3 valores pero solo asignas 2, el tercero se descarta. Igualmente, si pides mas variables de las que retorna, las extras reciben nil.'
        },
        {
          text: 'Se asignan a variables con nombre _unused',
          correct: false,
          explanation: 'Lua no crea variables automaticamente. Los valores extra simplemente desaparecen. Si necesitas menos valores, puedes usar _ como convencion para los que ignoras.'
        }
      ],
      source: 'Programming in Lua - Functions',
      sourceUrl: 'https://www.lua.org/pil/5.1.html'
    },
    {
      question: 'Que es un upvalue en el contexto de Lua?',
      options: [
        {
          text: 'Un valor que se pasa como argumento a una funcion',
          correct: false,
          explanation: 'Los argumentos se reciben como parametros, no como upvalues. Un upvalue es una variable local EXTERNA que el closure captura de su entorno.'
        },
        {
          text: 'Una variable local externa capturada por un closure',
          correct: true,
          explanation: 'Exacto. Cuando una funcion interna referencia una variable local de una funcion externa, esa variable se convierte en un upvalue. El closure mantiene una referencia a ella incluso despues de que el scope original termine.'
        },
        {
          text: 'Una variable global accesible desde cualquier funcion',
          correct: false,
          explanation: 'Las variables globales son accesibles por todas las funciones, no se "capturan". Un upvalue es especificamente una variable LOCAL externa capturada por un closure.'
        },
        {
          text: 'El valor de retorno de una funcion',
          correct: false,
          explanation: 'El valor de retorno es lo que produce la funcion. Un upvalue es una variable del scope externo que la funcion captura y mantiene accesible.'
        }
      ],
      source: 'Programming in Lua - Closures',
      sourceUrl: 'https://www.lua.org/pil/6.1.html'
    },
    {
      question: 'Cual es el patron estandar para crear un modulo en Lua?',
      codeBlock: '-- archivo: mimodulo.lua\nlocal M = {}\n\nfunction M.saludar(nombre)\n  return "Hola " .. nombre\nend\n\nreturn M',
      options: [
        {
          text: 'module("nombre", package.seeall) para registrar funciones globales del modulo',
          correct: false,
          explanation: 'Esa funcion module() existia en Lua 5.1 pero fue deprecada. El patron moderno y recomendado es crear una tabla local, agregarle funciones y retornarla.'
        },
        {
          text: 'export function nombre() end',
          correct: false,
          explanation: 'Lua no tiene keyword export. Esa sintaxis es de JavaScript (ES modules). En Lua se usa el patron de tabla local con return.'
        },
        {
          text: 'local M = {} ... return M',
          correct: true,
          explanation: 'Correcto. El patron estandar es: crear una tabla local M = {}, agregar funciones como M.funcion = function() end, y al final del archivo hacer return M. Asi require() retorna esa tabla.'
        },
        {
          text: 'class NombreModulo ... end',
          correct: false,
          explanation: 'Lua no tiene keyword class nativa. Los modulos se crean usando tablas con el patron local M = {} ... return M.'
        }
      ],
      source: 'Programming in Lua - Modules and Packages',
      sourceUrl: 'https://www.lua.org/pil/15.html'
    },
    {
      question: 'Como se accede a todos los argumentos de una funcion variadica en Lua?',
      options: [
        {
          text: 'Con la variable especial arguments',
          correct: false,
          explanation: 'arguments es de JavaScript, no de Lua. En Lua se usa ... (tres puntos) tanto para declarar como para acceder a los argumentos variadicos.'
        },
        {
          text: 'Con *args como en Python',
          correct: false,
          explanation: 'Esa es la sintaxis de Python. En Lua los argumentos variadicos se capturan con ... y se pueden empaquetar en tabla con {...} o contar con select("#", ...).'
        },
        {
          text: 'Con ... (tres puntos) que representa la lista de argumentos',
          correct: true,
          explanation: 'Correcto. En Lua, ... es la expresion variadica. Se usa en la declaracion function f(...) y dentro del cuerpo para acceder a los argumentos. Se puede usar select("#", ...) para contar y {...} para empaquetarlos en tabla.'
        },
        {
          text: 'Con la funcion getargs()',
          correct: false,
          explanation: 'No existe getargs() en Lua. Los argumentos variadicos se manejan con la expresion ... directamente.'
        }
      ],
      source: 'Programming in Lua - Functions',
      sourceUrl: 'https://www.lua.org/pil/5.2.html'
    }
  ];

  const playgroundExercises = [
    {
      id: 'mod3-funciones',
      title: 'Ejercicio: Funciones basicas',
      instructions: 'Crea una funcion llamada "doble" que reciba un numero y retorne el doble. Luego crea otra llamada "aplicar" que reciba una funcion y un valor, y retorne el resultado de aplicar la funcion al valor. Imprime aplicar(doble, 21).',
      initialCode: '-- Define la funcion doble\n\n\n-- Define la funcion aplicar\n\n\n-- Imprime el resultado\n',
      expectedOutput: '42',
      hints: [
        'local function doble(n) return n * 2 end',
        'aplicar recibe una funcion como primer argumento y la llama con el valor',
        'print(aplicar(doble, 21)) deberia imprimir 42'
      ],
      solution: 'local function doble(n)\n  return n * 2\nend\n\nlocal function aplicar(func, valor)\n  return func(valor)\nend\n\nprint(aplicar(doble, 21))'
    },
    {
      id: 'mod3-closure',
      title: 'Ejercicio: Closure contador',
      instructions: 'Crea una funcion "crear_contador" que retorne una funcion. Cada vez que llames a la funcion retornada, debe incrementar un contador interno y retornar el valor actual. Crea un contador, llamalo 3 veces e imprime cada resultado.',
      initialCode: '-- Crea la funcion crear_contador\n\n\n-- Crea un contador y llamalo 3 veces\n',
      expectedOutput: '1\n2\n3',
      hints: [
        'La funcion externa debe tener una variable local (el upvalue)',
        'La funcion interna (closure) modifica y retorna ese upvalue',
        'Cada llamada incrementa el contador en 1'
      ],
      solution: 'local function crear_contador()\n  local cuenta = 0\n  return function()\n    cuenta = cuenta + 1\n    return cuenta\n  end\nend\n\nlocal contador = crear_contador()\nprint(contador())\nprint(contador())\nprint(contador())'
    },
    {
      id: 'mod3-modulo',
      title: 'Ejercicio: Patron de modulo',
      instructions: 'Crea un modulo "calc" usando el patron local M = {}. Agrega dos funciones al modulo: "sumar(a, b)" y "multiplicar(a, b)". Luego usa el modulo para imprimir calc.sumar(3, 4) y calc.multiplicar(5, 6).',
      initialCode: '-- Crea el modulo calc\n\n\n-- Agrega funciones sumar y multiplicar\n\n\n-- Usa el modulo\n',
      expectedOutput: '7\n30',
      hints: [
        'Empieza con local M = {}',
        'Agrega funciones con M.sumar = function(a, b) ... end o function M.sumar(a, b) ... end',
        'No necesitas hacer return M en este ejercicio, puedes usar M directamente'
      ],
      solution: 'local calc = {}\n\nfunction calc.sumar(a, b)\n  return a + b\nend\n\nfunction calc.multiplicar(a, b)\n  return a * b\nend\n\nprint(calc.sumar(3, 4))\nprint(calc.multiplicar(5, 6))'
    }
  ];
</script>

<svelte:head>
  <title>{mod.title} — La Forja de Lua</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <!-- Header del modulo -->
  <header class="mb-12 fade-in">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-4xl">{mod.icon}</span>
      <div>
        <span class="text-xs text-forge-muted uppercase tracking-wider">Modulo {mod.id}</span>
        <h1 class="text-3xl sm:text-4xl font-black">
          {mod.title}
        </h1>
      </div>
    </div>
    <p class="text-forge-muted text-lg leading-relaxed">{mod.subtitle}: {mod.description}</p>
    <div class="flex items-center gap-4 mt-4 text-sm text-forge-muted">
      <span>🕐 {mod.duration}</span>
      <span>📝 {mod.type}</span>
    </div>

    <!-- Objetivos -->
    <div class="card mt-6">
      <h2 class="text-sm font-bold text-forge-accent uppercase tracking-wider mb-3">Objetivos de aprendizaje</h2>
      <ul class="space-y-2">
        {#each mod.objectives as objective}
          <li class="flex items-start gap-2 text-sm">
            <span class="text-forge-accent mt-0.5">▸</span>
            <span>{objective}</span>
          </li>
        {/each}
      </ul>
    </div>
  </header>

  <!-- ========================================== -->
  <!-- SECCION 1: Funciones como valores           -->
  <!-- ========================================== -->
  <section class="mb-12 fade-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">1.</span> Funciones como valores de primera clase
    </h2>

    <div class="card mb-6">
      <p class="text-forge-muted leading-relaxed mb-4">
        En Lua, las funciones son <span class="code-inline">first-class values</span> (valores de primera clase).
        Esto significa que una funcion es un valor como cualquier otro: se puede guardar en una variable,
        pasar como argumento a otra funcion, o retornar como resultado. No hay diferencia fundamental
        entre un numero, un string y una funcion en cuanto a como Lua los trata.
      </p>
      <p class="text-forge-muted leading-relaxed">
        De hecho, cuando escribes <span class="code-inline">function nombre() end</span>, Lua internamente
        lo traduce a <span class="code-inline">nombre = function() end</span>. La sintaxis con nombre
        es solo azucar sintactica.
      </p>
    </div>

    <h3 class="text-lg font-bold mb-3">Funcion con nombre (syntactic sugar)</h3>
    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- Esto es azucar sintactica...</span>
<span class="text-forge-accent">function</span> saludar(nombre)
  <span class="text-forge-accent">return</span> <span class="text-forge-success">"Hola, "</span> .. nombre
<span class="text-forge-accent">end</span>

<span class="text-forge-muted">-- ...que Lua traduce internamente a esto:</span>
saludar = <span class="text-forge-accent">function</span>(nombre)
  <span class="text-forge-accent">return</span> <span class="text-forge-success">"Hola, "</span> .. nombre
<span class="text-forge-accent">end</span></pre>
    </div>

    <h3 class="text-lg font-bold mb-3">Funciones anonimas</h3>
    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- Una funcion sin nombre, asignada a una variable</span>
<span class="text-forge-accent">local</span> duplicar = <span class="text-forge-accent">function</span>(x)
  <span class="text-forge-accent">return</span> x * 2
<span class="text-forge-accent">end</span>

print(duplicar(5))  <span class="text-forge-muted">-- 10</span></pre>
    </div>

    <h3 class="text-lg font-bold mb-3">Funciones como argumentos</h3>
    <div class="card mb-6">
      <p class="text-forge-muted leading-relaxed mb-4">
        Como las funciones son valores, se pueden pasar como argumentos. Esto es la base de los
        <span class="code-inline">callbacks</span> — un patron que vas a usar constantemente en Neovim.
      </p>
    </div>
    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- Funcion que recibe otra funcion como argumento</span>
<span class="text-forge-accent">local function</span> aplicar(func, valor)
  <span class="text-forge-accent">return</span> func(valor)
<span class="text-forge-accent">end</span>

<span class="text-forge-accent">local</span> resultado = aplicar(
  <span class="text-forge-accent">function</span>(x) <span class="text-forge-accent">return</span> x * 3 <span class="text-forge-accent">end</span>,
  10
)
print(resultado)  <span class="text-forge-muted">-- 30</span>

<span class="text-forge-muted">-- En Neovim esto es MUY comun:</span>
vim.keymap.set(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;leader&gt;h"</span>, <span class="text-forge-accent">function</span>()
  print(<span class="text-forge-success">"Hola desde un callback!"</span>)
<span class="text-forge-accent">end</span>)</pre>
    </div>

    <h3 class="text-lg font-bold mb-3">Funciones que retornan funciones</h3>
    <div class="code-block">
      <pre><span class="text-forge-muted">-- Una funcion puede retornar otra funcion</span>
<span class="text-forge-accent">local function</span> crear_multiplicador(factor)
  <span class="text-forge-accent">return function</span>(x)
    <span class="text-forge-accent">return</span> x * factor
  <span class="text-forge-accent">end</span>
<span class="text-forge-accent">end</span>

<span class="text-forge-accent">local</span> triple = crear_multiplicador(3)
<span class="text-forge-accent">local</span> quintuple = crear_multiplicador(5)

print(triple(10))     <span class="text-forge-muted">-- 30</span>
print(quintuple(10))  <span class="text-forge-muted">-- 50</span></pre>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- SECCION 2: Multiples valores de retorno     -->
  <!-- ========================================== -->
  <section class="mb-12 fade-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">2.</span> Multiples valores de retorno
    </h2>

    <div class="card mb-6">
      <p class="text-forge-muted leading-relaxed mb-4">
        Lua permite que una funcion retorne multiples valores con una sola sentencia
        <span class="code-inline">return</span>. Esto es una caracteristica del lenguaje que no
        existe en muchos otros (como JavaScript o Python que necesitan tuplas/arrays). En Lua
        es nativo y se usa constantemente, especialmente en la API de Neovim.
      </p>
      <p class="text-forge-muted leading-relaxed">
        Si asignas menos variables de las que retorna la funcion, los valores extra se descartan.
        Si asignas mas, las variables extra reciben <span class="code-inline">nil</span>.
      </p>
    </div>

    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- Funcion que retorna multiples valores</span>
<span class="text-forge-accent">local function</span> min_max(t)
  <span class="text-forge-accent">local</span> mi, ma = t[1], t[1]
  <span class="text-forge-accent">for</span> i = 2, #t <span class="text-forge-accent">do</span>
    <span class="text-forge-accent">if</span> t[i] &lt; mi <span class="text-forge-accent">then</span> mi = t[i] <span class="text-forge-accent">end</span>
    <span class="text-forge-accent">if</span> t[i] &gt; ma <span class="text-forge-accent">then</span> ma = t[i] <span class="text-forge-accent">end</span>
  <span class="text-forge-accent">end</span>
  <span class="text-forge-accent">return</span> mi, ma
<span class="text-forge-accent">end</span>

<span class="text-forge-accent">local</span> minimo, maximo = min_max({'{'}3, 1, 7, 2, 9{'}'})
print(minimo, maximo)  <span class="text-forge-muted">-- 1    9</span>

<span class="text-forge-muted">-- Si solo necesitas uno, los demas se descartan</span>
<span class="text-forge-accent">local</span> solo_min = min_max({'{'}3, 1, 7, 2, 9{'}'})
print(solo_min)  <span class="text-forge-muted">-- 1 (el maximo se descarto)</span>

<span class="text-forge-muted">-- Convencion: usar _ para valores que no necesitas</span>
<span class="text-forge-accent">local</span> _, maximo_solo = min_max({'{'}3, 1, 7, 2, 9{'}'})
print(maximo_solo)  <span class="text-forge-muted">-- 9</span></pre>
    </div>

    <div class="card">
      <h3 class="text-sm font-bold text-forge-accent uppercase tracking-wider mb-3">Ejemplo en Neovim</h3>
      <div class="code-block">
        <pre><span class="text-forge-muted">-- La API de Neovim usa multiples retornos</span>
<span class="text-forge-accent">local</span> linea, col = unpack(vim.api.nvim_win_get_cursor(0))
print(<span class="text-forge-success">"Linea: "</span> .. linea .. <span class="text-forge-success">" Columna: "</span> .. col)

<span class="text-forge-muted">-- string.find retorna dos valores: inicio y fin</span>
<span class="text-forge-accent">local</span> inicio, fin = string.find(<span class="text-forge-success">"Hola mundo"</span>, <span class="text-forge-success">"mundo"</span>)
print(inicio, fin)  <span class="text-forge-muted">-- 6    10</span></pre>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- SECCION 3: Funciones variadicas             -->
  <!-- ========================================== -->
  <section class="mb-12 fade-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">3.</span> Funciones variadicas
    </h2>

    <div class="card mb-6">
      <p class="text-forge-muted leading-relaxed mb-4">
        Las funciones variadicas aceptan un numero variable de argumentos usando
        <span class="code-inline">...</span> (tres puntos). Dentro del cuerpo de la funcion,
        <span class="code-inline">...</span> representa la lista de argumentos extra. Se puede
        empaquetar en tabla con <span class="code-inline">{'{...}'}</span> o contar con
        <span class="code-inline">select('#', ...)</span>.
      </p>
    </div>

    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- Funcion que acepta cualquier numero de argumentos</span>
<span class="text-forge-accent">local function</span> sumar_todo(...)
  <span class="text-forge-accent">local</span> total = 0
  <span class="text-forge-accent">local</span> args = {'{ ... }'}
  <span class="text-forge-accent">for</span> i = 1, #args <span class="text-forge-accent">do</span>
    total = total + args[i]
  <span class="text-forge-accent">end</span>
  <span class="text-forge-accent">return</span> total
<span class="text-forge-accent">end</span>

print(sumar_todo(1, 2, 3))       <span class="text-forge-muted">-- 6</span>
print(sumar_todo(10, 20, 30, 40)) <span class="text-forge-muted">-- 100</span></pre>
    </div>

    <h3 class="text-lg font-bold mb-3">select() para argumentos variadicos</h3>
    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- select('#', ...) retorna la CANTIDAD de argumentos</span>
<span class="text-forge-muted">-- select(n, ...) retorna desde el argumento n en adelante</span>
<span class="text-forge-accent">local function</span> info(...)
  print(<span class="text-forge-success">"Cantidad de args:"</span>, select(<span class="text-forge-success">'#'</span>, ...))
  print(<span class="text-forge-success">"Desde el 2do:"</span>, select(2, ...))
<span class="text-forge-accent">end</span>

info(<span class="text-forge-success">"a"</span>, <span class="text-forge-success">"b"</span>, <span class="text-forge-success">"c"</span>)
<span class="text-forge-muted">-- Cantidad de args:  3</span>
<span class="text-forge-muted">-- Desde el 2do:      b    c</span></pre>
    </div>

    <div class="card">
      <h3 class="text-sm font-bold text-forge-accent uppercase tracking-wider mb-3">Uso practico: funcion de logging</h3>
      <div class="code-block">
        <pre><span class="text-forge-muted">-- Patron comun: prefijo + argumentos variables</span>
<span class="text-forge-accent">local function</span> log(nivel, ...)
  <span class="text-forge-accent">local</span> args = {'{ ... }'}
  <span class="text-forge-accent">local</span> partes = {'{'}{'}'}
  <span class="text-forge-accent">for</span> i = 1, #args <span class="text-forge-accent">do</span>
    partes[i] = tostring(args[i])
  <span class="text-forge-accent">end</span>
  print(<span class="text-forge-success">"["</span> .. nivel .. <span class="text-forge-success">"] "</span> .. table.concat(partes, <span class="text-forge-success">" "</span>))
<span class="text-forge-accent">end</span>

log(<span class="text-forge-success">"INFO"</span>, <span class="text-forge-success">"Usuario"</span>, <span class="text-forge-success">"conectado"</span>, 42)
<span class="text-forge-muted">-- [INFO] Usuario conectado 42</span></pre>
      </div>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- SECCION 4: Closures y upvalues              -->
  <!-- ========================================== -->
  <section class="mb-12 fade-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">4.</span> Closures y upvalues
    </h2>

    <div class="card mb-6">
      <p class="text-forge-muted leading-relaxed mb-4">
        Un <span class="code-inline">closure</span> es una funcion que captura y recuerda las
        variables locales del scope donde fue creada. Esas variables capturadas se llaman
        <span class="code-inline">upvalues</span>. El closure mantiene acceso a ellas incluso
        despues de que el scope original haya terminado de ejecutarse.
      </p>
      <p class="text-forge-muted leading-relaxed">
        Los closures son una de las herramientas mas poderosas de Lua. Permiten
        <strong>encapsular estado privado</strong> sin necesitar clases ni objetos complejos.
        Es como tener una mochila invisible que la funcion lleva consigo a todos lados.
      </p>
    </div>

    <h3 class="text-lg font-bold mb-3">Ejemplo clasico: un contador</h3>
    <div class="code-block mb-6">
      <pre><span class="text-forge-accent">local function</span> crear_contador(inicio)
  <span class="text-forge-accent">local</span> cuenta = inicio <span class="text-forge-accent">or</span> 0  <span class="text-forge-muted">-- upvalue!</span>

  <span class="text-forge-accent">return</span> {'{'}
    incrementar = <span class="text-forge-accent">function</span>()
      cuenta = cuenta + 1  <span class="text-forge-muted">-- accede al upvalue</span>
      <span class="text-forge-accent">return</span> cuenta
    <span class="text-forge-accent">end</span>,
    valor = <span class="text-forge-accent">function</span>()
      <span class="text-forge-accent">return</span> cuenta  <span class="text-forge-muted">-- lee el upvalue</span>
    <span class="text-forge-accent">end</span>,
    reset = <span class="text-forge-accent">function</span>()
      cuenta = inicio <span class="text-forge-accent">or</span> 0  <span class="text-forge-muted">-- modifica el upvalue</span>
    <span class="text-forge-accent">end</span>
  {'}'}
<span class="text-forge-accent">end</span>

<span class="text-forge-accent">local</span> c = crear_contador(0)
print(c.incrementar())  <span class="text-forge-muted">-- 1</span>
print(c.incrementar())  <span class="text-forge-muted">-- 2</span>
print(c.incrementar())  <span class="text-forge-muted">-- 3</span>
print(c.valor())        <span class="text-forge-muted">-- 3</span>
c.reset()
print(c.valor())        <span class="text-forge-muted">-- 0</span>

<span class="text-forge-muted">-- Cada llamada a crear_contador crea upvalues INDEPENDIENTES</span>
<span class="text-forge-accent">local</span> c2 = crear_contador(100)
print(c2.incrementar())  <span class="text-forge-muted">-- 101 (no afecta a c)</span>
print(c.valor())         <span class="text-forge-muted">-- 0 (c sigue con su propio estado)</span></pre>
    </div>

    <h3 class="text-lg font-bold mb-3">Closures en la vida real: iteradores</h3>
    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- Un closure que genera un iterador personalizado</span>
<span class="text-forge-accent">local function</span> rango(desde, hasta, paso)
  paso = paso <span class="text-forge-accent">or</span> 1
  <span class="text-forge-accent">local</span> actual = desde - paso  <span class="text-forge-muted">-- upvalue</span>

  <span class="text-forge-accent">return function</span>()  <span class="text-forge-muted">-- closure: captura actual, hasta, paso</span>
    actual = actual + paso
    <span class="text-forge-accent">if</span> actual &lt;= hasta <span class="text-forge-accent">then</span>
      <span class="text-forge-accent">return</span> actual
    <span class="text-forge-accent">end</span>
  <span class="text-forge-accent">end</span>
<span class="text-forge-accent">end</span>

<span class="text-forge-accent">for</span> num <span class="text-forge-accent">in</span> rango(1, 5) <span class="text-forge-accent">do</span>
  print(num)  <span class="text-forge-muted">-- 1, 2, 3, 4, 5</span>
<span class="text-forge-accent">end</span></pre>
    </div>

    <div class="card bg-forge-darker border-forge-border">
      <h3 class="text-sm font-bold text-forge-accent uppercase tracking-wider mb-3">Concepto clave: encapsulacion con closures</h3>
      <p class="text-forge-muted leading-relaxed">
        Fijate que en el ejemplo del contador, la variable <span class="code-inline">cuenta</span>
        es <strong>inaccesible desde afuera</strong>. Solo las funciones del closure pueden leerla
        o modificarla. Esto es encapsulacion — estado privado sin necesitar una clase.
        En Lua, los closures son la herramienta principal para lograr esto.
      </p>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- SECCION 5: Modulos con require()            -->
  <!-- ========================================== -->
  <section class="mb-12 fade-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">5.</span> Modulos con require()
    </h2>

    <div class="card mb-6">
      <p class="text-forge-muted leading-relaxed mb-4">
        El sistema de modulos de Lua es elegante y simple. La funcion
        <span class="code-inline">require("nombre")</span> busca un archivo Lua, lo ejecuta
        una sola vez, y retorna lo que ese archivo retorne. El resultado se cachea: si
        haces <span class="code-inline">require("modulo")</span> dos veces, el archivo solo
        se ejecuta la primera vez.
      </p>
    </div>

    <h3 class="text-lg font-bold mb-3">Como funciona require()</h3>
    <div class="card mb-6">
      <ol class="space-y-2 text-sm text-forge-muted">
        <li class="flex items-start gap-2">
          <span class="text-forge-accent font-bold">1.</span>
          <span>Revisa si el modulo ya esta en cache (<span class="code-inline">package.loaded</span>)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-forge-accent font-bold">2.</span>
          <span>Si no, busca el archivo usando <span class="code-inline">package.path</span> (reemplaza <span class="code-inline">?</span> por el nombre)</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-forge-accent font-bold">3.</span>
          <span>Ejecuta el archivo encontrado</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-forge-accent font-bold">4.</span>
          <span>Guarda el valor retornado en <span class="code-inline">package.loaded</span></span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-forge-accent font-bold">5.</span>
          <span>Retorna ese valor (tipicamente una tabla con funciones)</span>
        </li>
      </ol>
    </div>

    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- package.path define donde buscar modulos</span>
print(package.path)
<span class="text-forge-muted">-- ./?.lua;./?/init.lua;/usr/local/share/lua/5.1/?.lua;...</span>

<span class="text-forge-muted">-- require("utils") buscara:</span>
<span class="text-forge-muted">--   ./utils.lua</span>
<span class="text-forge-muted">--   ./utils/init.lua</span>
<span class="text-forge-muted">--   /usr/local/share/lua/5.1/utils.lua</span>
<span class="text-forge-muted">--   ... y asi en cada ruta de package.path</span></pre>
    </div>

    <h3 class="text-lg font-bold mb-3">El patron estandar de modulo</h3>
    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- archivo: lua/mimodulo.lua</span>
<span class="text-forge-accent">local</span> M = {'{'}{'}'}  <span class="text-forge-muted">-- tabla que sera el modulo</span>

<span class="text-forge-muted">-- Variables privadas del modulo (no se exportan)</span>
<span class="text-forge-accent">local</span> version = <span class="text-forge-success">"1.0.0"</span>
<span class="text-forge-accent">local</span> contador_interno = 0

<span class="text-forge-muted">-- Funciones publicas: se agregan a M</span>
<span class="text-forge-accent">function</span> M.saludar(nombre)
  contador_interno = contador_interno + 1
  <span class="text-forge-accent">return</span> <span class="text-forge-success">"Hola "</span> .. nombre .. <span class="text-forge-success">" (saludo #"</span> .. contador_interno .. <span class="text-forge-success">")"</span>
<span class="text-forge-accent">end</span>

<span class="text-forge-accent">function</span> M.get_version()
  <span class="text-forge-accent">return</span> version
<span class="text-forge-accent">end</span>

<span class="text-forge-muted">-- Funciones privadas: NO se agregan a M</span>
<span class="text-forge-accent">local function</span> helper_interno()
  <span class="text-forge-muted">-- solo accesible dentro del modulo</span>
<span class="text-forge-accent">end</span>

<span class="text-forge-accent">return</span> M  <span class="text-forge-muted">-- IMPORTANTE: retornar la tabla</span></pre>
    </div>

    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- archivo: main.lua (quien consume el modulo)</span>
<span class="text-forge-accent">local</span> mi = require(<span class="text-forge-success">"mimodulo"</span>)

print(mi.saludar(<span class="text-forge-success">"Ana"</span>))         <span class="text-forge-muted">-- Hola Ana (saludo #1)</span>
print(mi.saludar(<span class="text-forge-success">"Carlos"</span>))      <span class="text-forge-muted">-- Hola Carlos (saludo #2)</span>
print(mi.get_version())          <span class="text-forge-muted">-- 1.0.0</span>
<span class="text-forge-muted">-- print(mi.helper_interno())    -- ERROR: nil, no fue exportado</span>
<span class="text-forge-muted">-- print(mi.version)             -- nil, variable local del modulo</span></pre>
    </div>

    <div class="card bg-forge-darker border-forge-border">
      <h3 class="text-sm font-bold text-forge-accent uppercase tracking-wider mb-3">Dato importante: require() cachea</h3>
      <p class="text-forge-muted leading-relaxed">
        Si haces <span class="code-inline">require("mimodulo")</span> en 5 archivos diferentes,
        el archivo <span class="code-inline">mimodulo.lua</span> solo se ejecuta UNA vez. Todos
        reciben la misma referencia a la tabla. Esto significa que el estado del modulo
        (como <span class="code-inline">contador_interno</span>) es compartido entre todos los que lo usan.
      </p>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- SECCION 6: Contexto Neovim                  -->
  <!-- ========================================== -->
  <section class="mb-12 fade-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">6.</span> Modulos en Neovim: el patron de plugins
    </h2>

    <div class="card mb-6">
      <p class="text-forge-muted leading-relaxed mb-4">
        En el ecosistema de Neovim, los plugins siguen exactamente el patron
        <span class="code-inline">local M = {'{}'} ... return M</span>. Cuando ves un plugin como
        <span class="code-inline">telescope.nvim</span> o <span class="code-inline">nvim-cmp</span>,
        internamente estan usando este mismo patron de modulo con closures para manejar estado.
      </p>
    </div>

    <h3 class="text-lg font-bold mb-3">Estructura tipica de un plugin</h3>
    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- lua/mi-plugin/init.lua</span>
<span class="text-forge-accent">local</span> M = {'{'}{'}'}

<span class="text-forge-muted">-- Estado privado del plugin (closure pattern)</span>
<span class="text-forge-accent">local</span> config = {'{'}
  habilitado = <span class="text-forge-accent">true</span>,
  max_items = 50,
{'}'}

<span class="text-forge-muted">-- Funcion setup: el estandar de facto en plugins de Neovim</span>
<span class="text-forge-accent">function</span> M.setup(opts)
  config = vim.tbl_deep_extend(<span class="text-forge-success">"force"</span>, config, opts <span class="text-forge-accent">or</span> {'{}'})
<span class="text-forge-accent">end</span>

<span class="text-forge-accent">function</span> M.toggle()
  config.habilitado = <span class="text-forge-accent">not</span> config.habilitado
  vim.notify(
    <span class="text-forge-success">"Plugin "</span> .. (config.habilitado <span class="text-forge-accent">and</span> <span class="text-forge-success">"activado"</span> <span class="text-forge-accent">or</span> <span class="text-forge-success">"desactivado"</span>),
    vim.log.levels.INFO
  )
<span class="text-forge-accent">end</span>

<span class="text-forge-accent">function</span> M.is_enabled()
  <span class="text-forge-accent">return</span> config.habilitado
<span class="text-forge-accent">end</span>

<span class="text-forge-accent">return</span> M</pre>
    </div>

    <h3 class="text-lg font-bold mb-3">Como se usa desde la configuracion</h3>
    <div class="code-block mb-6">
      <pre><span class="text-forge-muted">-- En tu init.lua o en la config de lazy.nvim</span>
require(<span class="text-forge-success">"mi-plugin"</span>).setup({'{'}
  max_items = 100,
{'}'})

<span class="text-forge-muted">-- Crear un keymap que use el plugin</span>
vim.keymap.set(<span class="text-forge-success">"n"</span>, <span class="text-forge-success">"&lt;leader&gt;tp"</span>, <span class="text-forge-accent">function</span>()
  require(<span class="text-forge-success">"mi-plugin"</span>).toggle()
<span class="text-forge-accent">end</span>, {'{'} desc = <span class="text-forge-success">"Toggle mi plugin"</span> {'}'})</pre>
    </div>

    <div class="card mb-6">
      <h3 class="text-sm font-bold text-forge-accent uppercase tracking-wider mb-3">Callbacks en keymaps: funciones en accion</h3>
      <p class="text-forge-muted leading-relaxed mb-4">
        Fijate como <span class="code-inline">vim.keymap.set</span> recibe una funcion anonima como
        tercer argumento. Eso es un callback — una funcion que Neovim guardara y ejecutara cuando
        presiones la combinacion de teclas. Todas las ideas de este modulo (funciones como valores,
        closures, modulos) se juntan ahi.
      </p>
    </div>

    <div class="card bg-forge-darker border-forge-border">
      <h3 class="text-sm font-bold text-forge-accent uppercase tracking-wider mb-3">Por que require() dentro del callback?</h3>
      <p class="text-forge-muted leading-relaxed">
        Notaras que algunos configs usan <span class="code-inline">require("plugin")</span> dentro
        del callback en vez de guardarlo en una variable arriba. Esto es para <strong>lazy loading</strong>:
        el modulo solo se carga cuando realmente presionas la tecla, no cuando Neovim arranca.
        Como <span class="code-inline">require()</span> cachea, la segunda vez es instantanea.
      </p>
    </div>
  </section>

  <!-- ========================================== -->
  <!-- PLAYGROUNDS                                 -->
  <!-- ========================================== -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-6 flex items-center gap-2">
      <span class="text-forge-accent">⌨️</span> Practica: Escribe codigo Lua
    </h2>
    <p class="text-forge-muted mb-6">
      Pon a prueba tus conocimientos de funciones, closures y modulos escribiendo codigo real.
    </p>

    <div class="space-y-6">
      {#each playgroundExercises as exercise}
        <CodePlayground {exercise} />
      {/each}
    </div>
  </section>

  <!-- ========================================== -->
  <!-- QUIZ                                        -->
  <!-- ========================================== -->
  <section class="mb-12">
    <h2 class="text-2xl font-black mb-6 flex items-center gap-2">
      <span class="text-forge-accent">🧪</span> Quiz: Funciones, Closures y Modulos
    </h2>

    {#if !completed}
      <Quiz questions={quizQuestions} onComplete={completeModule} />
    {:else}
      <div class="card text-center fade-in">
        <div class="text-5xl mb-4">🥷</div>
        <h3 class="text-xl font-bold text-forge-success">Modulo completado!</h3>
        <p class="text-forge-muted mt-2">
          Ya dominas funciones, closures y modulos en Lua. Estos conceptos son fundamentales
          para crear plugins en Neovim.
        </p>
      </div>
    {/if}
  </section>

  <!-- Fuentes -->
  <SourcesSection sources={mod.sources} />

  <!-- Navegacion entre modulos -->
  <ModuleNav currentModule={3} />
</div>

<!-- Vocabulario flotante -->
<VocabularyFloat moduleId={3} />

<!-- Notificacion de badge -->
{#if showBadge && earnedBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => (showBadge = false)} />
{/if}
