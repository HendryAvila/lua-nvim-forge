<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import Quiz from '$lib/components/Quiz.svelte';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';

  const mod = modules.find(m => m.id === 1)!;

  let completed = $state(false);
  let showBadge = $state(false);
  let earnedBadge = $state<any>(null);

  const quizQuestions = [
    {
      question: 'En Lua, cual es el valor de una variable que NO ha sido declarada ni asignada?',
      options: [
        { text: '0', correct: false, explanation: 'En otros lenguajes como C, las variables no inicializadas pueden ser 0, pero en Lua el valor por defecto es nil.' },
        { text: 'undefined', correct: false, explanation: 'undefined es un concepto de JavaScript. En Lua, el equivalente se llama nil.' },
        { text: 'nil', correct: true, explanation: 'Correcto! En Lua, cualquier variable que no ha sido asignada tiene el valor nil, que representa la ausencia de valor.' },
        { text: 'false', correct: false, explanation: 'false es un valor booleano valido. Las variables no asignadas no son false, son nil.' }
      ],
      source: 'Programming in Lua - Types and Values',
      sourceUrl: 'https://www.lua.org/pil/2.html'
    },
    {
      question: 'Cual es el operador de "no igual" (not equal) en Lua?',
      options: [
        { text: '!=', correct: false, explanation: '!= se usa en lenguajes como C, Java y JavaScript. Lua tiene su propia sintaxis.' },
        { text: '~=', correct: true, explanation: 'Correcto! Lua usa ~= como operador de desigualdad. Es unico de Lua y diferente a la mayoria de lenguajes.' },
        { text: '<>', correct: false, explanation: '<> se usa en lenguajes como Pascal y SQL, no en Lua.' },
        { text: 'not ==', correct: false, explanation: 'Aunque not es un operador logico valido en Lua, not == no es la forma correcta de comparar desigualdad.' }
      ],
      source: 'Lua 5.1 Reference Manual',
      sourceUrl: 'https://www.lua.org/manual/5.1/manual.html#2.5.2'
    },
    {
      question: 'Que hace el operador .. (dos puntos) en Lua?',
      options: [
        { text: 'Es un operador de rango (como en Python)', correct: false, explanation: 'En Lua no existe un operador de rango nativo. .. tiene otro proposito.' },
        { text: 'Concatena (une) dos strings', correct: true, explanation: 'Correcto! El operador .. es el operador de concatenacion de strings en Lua. "Hola" .. " mundo" produce "Hola mundo".' },
        { text: 'Es el operador de spread/desempaquetado', correct: false, explanation: 'El spread/unpack en Lua se hace con la funcion unpack(), no con ..' },
        { text: 'Accede a metodos de un objeto', correct: false, explanation: 'Para acceder a metodos con self implicito se usa : (dos puntos simples), no .. (dos puntos dobles).' }
      ],
      source: 'Programming in Lua - Expressions',
      sourceUrl: 'https://www.lua.org/pil/3.4.html'
    },
    {
      question: 'Los arrays en Lua empiezan desde el indice...',
      options: [
        { text: '0 (como C, JavaScript, Python)', correct: false, explanation: 'A diferencia de la mayoria de lenguajes, Lua NO empieza desde 0. Este es uno de los errores mas comunes al empezar.' },
        { text: '1', correct: true, explanation: 'Correcto! Lua es 1-indexed. Los arrays empiezan en el indice 1. Esto afecta a funciones como ipairs(), el operador # y la libreria table.' },
        { text: 'Depende de como lo declares', correct: false, explanation: 'Aunque tecnicamente puedes usar indices desde 0, las convenciones y funciones estandar de Lua (ipairs, #, table.insert) esperan que empieces en 1.' },
        { text: '-1', correct: false, explanation: 'Los indices negativos no son una convencion en Lua como lo son en Python.' }
      ],
      source: 'Lua 5.1 Reference Manual',
      sourceUrl: 'https://www.lua.org/manual/5.1/manual.html#2.5.5'
    },
    {
      question: 'Que hace la palabra clave local al declarar una variable?',
      options: [
        { text: 'Hace la variable inmutable (constante)', correct: false, explanation: 'local no hace la variable constante. Puedes reasignar una variable local sin problema.' },
        { text: 'Limita el scope de la variable al bloque actual', correct: true, explanation: 'Correcto! local restringe la visibilidad de la variable al bloque donde fue declarada (funcion, if, for, etc). Sin local, la variable es global y accesible desde cualquier parte.' },
        { text: 'Hace la variable privada al archivo', correct: false, explanation: 'Aunque una variable local en el nivel superior del archivo es efectivamente privada al archivo, local se refiere al scope del bloque, no solo al archivo.' },
        { text: 'Es solo una convencion, no tiene efecto real', correct: false, explanation: 'local tiene un efecto muy real: cambia el scope de la variable y ademas las variables locales son mas rapidas que las globales en Lua.' }
      ],
      source: 'Programming in Lua - Types and Values',
      sourceUrl: 'https://www.lua.org/pil/4.2.html'
    },
    {
      question: 'Que resultado da la expresion "10" + 5 en Lua?',
      options: [
        { text: '"105" (concatenacion)', correct: false, explanation: 'Eso ocurriria en JavaScript con +. En Lua, el operador + es siempre aritmetico y Lua intenta convertir strings a numeros.' },
        { text: '15 (coercion automatica)', correct: true, explanation: 'Correcto! Lua aplica coercion automatica: si un string puede interpretarse como numero en una operacion aritmetica, lo convierte. "10" se convierte a 10 y el resultado es 15.' },
        { text: 'Error de tipo', correct: false, explanation: 'Lua no lanza error aqui porque aplica coercion automatica de strings a numeros en operaciones aritmeticas.' },
        { text: 'nil', correct: false, explanation: 'La operacion no produce nil. Lua convierte el string "10" al numero 10 y realiza la suma.' }
      ],
      source: 'Programming in Lua - Expressions',
      sourceUrl: 'https://www.lua.org/pil/3.1.html'
    }
  ];

  function completeModule(score: number, total: number) {
    courseStore.completeModule(1, score, total);
    completed = true;
    const badge = allBadges.find(b => b.id === 'aprendiz-lua')!;
    courseStore.unlockBadge(badge);
    earnedBadge = badge;
    showBadge = true;
  }

  $effect(() => {
    courseStore.startModule(1);
  });
