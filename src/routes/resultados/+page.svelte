<script lang="ts">
  import { base } from '$app/paths';
  import { browser } from '$app/environment';
  import { courseStore, allBadges, progressPercent, totalModules } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';

  let store = $state({
    currentModule: 1,
    badges: [] as any[],
    totalScore: 0,
    userName: '',
    modules: {} as any,
    startedAt: ''
  });
  let nameInput = $state('');
  let showReset = $state(false);
  let confettiDone = $state(false);

  courseStore.subscribe((s) => {
    store = s;
    nameInput = s.userName;
  });

  const completedCount = $derived(
    Object.values(store.modules).filter((m: any) => m.completed).length
  );
  const allCompleted = $derived(completedCount === totalModules);
  const maxPossible = $derived(
    Object.values(store.modules).reduce((sum: number, m: any) => sum + (m.maxScore || 0), 0)
  );

  const competencies = [
    { name: 'Fundamentos de Lua', modules: [1, 2, 3], icon: '🌙' },
    { name: 'Configuracion de Neovim', modules: [4, 5], icon: '⚙️' },
    { name: 'Desarrollo de Plugins', modules: [6, 7], icon: '🔨' },
    { name: 'Empaquetado y Publicacion', modules: [8], icon: '📦' }
  ];

  const resources = [
    { name: 'Programming in Lua (libro oficial)', url: 'https://www.lua.org/pil/' },
    { name: 'Neovim Lua Guide', url: 'https://neovim.io/doc/user/lua-guide.html' },
    { name: 'awesome-neovim (plugins)', url: 'https://github.com/rockerBOO/awesome-neovim' },
    { name: 'nvim-lua-guide (comunidad)', url: 'https://github.com/nanotee/nvim-lua-guide' },
    { name: 'kickstart.nvim (config starter)', url: 'https://github.com/nvim-lua/kickstart.nvim' },
    { name: 'Neovim API docs', url: 'https://neovim.io/doc/user/api.html' }
  ];

  function saveName() {
    courseStore.setUserName(nameInput);
  }

  function resetCourse() {
    courseStore.reset();
    showReset = false;
  }

  function getCompetencyScore(modIds: number[]): { score: number; max: number } {
    let score = 0;
    let max = 0;
    for (const id of modIds) {
      if (store.modules[id]) {
        score += store.modules[id].score;
        max += store.modules[id].maxScore;
      }
    }
    return { score, max };
  }

  $effect(() => {
    if (allCompleted && !confettiDone && browser) {
      confettiDone = true;
      import('js-confetti').then(({ default: JSConfetti }) => {
        const confetti = new JSConfetti();
        confetti.addConfetti({ emojis: ['🔥', '🌙', '🔨', '⚡', '🏆'] });
      });
    }
  });
</script>

