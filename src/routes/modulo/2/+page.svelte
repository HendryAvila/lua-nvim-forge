<script lang="ts">
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';
  import DragDrop from '$lib/components/DragDrop.svelte';
  import ModuleNav from '$lib/components/ModuleNav.svelte';
  import SourcesSection from '$lib/components/SourcesSection.svelte';
  import VocabularyFloat from '$lib/components/VocabularyFloat.svelte';
  import BadgeNotification from '$lib/components/BadgeNotification.svelte';

  const mod = modules.find(m => m.id === 2)!;

  let completed = $state(false);
  let showBadge = $state(false);
  let earnedBadge = $state<any>(null);

  const dragItems = [
    { id: 'pairs', label: 'pairs()' },
    { id: 'ipairs', label: 'ipairs()' },
    { id: 'insert', label: 'table.insert()' },
    { id: 'hash', label: '#tabla' },
    { id: 'dot', label: 'tabla.clave' },
    { id: 'bracket', label: 'tabla["clave"]' }
  ];

  const dropZones = [
    { id: 'z1', label: 'Itera TODAS las claves', correctItemId: 'pairs' },
    { id: 'z2', label: 'Itera solo indices numericos en orden', correctItemId: 'ipairs' },
    { id: 'z3', label: 'Agrega elemento al final del array', correctItemId: 'insert' },
    { id: 'z4', label: 'Obtiene la longitud del array', correctItemId: 'hash' },
    { id: 'z5', label: 'Acceso con sintaxis de punto', correctItemId: 'dot' },
    { id: 'z6', label: 'Acceso con clave dinamica', correctItemId: 'bracket' }
  ];

  function completeModule(correct: number, total: number) {
    courseStore.completeModule(2, correct, total);
    completed = true;
    const badge = allBadges.find(b => b.id === 'maestro-tablas')!;
    courseStore.unlockBadge(badge);
    earnedBadge = badge;
    showBadge = true;
  }

  $effect(() => {
    courseStore.startModule(2);
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
        <p class="text-xs text-forge-muted uppercase tracking-wider font-bold">Modulo 2</p>
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

  <!-- ===================== SECCION 1: TABLAS COMO ARRAYS ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">1. Tablas como Arrays</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        En Lua, las tablas son <strong>LA</strong> estructura de datos. No existen arrays, listas,
        diccionarios ni objetos como tipos separados. Todo es una <strong>tabla</strong>. Una unica
        estructura que se adapta a lo que necesites.
      </p>

      <div class="card bg-forge-darker border-forge-accent/30">
        <p class="text-xs text-forge-warning font-bold uppercase tracking-wider mb-2">Atencion</p>
        <p>
          En Lua los arrays empiezan en <strong class="text-forge-accent">indice 1</strong>, no en 0.
          Si vienes de Python, JavaScript o C, esto te va a confundir al principio. Es un detalle
          fundamental que debes internalizar.
        </p>
      </div>

      <p>Para crear un array, usas llaves <code class="code-inline">{'{}'}</code> con valores separados por comas:</p>

      <div class="code-block"><pre>-- Crear un array (tabla con indices numericos)
local frutas = {'{'}  "manzana", "banana", "naranja" {'}'}

-- Los indices empiezan en 1, NO en 0
print(frutas[1])  -- "manzana"
print(frutas[2])  -- "banana"
print(frutas[3])  -- "naranja"

-- La longitud se obtiene con #
print(#frutas)    -- 3</pre></div>

      <p>
        Para agregar y quitar elementos, usas las funciones de la libreria
        <code class="code-inline">table</code>:
      </p>

      <div class="code-block"><pre>local colores = {'{'}  "rojo", "verde", "azul" {'}'}

-- Agregar al final
table.insert(colores, "amarillo")
-- colores = {'{'} "rojo", "verde", "azul", "amarillo" {'}'}

-- Agregar en posicion especifica
table.insert(colores, 2, "blanco")
-- colores = {'{'} "rojo", "blanco", "verde", "azul", "amarillo" {'}'}

-- Eliminar por posicion (devuelve el elemento eliminado)
local eliminado = table.remove(colores, 3)
print(eliminado)  -- "verde"</pre></div>
    </div>
  </section>

  <!-- ===================== SECCION 2: TABLAS COMO DICCIONARIOS ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">2. Tablas como Diccionarios</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Cuando usas <strong>claves string</strong> en vez de indices numericos, tu tabla funciona como
        un diccionario (o mapa, o hash table). Puedes acceder a los valores de dos formas:
        <strong>sintaxis de punto</strong> y <strong>sintaxis de corchetes</strong>.
      </p>

      <div class="code-block"><pre>-- Crear una tabla como diccionario
local persona = {'{'}
  nombre = "Carlos",
  edad = 30,
  ciudad = "Maracaibo"
{'}'}

-- Acceso con sintaxis de punto (clave fija)
print(persona.nombre)     -- "Carlos"
print(persona.edad)       -- 30

-- Acceso con sintaxis de corchetes (clave dinamica)
print(persona["ciudad"])  -- "Maracaibo"

-- Con corchetes puedes usar variables como clave
local campo = "nombre"
print(persona[campo])     -- "Carlos"</pre></div>

      <div class="card bg-forge-darker border-forge-accent/30">
        <p class="text-xs text-forge-accent font-bold uppercase tracking-wider mb-2">Punto vs Corchetes</p>
        <p>
          <code class="code-inline">tabla.clave</code> es azucar sintactico para
          <code class="code-inline">tabla["clave"]</code>. Son equivalentes cuando la clave es un
          string literal valido. Pero si la clave tiene espacios, caracteres especiales, o viene de
          una variable, <strong>necesitas corchetes</strong>.
        </p>
      </div>

      <div class="code-block"><pre>-- Agregar nuevas claves
persona.profesion = "programador"
persona["lenguaje favorito"] = "Lua"  -- necesita corchetes por el espacio

-- Eliminar una clave
persona.edad = nil  -- asignar nil elimina la clave</pre></div>
    </div>
  </section>

  <!-- ===================== SECCION 3: TABLAS ANIDADAS ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">3. Tablas Anidadas</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Las tablas pueden contener otras tablas. Esto te permite crear estructuras complejas:
        listas de objetos, configuraciones profundas, arboles, grafos... lo que necesites.
      </p>

      <div class="code-block"><pre>-- Tabla de tablas: lista de usuarios
local usuarios = {'{'}
  {'{'} nombre = "Ana",    nivel = 5,  activo = true  {'}'},
  {'{'} nombre = "Pedro",  nivel = 12, activo = false {'}'},
  {'{'} nombre = "Maria",  nivel = 8,  activo = true  {'}'},
{'}'}

-- Acceder a datos anidados
print(usuarios[1].nombre)    -- "Ana"
print(usuarios[2].nivel)     -- 12
print(usuarios[3]["activo"]) -- true

-- Configuracion anidada estilo Neovim
local config = {'{'}
  editor = {'{'}
    tabsize = 4,
    expandtab = true,
    theme = "tokyonight"
  {'}'},
  plugins = {'{'} "telescope", "treesitter", "lsp" {'}'}
{'}'}

print(config.editor.tabsize)  -- 4
print(config.plugins[2])      -- "treesitter"</pre></div>
    </div>
  </section>

  <!-- ===================== SECCION 4: ITERACION ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">4. Iteracion: pairs() vs ipairs()</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Lua ofrece dos funciones para recorrer tablas, y es <strong>critico</strong> entender la
        diferencia:
      </p>

      <div class="grid sm:grid-cols-2 gap-4">
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">ipairs(tabla)</p>
          <ul class="space-y-1 text-xs text-forge-muted">
            <li>&#10148; Solo indices <strong>numericos</strong></li>
            <li>&#10148; En orden: 1, 2, 3...</li>
            <li>&#10148; Se detiene al primer <code class="code-inline">nil</code></li>
            <li>&#10148; Ideal para <strong>arrays</strong></li>
          </ul>
        </div>
        <div class="card bg-forge-darker">
          <p class="text-forge-accent font-bold text-sm mb-2">pairs(tabla)</p>
          <ul class="space-y-1 text-xs text-forge-muted">
            <li>&#10148; <strong>Todas</strong> las claves (string y numericas)</li>
            <li>&#10148; Orden <strong>no garantizado</strong></li>
            <li>&#10148; Recorre todo</li>
            <li>&#10148; Ideal para <strong>diccionarios</strong></li>
          </ul>
        </div>
      </div>

      <div class="code-block"><pre>local inventario = {'{'}
  "espada",         -- [1]
  "escudo",         -- [2]
  "pocion",         -- [3]
  tipo = "guerrero",
  nivel = 10
{'}'}

-- ipairs: solo la parte array (indices numericos en orden)
for i, item in ipairs(inventario) do
  print(i, item)
end
-- 1  espada
-- 2  escudo
-- 3  pocion

-- pairs: TODO, pero en orden no garantizado
for clave, valor in pairs(inventario) do
  print(clave, valor)
end
-- 1        espada
-- 2        escudo
-- 3        pocion
-- tipo     guerrero
-- nivel    10
-- (el orden de tipo/nivel puede variar)</pre></div>

      <div class="card bg-forge-darker border-forge-warning/30">
        <p class="text-xs text-forge-warning font-bold uppercase tracking-wider mb-2">Regla practica</p>
        <p>
          Si tu tabla es un array puro (solo indices numericos consecutivos), usa
          <code class="code-inline">ipairs()</code>. Si tiene claves string o es mixta, usa
          <code class="code-inline">pairs()</code>.
        </p>
      </div>
    </div>
  </section>

  <!-- ===================== SECCION 5: FUNCIONES UTILES ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">5. Funciones Utiles de la Libreria table</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        Lua incluye una libreria <code class="code-inline">table</code> con funciones esenciales
        para trabajar con arrays:
      </p>

      <div class="overflow-x-auto">
        <table class="w-full text-sm border-collapse">
          <thead>
            <tr class="border-b border-forge-border">
              <th class="text-left py-2 px-3 text-forge-accent font-bold text-xs uppercase">Funcion</th>
              <th class="text-left py-2 px-3 text-forge-accent font-bold text-xs uppercase">Descripcion</th>
            </tr>
          </thead>
          <tbody class="text-forge-muted">
            <tr class="border-b border-forge-border/50">
              <td class="py-2 px-3"><code class="code-inline">table.insert(t, valor)</code></td>
              <td class="py-2 px-3">Agrega <em>valor</em> al final de <em>t</em></td>
            </tr>
            <tr class="border-b border-forge-border/50">
              <td class="py-2 px-3"><code class="code-inline">table.insert(t, pos, valor)</code></td>
              <td class="py-2 px-3">Inserta <em>valor</em> en la posicion <em>pos</em></td>
            </tr>
            <tr class="border-b border-forge-border/50">
              <td class="py-2 px-3"><code class="code-inline">table.remove(t, pos)</code></td>
              <td class="py-2 px-3">Elimina y devuelve el elemento en <em>pos</em></td>
            </tr>
            <tr class="border-b border-forge-border/50">
              <td class="py-2 px-3"><code class="code-inline">table.sort(t)</code></td>
              <td class="py-2 px-3">Ordena <em>t</em> in-place (modifica la tabla original)</td>
            </tr>
            <tr class="border-b border-forge-border/50">
              <td class="py-2 px-3"><code class="code-inline">table.sort(t, fn)</code></td>
              <td class="py-2 px-3">Ordena con funcion de comparacion personalizada</td>
            </tr>
            <tr class="border-b border-forge-border/50">
              <td class="py-2 px-3"><code class="code-inline">table.concat(t, sep)</code></td>
              <td class="py-2 px-3">Une los elementos en un string, separados por <em>sep</em></td>
            </tr>
            <tr>
              <td class="py-2 px-3"><code class="code-inline">#t</code></td>
              <td class="py-2 px-3">Longitud del array (ultimo indice numerico consecutivo)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="code-block"><pre>local nombres = {'{'} "Carlos", "Ana", "Pedro", "Maria" {'}'}

-- Ordenar alfabeticamente
table.sort(nombres)
-- nombres = {'{'} "Ana", "Carlos", "Maria", "Pedro" {'}'}

-- Ordenar de forma inversa
table.sort(nombres, function(a, b) return a > b end)
-- nombres = {'{'} "Pedro", "Maria", "Carlos", "Ana" {'}'}

-- Unir en un string
local texto = table.concat(nombres, ", ")
print(texto)  -- "Pedro, Maria, Carlos, Ana"

-- Longitud
print(#nombres)  -- 4</pre></div>
    </div>
  </section>

  <!-- ===================== SECCION 6: CONTEXTO NEOVIM ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">6. Tablas en Neovim</h2>

    <div class="space-y-4 text-sm leading-relaxed">
      <p>
        En Neovim, las tablas estan en <strong>todas partes</strong>. La configuracion, los keymaps,
        los plugins, la API... todo usa tablas. Veamos algunos ejemplos reales:
      </p>

      <div class="code-block"><pre>-- vim.opt usa tablas internamente
-- Esto configura opciones del editor
vim.opt.number = true
vim.opt.tabstop = 4
vim.opt.shiftwidth = 4

-- Algunas opciones SON tablas/listas
vim.opt.completeopt = {'{'} "menu", "menuone", "noselect" {'}'}
vim.opt.clipboard:append("unnamedplus")

-- vim.keymap.set recibe tablas como opciones
vim.keymap.set("n", "&lt;leader&gt;w", ":w&lt;CR&gt;", {'{'}
  desc = "Guardar archivo",
  silent = true,
  noremap = true,
{'}'})</pre></div>

      <div class="code-block"><pre>-- Configuracion de plugins con tablas anidadas
-- Ejemplo: configurar telescope.nvim
require("telescope").setup({'{'}
  defaults = {'{'}
    layout_strategy = "horizontal",
    sorting_strategy = "ascending",
    mappings = {'{'}
      i = {'{'}
        ["&lt;C-j&gt;"] = "move_selection_next",
        ["&lt;C-k&gt;"] = "move_selection_previous",
      {'}'},
    {'}'},
  {'}'},
{'}'})</pre></div>

      <div class="card bg-forge-darker border-forge-success/30">
        <p class="text-xs text-forge-success font-bold uppercase tracking-wider mb-2">Conexion con Neovim</p>
        <p>
          Cuando configuras Neovim con Lua, practicamente todo lo que escribes son tablas.
          Dominar tablas no es opcional -- es el <strong>requisito minimo</strong> para poder
          configurar y extender tu editor.
        </p>
      </div>
    </div>
  </section>

  <!-- ===================== EJERCICIO DRAG & DROP ===================== -->
  <section class="mb-10 fade-in">
    <h2 class="text-2xl font-bold text-forge-accent mb-4">Ejercicio: Conceptos de Tablas</h2>
    <p class="text-sm text-forge-muted mb-4">
      Demuestra lo que aprendiste. Arrastra cada concepto de la libreria de tablas a la descripcion
      que le corresponde.
    </p>

    <DragDrop
      items={dragItems}
      zones={dropZones}
      instruction="Arrastra cada concepto de tabla a su descripcion correcta"
      onComplete={completeModule}
    />

    {#if completed}
      <div class="card mt-6 border-forge-success/50 bg-forge-success/5 slide-in">
        <div class="flex items-center gap-3">
          <span class="text-3xl">&#9878;</span>
          <div>
            <p class="font-bold text-forge-success">Modulo completado!</p>
            <p class="text-sm text-forge-muted mt-1">
              Has desbloqueado el conocimiento de las tablas. Ya puedes manejar arrays, diccionarios,
              iteracion y la libreria table. En el siguiente modulo veremos funciones, closures y
              modulos.
            </p>
          </div>
        </div>
      </div>
    {/if}
  </section>

  <!-- ===================== SOURCES ===================== -->
  <SourcesSection sources={mod.sources} />

  <!-- ===================== NAVIGATION ===================== -->
  <ModuleNav currentModule={2} />

</div>

<!-- ===================== FLOATING VOCABULARY ===================== -->
<VocabularyFloat moduleId={2} />

<!-- ===================== BADGE NOTIFICATION ===================== -->
{#if showBadge && earnedBadge}
  <BadgeNotification badge={earnedBadge} onClose={() => (showBadge = false)} />
{/if}
