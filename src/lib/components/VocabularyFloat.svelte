<script lang="ts">
  import { courseStore } from '$lib/stores/course';
  import { vocabulary } from '$lib/data/vocabulary';

  interface Props {
    moduleId: number;
  }

  let { moduleId }: Props = $props();

  let currentIndex = $state(0);
  let minimized = $state(false);
  let closed = $state(false);

  const moduleTerms = $derived(
    vocabulary
      .filter((v) => v.module === moduleId)
      .filter((v) => {
        let dismissed: string[] = [];
        courseStore.subscribe((s) => (dismissed = s.vocabularyDismissed))();
        return !dismissed.includes(v.term);
      })
  );

  const currentTerm = $derived(moduleTerms[currentIndex] ?? null);
  const hasTerms = $derived(moduleTerms.length > 0);

  function next() {
    if (currentIndex < moduleTerms.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
  }

  function dismiss() {
    if (currentTerm) {
      courseStore.dismissVocabulary(currentTerm.term);
      if (currentIndex >= moduleTerms.length - 1) {
        currentIndex = 0;
      }
    }
  }
</script>

{#if !closed && hasTerms && currentTerm}
  <div
    class="fixed bottom-4 right-4 z-50 transition-all duration-300 {minimized
      ? 'w-12 h-12'
      : 'w-80'}"
  >
    {#if minimized}
      <button
        onclick={() => (minimized = false)}
        class="w-12 h-12 rounded-full bg-forge-accent text-forge-darker flex items-center justify-center text-lg font-bold hover:bg-forge-accent-hover transition-colors cursor-pointer"
      >
        📖
      </button>
    {:else}
      <div class="bg-forge-card border border-forge-border rounded-xl shadow-xl overflow-hidden slide-in">
        <div class="flex items-center justify-between px-4 py-2 bg-forge-darker border-b border-forge-border">
          <span class="text-xs text-forge-muted uppercase tracking-wider">Vocabulario</span>
          <div class="flex gap-1">
            <button
              onclick={() => (minimized = true)}
              class="text-forge-muted hover:text-forge-accent text-xs cursor-pointer px-1"
            >−</button>
            <button
              onclick={() => (closed = true)}
              class="text-forge-muted hover:text-forge-danger text-xs cursor-pointer px-1"
            >✕</button>
          </div>
        </div>
        <div class="p-4">
          <span class="badge bg-forge-accent/20 text-forge-accent mb-2">{currentTerm.category}</span>
          <h4 class="font-bold text-forge-accent mt-2">{currentTerm.term}</h4>
          <p class="text-sm text-forge-muted mt-1 leading-relaxed">{currentTerm.definition}</p>
          <div class="flex gap-2 mt-3">
            <button onclick={next} class="text-xs text-forge-muted hover:text-forge-accent cursor-pointer">
              Siguiente →
            </button>
            <button onclick={dismiss} class="text-xs text-forge-muted hover:text-forge-success cursor-pointer">
              Ya lo se ✓
            </button>
          </div>
          <div class="flex gap-1 mt-2">
            {#each moduleTerms as _, i}
              <div class="w-1.5 h-1.5 rounded-full {i === currentIndex ? 'bg-forge-accent' : 'bg-forge-border'}"></div>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
