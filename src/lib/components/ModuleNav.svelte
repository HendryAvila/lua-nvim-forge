<script lang="ts">
  import { base } from '$app/paths';
  import { totalModules } from '$lib/stores/course';

  interface Props {
    currentModule: number;
  }

  let { currentModule }: Props = $props();

  const prevHref = $derived(currentModule > 1 ? `${base}/modulo/${currentModule - 1}` : null);
  const nextHref = $derived(
    currentModule < totalModules
      ? `${base}/modulo/${currentModule + 1}`
      : `${base}/resultados`
  );
  const nextLabel = $derived(currentModule < totalModules ? `Modulo ${currentModule + 1}` : 'Ver resultados');
</script>

<div class="flex items-center justify-between mt-8 pt-4 border-t border-forge-border">
  {#if prevHref}
    <a href={prevHref} class="btn-secondary text-xs">
      ← Modulo {currentModule - 1}
    </a>
  {:else}
    <a href={`${base}/`} class="btn-secondary text-xs">← Inicio</a>
  {/if}

  <span class="text-xs text-forge-muted">{currentModule} / {totalModules}</span>

  <a href={nextHref} class="btn-primary text-xs">
    {nextLabel} →
  </a>
</div>