</script>

<svelte:head>
  <title>Modulo 1: Lua desde Cero — La Forja de Lua</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">

  <!-- ============================================ -->
  <!-- HEADER DEL MODULO                            -->
  <!-- ============================================ -->
  <header class="mb-12 fade-in">
    <div class="flex items-center gap-3 mb-4">
      <span class="text-5xl">{mod.icon}</span>
      <div>
        <span class="text-xs text-forge-muted uppercase tracking-wider">Modulo 1</span>
        <h1 class="text-3xl sm:text-4xl font-black">
          {mod.title}: <span class="text-forge-accent">{mod.subtitle}</span>
        </h1>
      </div>
    </div>
    <p class="text-forge-muted leading-relaxed max-w-2xl">
      {mod.description}
    </p>
    <div class="flex items-center gap-4 mt-4 text-sm text-forge-muted">
      <span>🕐 {mod.duration}</span>
      <span class="badge bg-forge-accent/10 text-forge-accent">{mod.type}</span>
    </div>

    <!-- Objetivos -->
    <div class="card mt-6">
      <h2 class="font-bold text-sm uppercase tracking-wider text-forge-accent mb-3">Objetivos de aprendizaje</h2>
      <ul class="space-y-2">
        {#each mod.objectives as obj}
          <li class="flex items-start gap-2 text-sm text-forge-muted">
            <span class="text-forge-accent mt-0.5">▸</span>
            <span>{obj}</span>
          </li>
        {/each}
      </ul>
    </div>
  </header>

  <!-- ============================================ -->
  <!-- SECCION 1: VARIABLES EN LUA                  -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">1.</span> Variables en Lua
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      En Lua, las variables no necesitan declaracion de tipo. Se crean simplemente asignandoles un valor.
      Pero hay una distincion <strong class="text-forge-accent">fundamental</strong> que necesitas entender:
      las variables pueden ser <strong>globales</strong> o <strong>locales</strong>.
    </p>

    <h3 class="text-lg font-bold mb-3">Variables globales vs locales</h3>

    <p class="text-forge-muted leading-relaxed mb-4">
      Por defecto, toda variable en Lua es <strong class="text-forge-danger">global</strong>. Esto significa
      que cualquier parte de tu programa puede acceder y modificar esa variable. Suena conveniente, pero en
      la practica es un desastre: produce bugs dificiles de rastrear y hace tu codigo impredecible.
    </p>

    <div class="code-block">
      <pre>
-- Variable GLOBAL (evitar en lo posible)
nombre = "Neovim"

-- Variable LOCAL (siempre preferir)
local version = 0.10
local activo = true

-- En Neovim, tu init.lua usa locales asi:
local opt = vim.opt
local keymap = vim.keymap.set</pre>
    </div>

    <div class="card mt-4 border-l-4 border-forge-accent">
      <p class="text-sm text-forge-muted">
        <strong class="text-forge-accent">Regla de oro:</strong> Siempre usa <code class="code-inline">local</code> al declarar variables.
        Las variables locales son mas rapidas (Lua las almacena en registros internos) y evitan
        colisiones de nombres entre diferentes partes de tu codigo. En el mundo de Neovim, donde multiples
        plugins comparten el mismo entorno Lua, esto es critico.
      </p>
    </div>

    <h3 class="text-lg font-bold mt-6 mb-3">Asignacion multiple</h3>

    <p class="text-forge-muted leading-relaxed mb-4">
      Lua permite asignar multiples variables en una sola linea. Si hay mas variables que valores,
      las extras reciben <code class="code-inline">nil</code>. Si hay mas valores que variables, los extras se descartan.
    </p>

    <div class="code-block">
      <pre>
-- Asignacion multiple
local x, y, z = 1, 2, 3

-- Mas variables que valores: z sera nil
local a, b, c = 10, 20
print(c) -- nil

-- Intercambio de variables (swap) sin variable temporal
local primero, segundo = "Lua", "Vim"
primero, segundo = segundo, primero
print(primero)  -- "Vim"
print(segundo)  -- "Lua"</pre>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SECCION 2: TIPOS DE DATOS                    -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">2.</span> Tipos de datos en Lua
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      Lua es un lenguaje de <strong>tipado dinamico</strong>: las variables no tienen tipo, los
      <em>valores</em> si. Una variable puede contener un numero ahora y un string despues. Lua
      tiene <strong>8 tipos basicos</strong>, pero los mas importantes para empezar son estos 6:
    </p>

    <!-- nil -->
    <div class="card mb-4">
      <h3 class="font-bold text-forge-accent mb-2">nil</h3>
      <p class="text-sm text-forge-muted mb-3">
        Representa la ausencia de valor. Es el valor por defecto de cualquier variable no asignada.
        En condicionales, <code class="code-inline">nil</code> se evalua como <strong>falso</strong>.
        Asignar nil a una variable es como "borrarla".
      </p>
      <div class="code-block">
        <pre>
local x
print(x)        -- nil
print(type(x))  -- "nil"

-- Borrar una variable global
miVar = 42
miVar = nil     -- ya no existe</pre>
      </div>
    </div>

    <!-- boolean -->
    <div class="card mb-4">
      <h3 class="font-bold text-forge-accent mb-2">boolean</h3>
      <p class="text-sm text-forge-muted mb-3">
        Solo dos valores posibles: <code class="code-inline">true</code> y <code class="code-inline">false</code>.
        Dato crucial: en Lua, solo <code class="code-inline">nil</code> y <code class="code-inline">false</code> son falsos.
        <strong>Todo lo demas es verdadero</strong>, incluyendo 0 y el string vacio "". Esto es diferente a
        JavaScript y Python.
      </p>
      <div class="code-block">
        <pre>
local activo = true
local borrado = false

-- CUIDADO: 0 y "" son VERDADEROS en Lua
if 0 then print("0 es true en Lua!") end       -- se imprime!
if "" then print('"" es true en Lua!') end      -- se imprime!

-- Solo nil y false son falsos
if not nil then print("nil es falso") end       -- se imprime
if not false then print("false es falso") end   -- se imprime</pre>
      </div>
    </div>

    <!-- number -->
    <div class="card mb-4">
      <h3 class="font-bold text-forge-accent mb-2">number</h3>
      <p class="text-sm text-forge-muted mb-3">
        Lua 5.1 (la version que usa Neovim via LuaJIT) tiene un solo tipo numerico: <strong>double-precision floating-point</strong>.
        No hay distincion entre enteros y decimales. Esto significa que puedes representar
        enteros exactos hasta 2^53.
      </p>
      <div class="code-block">
        <pre>
local entero = 42
local decimal = 3.14
local cientifico = 1.5e3    -- 1500.0
local hexadecimal = 0xFF    -- 255

print(type(42))    -- "number"
print(type(3.14))  -- "number" (mismo tipo!)</pre>
      </div>
    </div>

    <!-- string -->
    <div class="card mb-4">
      <h3 class="font-bold text-forge-accent mb-2">string</h3>
      <p class="text-sm text-forge-muted mb-3">
        Los strings son secuencias inmutables de bytes. Se pueden definir con comillas simples,
        comillas dobles, o con dobles corchetes <code class="code-inline">[[ ]]</code> para strings multilinea
        (muy util en Neovim para bloques de texto largos).
      </p>
      <div class="code-block">
        <pre>
local nombre = "Neovim"
local version = 'v0.10'

-- String multilinea (comun en configs de Neovim)
local help_text = [[
Comandos disponibles:
  :LuaRun   - Ejecutar script
  :LuaCheck - Verificar sintaxis
]]

-- Secuencias de escape
local ruta = "C:\\Users\\config"
local salto = "linea1\nlinea2"</pre>
      </div>
    </div>

    <!-- table -->
    <div class="card mb-4">
      <h3 class="font-bold text-forge-accent mb-2">table</h3>
      <p class="text-sm text-forge-muted mb-3">
        La tabla es LA estructura de datos en Lua. Sirve como array, diccionario, objeto, modulo... todo.
        Es tan importante que tiene su propio modulo completo (Modulo 2). Aqui un vistazo rapido:
      </p>
      <div class="code-block">
        <pre>
-- Como array (recuerda: empieza en 1!)
local colores = {'{'}"rojo", "verde", "azul"{'}'}
print(colores[1])  -- "rojo" (NO colores[0])

-- Como diccionario
local config = {'{'}
  theme = "tokyonight",
  font_size = 14,
  line_numbers = true,
{'}'}

print(config.theme)        -- "tokyonight"
print(config["font_size"]) -- 14</pre>
      </div>
    </div>

    <!-- function -->
    <div class="card mb-4">
      <h3 class="font-bold text-forge-accent mb-2">function</h3>
      <p class="text-sm text-forge-muted mb-3">
        En Lua, las funciones son <strong>valores de primera clase</strong>. Se pueden asignar a variables,
        pasar como argumentos y retornar de otras funciones. Esto es la base de los callbacks en Neovim.
      </p>
      <div class="code-block">
        <pre>
-- Funcion con nombre
local function saludar(nombre)
  return "Hola, " .. nombre .. "!"
end

-- Funcion anonima (comun en keymaps de Neovim)
vim.keymap.set("n", "&lt;leader&gt;h", function()
  print("Hola desde Neovim!")
end)

-- Funcion como valor
local mi_funcion = saludar
print(mi_funcion("mundo"))  -- "Hola, mundo!"</pre>
      </div>
    </div>

    <!-- type() -->
    <div class="card border-l-4 border-forge-accent">
      <p class="text-sm text-forge-muted">
        <strong class="text-forge-accent">Tip:</strong> Usa la funcion <code class="code-inline">type()</code> para
        verificar el tipo de cualquier valor. Retorna un string con el nombre del tipo:
        <code class="code-inline">type(42)</code> devuelve <code class="code-inline">"number"</code>,
        <code class="code-inline">type("hola")</code> devuelve <code class="code-inline">"string"</code>,
        <code class="code-inline">type(nil)</code> devuelve <code class="code-inline">"nil"</code>.
      </p>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SECCION 3: OPERADORES                        -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">3.</span> Operadores
    </h2>

    <p class="text-forge-muted leading-relaxed mb-6">
      Lua tiene un conjunto compacto pero completo de operadores. Algunos son iguales a otros
      lenguajes, pero otros son unicos de Lua. Presta atencion a las diferencias.
    </p>

    <!-- Aritmeticos -->
    <h3 class="text-lg font-bold mb-3">Operadores aritmeticos</h3>

    <div class="code-block mb-4">
      <pre>
local a, b = 10, 3

print(a + b)   -- 13    (suma)
print(a - b)   -- 7     (resta)
print(a * b)   -- 30    (multiplicacion)
print(a / b)   -- 3.333 (division, siempre float)
print(a % b)   -- 1     (modulo / resto)
print(a ^ 2)   -- 100   (exponenciacion)

-- Negacion
print(-a)      -- -10

-- No existe ++ ni -- en Lua
-- Tienes que hacer:
local contador = 0
contador = contador + 1</pre>
    </div>

    <!-- Relacionales -->
    <h3 class="text-lg font-bold mb-3">Operadores relacionales</h3>

    <p class="text-forge-muted leading-relaxed mb-4">
      Todos retornan <code class="code-inline">true</code> o <code class="code-inline">false</code>.
      El operador de desigualdad es <code class="code-inline">~=</code>, no <code class="code-inline">!=</code>.
    </p>

    <div class="code-block mb-4">
      <pre>
print(10 == 10)   -- true   (igual)
print(10 ~= 5)    -- true   (NO igual - ojo: ~= no !=)
print(10 &lt; 20)    -- true   (menor que)
print(10 &gt; 20)    -- false  (mayor que)
print(10 &lt;= 10)   -- true   (menor o igual)
print(10 &gt;= 20)   -- false  (mayor o igual)

-- Comparacion de strings (por valor, no por referencia)
print("lua" == "lua")   -- true
print("Lua" == "lua")   -- false (case-sensitive)</pre>
    </div>

    <!-- Logicos -->
    <h3 class="text-lg font-bold mb-3">Operadores logicos</h3>

    <p class="text-forge-muted leading-relaxed mb-4">
      Lua usa las palabras <code class="code-inline">and</code>, <code class="code-inline">or</code> y
      <code class="code-inline">not</code> en lugar de <code class="code-inline">&amp;&amp;</code>,
      <code class="code-inline">||</code> y <code class="code-inline">!</code>. Importante:
      <code class="code-inline">and</code> y <code class="code-inline">or</code> retornan un valor, no
      necesariamente un booleano.
    </p>

    <div class="code-block mb-4">
      <pre>
-- and: retorna el primer valor falso, o el ultimo si todos son verdaderos
print(true and "hola")    -- "hola"
print(false and "hola")   -- false
print(nil and "hola")     -- nil

-- or: retorna el primer valor verdadero, o el ultimo si todos son falsos
print(false or "backup")  -- "backup"
print(nil or "default")   -- "default"
print("a" or "b")         -- "a"

-- not: siempre retorna un booleano
print(not true)    -- false
print(not nil)     -- true
print(not 0)       -- false (recuerda: 0 es verdadero en Lua!)

-- Patron comun en Neovim: valor por defecto
local tema = config.theme or "default"

-- Patron: operador ternario simulado
local modo = es_noche and "dark" or "light"</pre>
    </div>

    <div class="card border-l-4 border-forge-accent">
      <p class="text-sm text-forge-muted">
        <strong class="text-forge-accent">Patron clave:</strong> El idioma
        <code class="code-inline">a and b or c</code> funciona como un operador ternario
        (<code class="code-inline">a ? b : c</code> en otros lenguajes), PERO solo si
        <code class="code-inline">b</code> no es <code class="code-inline">false</code> ni
        <code class="code-inline">nil</code>. Es un patron muy usado en el ecosistema de Neovim.
      </p>
    </div>

    <!-- Concatenacion -->
    <h3 class="text-lg font-bold mt-6 mb-3">Concatenacion de strings</h3>

    <p class="text-forge-muted leading-relaxed mb-4">
      Lua usa el operador <code class="code-inline">..</code> (dos puntos) para concatenar strings.
      No usa <code class="code-inline">+</code> como JavaScript ni <code class="code-inline">.</code> como PHP.
    </p>

    <div class="code-block mb-4">
      <pre>
local nombre = "Neovim"
local version = 10

-- Concatenacion basica
local saludo = "Hola, " .. nombre .. "!"
print(saludo)  -- "Hola, Neovim!"

-- Lua convierte numeros a strings automaticamente con ..
local info = "Version: " .. version
print(info)    -- "Version: 10"

-- Multiples concatenaciones
local ruta = "/home" .. "/" .. "user" .. "/.config/nvim"
print(ruta)    -- "/home/user/.config/nvim"</pre>
    </div>

    <!-- Longitud -->
    <h3 class="text-lg font-bold mt-6 mb-3">Operador de longitud #</h3>

    <div class="code-block">
      <pre>
-- # retorna la longitud de un string o tabla
local texto = "Neovim"
print(#texto)  -- 6

local lista = {'{'}"a", "b", "c", "d"{'}'}
print(#lista)  -- 4</pre>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SECCION 4: STRINGS                           -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">4.</span> Manipulacion de strings
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      Lua incluye una libreria <code class="code-inline">string</code> con funciones utiles.
      Los strings en Lua son inmutables: cada operacion crea un nuevo string.
    </p>

    <div class="code-block mb-4">
      <pre>
local texto = "Hola Neovim"

-- Longitud
print(string.len(texto))     -- 11
print(#texto)                -- 11 (equivalente)

-- Mayusculas y minusculas
print(string.upper(texto))   -- "HOLA NEOVIM"
print(string.lower(texto))   -- "hola neovim"

-- Substrings
print(string.sub(texto, 1, 4))   -- "Hola"
print(string.sub(texto, 6))      -- "Neovim"

-- Buscar (retorna posicion inicio y fin)
local i, j = string.find(texto, "Neovim")
print(i, j)  -- 6  11

-- Reemplazar
print(string.gsub(texto, "Neovim", "Lua"))  -- "Hola Lua"

-- Repetir
print(string.rep("-", 20))  -- "--------------------"</pre>
    </div>

    <h3 class="text-lg font-bold mb-3">string.format</h3>

    <p class="text-forge-muted leading-relaxed mb-4">
      Similar a <code class="code-inline">printf</code> de C. Muy util para construir
      strings con datos dinamicos. Es la forma mas limpia de formatear texto en Lua.
    </p>

    <div class="code-block mb-4">
      <pre>
-- %s = string, %d = entero, %f = float, %q = string con comillas
local nombre = "Plugin"
local version = 2
local peso = 1.5

print(string.format("Nombre: %s", nombre))
-- "Nombre: Plugin"

print(string.format("v%d.0", version))
-- "v2.0"

print(string.format("Peso: %.1f KB", peso))
-- "Peso: 1.5 KB"

-- Uso comun en Neovim: mensajes al usuario
local msg = string.format("[%s] Cargado en %dms", nombre, 45)
print(msg)  -- "[Plugin] Cargado en 45ms"</pre>
    </div>

    <div class="card border-l-4 border-forge-accent">
      <p class="text-sm text-forge-muted">
        <strong class="text-forge-accent">Sintaxis de metodo:</strong> Lua permite llamar funciones de string
        como metodos usando <code class="code-inline">:</code>.
        En vez de <code class="code-inline">string.upper(texto)</code> puedes escribir
        <code class="code-inline">texto:upper()</code>. Ambas formas son equivalentes y las veras
        en codigo de Neovim.
      </p>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SECCION 5: LUA ES 1-INDEXED                  -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">5.</span> Lua es 1-indexed
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      Este es uno de los puntos que mas confunde a quienes vienen de otros lenguajes.
      En Lua, los arrays (tablas con indices numericos) empiezan en el indice <strong class="text-forge-accent">1</strong>,
      no en 0 como C, JavaScript, Python o la mayoria de lenguajes.
    </p>

    <div class="code-block mb-4">
      <pre>
local frutas = {'{'}"manzana", "banana", "cereza"{'}'}

-- El primer elemento esta en el indice 1
print(frutas[1])   -- "manzana"
print(frutas[2])   -- "banana"
print(frutas[3])   -- "cereza"

-- El indice 0 NO es el primer elemento
print(frutas[0])   -- nil (no existe!)

-- Esto afecta a todo el ecosistema:
-- ipairs() empieza en 1
-- El operador # cuenta desde 1
-- table.insert() inserta en posiciones 1-based
-- string.sub() usa indices 1-based

-- Ejemplo practico en Neovim:
-- Las lineas de un buffer empiezan en 0 (API de Neovim)
-- Pero las tablas de Lua empiezan en 1
-- Esto causa confusion, asi que ten cuidado!</pre>
    </div>

    <div class="card bg-forge-darker border border-forge-border">
      <p class="text-sm text-forge-muted">
        <strong class="text-forge-danger">Advertencia:</strong> La API de Neovim usa indices 0-based
        para lineas y columnas de buffers, pero Lua usa 1-based para sus tablas. Esta discrepancia
        es fuente frecuente de bugs "off-by-one". Acostumbrate a verificar si una funcion espera
        indices 0-based (API de Neovim) o 1-based (Lua puro).
      </p>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SECCION 6: COERCION DE TIPOS                 -->
  <!-- ============================================ -->
  <section class="mb-12 slide-in">
    <h2 class="text-2xl font-black mb-4 flex items-center gap-2">
      <span class="text-forge-accent">6.</span> Coercion automatica de tipos
    </h2>

    <p class="text-forge-muted leading-relaxed mb-4">
      Lua convierte automaticamente entre numeros y strings en ciertas operaciones. Esto
      puede ser conveniente, pero tambien puede producir resultados inesperados si no lo entiendes.
    </p>

    <div class="code-block mb-4">
      <pre>
-- Lua convierte strings a numeros en operaciones aritmeticas
print("10" + 5)      -- 15 (string "10" se convierte a numero)
print("3" * "4")     -- 12
print("0xFF" + 0)    -- 255

-- Lua convierte numeros a strings en concatenacion
print(42 .. " es la respuesta")  -- "42 es la respuesta"
print(type(10 .. ""))            -- "string"

-- PERO: no todo string se puede convertir
-- print("hola" + 1)  -- ERROR: attempt to perform arithmetic on a string value

-- Conversion explicita (siempre preferir)
local num = tonumber("42")    -- 42 (tipo number)
local str = tostring(42)      -- "42" (tipo string)

-- tonumber retorna nil si no puede convertir
print(tonumber("abc"))  -- nil</pre>
    </div>

    <div class="card border-l-4 border-forge-accent">
      <p class="text-sm text-forge-muted">
        <strong class="text-forge-accent">Buena practica:</strong> Aunque Lua hace coercion automatica,
        es mejor usar <code class="code-inline">tonumber()</code> y <code class="code-inline">tostring()</code>
        explicitamente. Hace tu codigo mas legible y evita sorpresas.
      </p>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- QUIZ                                          -->
  <!-- ============================================ -->
  <section class="mb-12">
    <h2 class="text-2xl font-black mb-6 flex items-center gap-2">
      <span class="text-forge-accent">🧪</span> Quiz: Fundamentos de Lua
    </h2>
    <p class="text-forge-muted mb-6">
      Pon a prueba lo que aprendiste. Necesitas entender estos conceptos antes de avanzar
      al siguiente modulo.
    </p>

    <Quiz questions={quizQuestions} onComplete={completeModule} />
  </section>

  <!-- ============================================ -->
  <!-- FUENTES                                       -->
  <!-- ============================================ -->
  <SourcesSection sources={mod.sources} />

  <!-- ============================================ -->
  <!-- NAVEGACION                                    -->
  <!-- ============================================ -->
  <ModuleNav currentModule={1} />

</div>

<!-- ============================================ -->
<!-- COMPONENTES FLOTANTES                         -->
<!-- ============================================ -->
<VocabularyFloat moduleId={1} />

{#if showBadge && earnedBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => (showBadge = false)} />
{/if}