<svelte:head>
  <title>Resultados — La Forja de Lua</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-12">
  <div class="text-center mb-12 fade-in">
    <span class="text-5xl">{allCompleted ? '🏆' : '📊'}</span>
    <h1 class="text-3xl font-black mt-4">
      {allCompleted ? 'Forja Completada!' : 'Tu Progreso'}
    </h1>
    <p class="text-forge-muted mt-2">
      {completedCount} de {totalModules} modulos completados
    </p>
  </div>

  <!-- Overall Stats -->
  <div class="grid grid-cols-3 gap-4 mb-8">
    <div class="card text-center">
      <p class="text-3xl font-black text-forge-accent">{$progressPercent}%</p>
      <p class="text-xs text-forge-muted mt-1">Progreso</p>
    </div>
    <div class="card text-center">
      <p class="text-3xl font-black text-forge-accent">{store.totalScore}</p>
      <p class="text-xs text-forge-muted mt-1">Puntos{maxPossible > 0 ? ` / ${maxPossible}` : ''}</p>
    </div>
    <div class="card text-center">
      <p class="text-3xl font-black text-forge-accent">{store.badges.length}</p>
      <p class="text-xs text-forge-muted mt-1">Logros</p>
    </div>
  </div>

  <!-- Per-module scores -->
  <div class="card mb-8">
    <h2 class="font-bold text-lg mb-4">Desglose por modulo</h2>
    <div class="space-y-3">
      {#each modules as mod}
        {@const progress = store.modules[mod.id]}
        <div class="flex items-center gap-3">
          <span class="text-xl w-8">{mod.icon}</span>
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm font-medium">{mod.title}</span>
              {#if progress?.completed}
                <span class="text-xs text-forge-success">{progress.score}/{progress.maxScore}</span>
              {:else}
                <span class="text-xs text-forge-muted">Pendiente</span>
              {/if}
            </div>
            <div class="w-full bg-forge-darker rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full transition-all duration-500 {progress?.completed ? 'bg-forge-success' : 'bg-forge-border'}"
                style="width: {progress?.completed ? Math.round((progress.score / progress.maxScore) * 100) : 0}%"
              ></div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Competencies -->
  <div class="card mb-8">
    <h2 class="font-bold text-lg mb-4">Competencias</h2>
    <div class="grid gap-4 sm:grid-cols-2">
      {#each competencies as comp}
        {@const { score, max } = getCompetencyScore(comp.modules)}
        <div class="p-4 bg-forge-darker rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <span>{comp.icon}</span>
            <span class="text-sm font-bold">{comp.name}</span>
          </div>
          <div class="w-full bg-forge-card rounded-full h-2 mb-1">
            <div
              class="bg-forge-accent h-2 rounded-full transition-all duration-500"
              style="width: {max > 0 ? Math.round((score / max) * 100) : 0}%"
            ></div>
          </div>
          <span class="text-xs text-forge-muted">{max > 0 ? `${score}/${max} pts` : 'Sin datos'}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Badges -->
  <div class="card mb-8">
    <h2 class="font-bold text-lg mb-4">Logros</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {#each allBadges as badge}
        {@const earned = store.badges.find((b: any) => b.id === badge.id)}
        <div class="p-3 rounded-lg text-center {earned ? 'bg-forge-accent/10 border border-forge-accent/30' : 'bg-forge-darker opacity-40'}">
          <span class="text-2xl {earned ? '' : 'grayscale'}">{badge.icon}</span>
          <p class="text-xs font-bold mt-1 {earned ? 'text-forge-accent' : 'text-forge-muted'}">{badge.name}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Certificate -->
  {#if allCompleted}
    <div class="card mb-8 glow-accent text-center">
      <h2 class="font-bold text-lg mb-4">Certificado de Completitud</h2>
      {#if !store.userName}
        <p class="text-sm text-forge-muted mb-3">Ingresa tu nombre para generar el certificado:</p>
        <div class="flex gap-2 justify-center max-w-xs mx-auto">
          <input
            bind:value={nameInput}
            placeholder="Tu nombre"
            class="flex-1 bg-forge-darker border border-forge-border rounded-lg px-3 py-2 text-sm focus:border-forge-accent outline-none"
          />
          <button onclick={saveName} class="btn-primary text-xs">Guardar</button>
        </div>
      {:else}
        <div class="p-8 bg-forge-darker rounded-xl border border-forge-accent/20 max-w-md mx-auto">
          <p class="text-xs text-forge-muted uppercase tracking-widest">Certificado</p>
          <p class="text-2xl font-black text-forge-accent mt-2">{store.userName}</p>
          <p class="text-sm text-forge-muted mt-2">
            Ha completado exitosamente todos los modulos de
          </p>
          <p class="font-bold mt-1">La Forja de Lua — Curso de Lua para Neovim</p>
          <div class="flex justify-center gap-4 mt-4 text-xs text-forge-muted">
            <span>{store.totalScore} puntos</span>
            <span>{store.badges.length} logros</span>
            <span>{new Date().toLocaleDateString('es')}</span>
          </div>
          <div class="text-3xl mt-4">🔥</div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Further Learning -->
  <div class="card mb-8">
    <h2 class="font-bold text-lg mb-4">Sigue aprendiendo</h2>
    <div class="grid gap-2">
      {#each resources as res}
        <a
          href={res.url}
          target="_blank"
          rel="noopener"
          class="flex items-center gap-2 p-3 rounded-lg hover:bg-forge-darker transition-colors group"
        >
          <span class="text-forge-accent">→</span>
          <span class="text-sm group-hover:text-forge-accent transition-colors">{res.name}</span>
        </a>
      {/each}
    </div>
  </div>

  <!-- Reset -->
  <div class="text-center">
    {#if !showReset}
      <button onclick={() => (showReset = true)} class="btn-danger text-xs">
        Reiniciar curso
      </button>
    {:else}
      <div class="card max-w-sm mx-auto">
        <p class="text-sm mb-3">Esto borrara TODO tu progreso. Esta seguro?</p>
        <div class="flex gap-2 justify-center">
          <button onclick={resetCourse} class="btn-danger text-xs">Si, reiniciar</button>
          <button onclick={() => (showReset = false)} class="btn-secondary text-xs">Cancelar</button>
        </div>
      </div>
    {/if}
  </div>

  <div class="text-center mt-8">
    <a href={`${base}/`} class="btn-secondary text-xs">← Volver al inicio</a>
  </div>
</div>
