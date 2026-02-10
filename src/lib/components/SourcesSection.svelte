<script lang="ts">
  import type { Source } from '$lib/data/modules';

  interface Props {
    sources: Source[];
  }

  let { sources }: Props = $props();
  let open = $state(false);
</script>

<div class="mt-8 border-t border-forge-border pt-4">
  <button
    onclick={() => (open = !open)}
    class="flex items-center gap-2 text-sm text-forge-muted hover:text-forge-accent transition-colors cursor-pointer"
  >
    <span class="text-xs">{open ? '▼' : '▶'}</span>
    <span class="uppercase tracking-wider font-bold text-xs">Fuentes y referencias ({sources.length})</span>
  </button>

  {#if open}
    <ul class="mt-3 space-y-2 slide-in">
      {#each sources as source, i}
        <li class="flex items-start gap-2">
          <span class="text-forge-accent text-xs mt-0.5">{i + 1}.</span>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-forge-muted hover:text-forge-accent transition-colors hover:underline"
          >
            {source.name}
          </a>
        </li>
      {/each}
    </ul>
  {/if}
</div>
