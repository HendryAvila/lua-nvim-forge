<script lang="ts">
  import '../app.css';
  import { base } from '$app/paths';
  import ProgressBar from '$lib/components/ProgressBar.svelte';

  let { children } = $props();
</script>

<div class="min-h-screen flex flex-col">
  <header class="border-b border-forge-border bg-forge-dark/80 backdrop-blur-sm sticky top-0 z-40">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href={`${base}/`} class="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span class="text-2xl">🔥</span>
        <span class="font-black text-sm uppercase tracking-wider text-forge-accent">La Forja de Lua</span>
      </a>
      <div class="w-48 hidden sm:block">
        <ProgressBar />
      </div>
    </div>
  </header>

  <main class="flex-1">
    {@render children()}
  </main>

  <footer class="border-t border-forge-border py-6 mt-12">
    <div class="max-w-5xl mx-auto px-4 text-center">
      <p class="text-xs text-forge-muted">
        🔥 La Forja de Lua — Curso interactivo de Lua para Neovim
      </p>
    </div>
  </footer>
</div>
