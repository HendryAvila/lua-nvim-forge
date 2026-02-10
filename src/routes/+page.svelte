<script lang="ts">
  import { base } from '$app/paths';
  import { courseStore, allBadges } from '$lib/stores/course';
  import { modules } from '$lib/data/modules';

  let store = $state({ currentModule: 1, badges: [] as any[], totalScore: 0, userName: '', modules: {} as any });

  courseStore.subscribe((s) => {
    store = s;
  });

  function isUnlocked(moduleId: number): boolean {
    return moduleId <= store.currentModule;
  }

  function isCompleted(moduleId: number): boolean {
    return store.modules[moduleId]?.completed ?? false;
  }
</script>

<svelte:head>
  <title>La Forja de Lua — Curso Interactivo de Lua para Neovim</title>
</svelte:head>

<div class="max-w-5xl mx-auto px-4 py-12">
  <!-- Hero -->
  <div class="text-center mb-16 fade-in">
    <div class="text-7xl mb-4">🔥</div>
    <h1 class="text-4xl sm:text-5xl font-black mb-4">
      La <span class="text-forge-accent">Forja</span> de Lua
    </h1>
    <p class="text-forge-muted text-lg max-w-2xl mx-auto leading-relaxed">
      Domina Lua desde cero y aprende a configurar Neovim, crear plugins y
      forjar tus propias herramientas. 8 modulos interactivos, 2 plugins reales.
    </p>
    <div class="flex items-center justify-center gap-6 mt-6 text-sm text-forge-muted">
      <span>🕐 ~4 horas</span>
      <span>📦 8 modulos</span>
      <span>🔨 2 plugins</span>
      <span>🏆 {allBadges.length} logros</span>
    </div>
  </div>

  <!-- Stats -->
  {#if store.totalScore > 0}
    <div class="grid grid-cols-3 gap-4 mb-12">
      <div class="card text-center">
        <p class="text-2xl font-black text-forge-accent">{Object.values(store.modules).filter((m: any) => m.completed).length}</p>
        <p class="text-xs text-forge-muted">Modulos completados</p>
      </div>
      <div class="card text-center">
        <p class="text-2xl font-black text-forge-accent">{store.totalScore}</p>
        <p class="text-xs text-forge-muted">Puntos totales</p>
      </div>
      <div class="card text-center">
        <p class="text-2xl font-black text-forge-accent">{store.badges.length}</p>
        <p class="text-xs text-forge-muted">Logros</p>
      </div>
    </div>
  {/if}

  <!-- Module Grid -->
  <div class="grid gap-4 sm:grid-cols-2">
    {#each modules as mod}
      {@const unlocked = isUnlocked(mod.id)}
      {@const completed = isCompleted(mod.id)}
      {#if unlocked}
        <a
          href={`${base}/modulo/${mod.id}`}
          class="card-interactive group relative overflow-hidden {completed ? 'border-forge-success/30' : ''}"
        >
          {#if completed}
            <div class="absolute top-3 right-3 text-forge-success text-lg">✓</div>
          {/if}
          <div class="flex items-start gap-4">
            <span class="text-3xl">{mod.icon}</span>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-forge-muted">Modulo {mod.id}</span>
                <span class="badge bg-forge-accent/10 text-forge-accent">{mod.type}</span>
              </div>
              <h3 class="font-bold group-hover:text-forge-accent transition-colors">{mod.title}</h3>
              <p class="text-sm text-forge-muted mt-1">{mod.subtitle}</p>
              <div class="flex items-center gap-3 mt-2 text-xs text-forge-muted">
                <span>🕐 {mod.duration}</span>
                {#if completed && store.modules[mod.id]}
                  <span class="text-forge-success">
                    {store.modules[mod.id].score}/{store.modules[mod.id].maxScore} pts
                  </span>
                {/if}
              </div>
            </div>
          </div>
        </a>
      {:else}
        <div class="card opacity-40 cursor-not-allowed">
          <div class="flex items-start gap-4">
            <span class="text-3xl grayscale">🔒</span>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-forge-muted">Modulo {mod.id}</span>
              </div>
              <h3 class="font-bold">{mod.title}</h3>
              <p class="text-sm text-forge-muted mt-1">Completa el modulo anterior para desbloquear</p>
            </div>
          </div>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Results link -->
  <div class="text-center mt-12">
    <a href={`${base}/resultados`} class="btn-secondary">
      📊 Ver resultados y certificado
    </a>
  </div>
</div>
