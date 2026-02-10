<script lang="ts">
  interface DragItem {
    id: string;
    label: string;
    description?: string;
  }

  interface DropZone {
    id: string;
    label: string;
    correctItemId: string;
    description?: string;
  }

  interface Props {
    items: DragItem[];
    zones: DropZone[];
    onComplete?: (correct: number, total: number) => void;
    instruction?: string;
  }

  let { items, zones, onComplete, instruction = 'Arrastra cada elemento a su zona correcta' }: Props = $props();

  let placements = $state<Record<string, string>>({});
  let availableItems = $state<DragItem[]>([...items]);
  let draggedItemId = $state<string | null>(null);
  let checked = $state(false);
  let results = $state<Record<string, boolean>>({});

  function handleDragStart(itemId: string) {
    draggedItemId = itemId;
  }

  function handleDrop(zoneId: string) {
    if (!draggedItemId) return;

    // Remove from previous zone if placed
    const prevZone = Object.entries(placements).find(([_, itemId]) => itemId === draggedItemId);
    if (prevZone) {
      const newPlacements = { ...placements };
      delete newPlacements[prevZone[0]];
      placements = newPlacements;
    }

    // Remove previous item from this zone
    const prevItem = placements[zoneId];
    if (prevItem) {
      const item = items.find((i) => i.id === prevItem);
      if (item) availableItems = [...availableItems, item];
    }

    // Place item
    placements = { ...placements, [zoneId]: draggedItemId };
    availableItems = availableItems.filter((i) => i.id !== draggedItemId);
    draggedItemId = null;
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function checkAnswers() {
    checked = true;
    let correct = 0;
    const newResults: Record<string, boolean> = {};

    for (const zone of zones) {
      const isCorrect = placements[zone.id] === zone.correctItemId;
      newResults[zone.id] = isCorrect;
      if (isCorrect) correct++;
    }

    results = newResults;
    onComplete?.(correct, zones.length);
  }

  function reset() {
    placements = {};
    availableItems = [...items];
    checked = false;
    results = {};
  }

  const allPlaced = $derived(Object.keys(placements).length === zones.length);
</script>

<div class="card fade-in">
  <p class="text-sm text-forge-muted mb-4">{instruction}</p>

  <!-- Available items pool -->
  {#if availableItems.length > 0}
    <div class="mb-6 p-4 bg-forge-darker rounded-lg border border-dashed border-forge-border">
      <p class="text-xs text-forge-muted mb-2 uppercase tracking-wider">Elementos disponibles</p>
      <div class="flex flex-wrap gap-2">
        {#each availableItems as item}
          <div
            draggable="true"
            ondragstart={() => handleDragStart(item.id)}
            role="button"
            tabindex="0"
            class="px-3 py-2 bg-forge-card border border-forge-accent/30 rounded-lg text-sm cursor-grab active:cursor-grabbing hover:border-forge-accent transition-colors"
          >
            {item.label}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Drop zones -->
  <div class="grid gap-3 sm:grid-cols-2">
    {#each zones as zone}
      <div
        ondrop={() => handleDrop(zone.id)}
        ondragover={handleDragOver}
        role="region"
        aria-label={zone.label}
        class="p-4 rounded-lg border-2 border-dashed min-h-[80px] transition-all duration-200 {checked
          ? results[zone.id]
            ? 'border-forge-success bg-forge-success/5'
            : 'border-forge-danger bg-forge-danger/5'
          : placements[zone.id]
            ? 'border-forge-accent/50 bg-forge-accent/5'
            : 'border-forge-border hover:border-forge-accent/30'}"
      >
        <p class="text-xs text-forge-muted mb-2 font-bold uppercase">{zone.label}</p>
        {#if zone.description}
          <p class="text-xs text-forge-muted/70 mb-2">{zone.description}</p>
        {/if}
        {#if placements[zone.id]}
          {@const item = items.find((i) => i.id === placements[zone.id])}
          {#if item}
            <div
              draggable="true"
              ondragstart={() => handleDragStart(item.id)}
              class="px-3 py-2 bg-forge-card border rounded-lg text-sm cursor-grab {checked
                ? results[zone.id]
                  ? 'border-forge-success text-forge-success'
                  : 'border-forge-danger text-forge-danger'
                : 'border-forge-accent/30'}"
            >
              {item.label}
              {#if checked && !results[zone.id]}
                <span class="text-xs block mt-1 text-forge-muted">
                  Correcto: {items.find((i) => i.id === zone.correctItemId)?.label}
                </span>
              {/if}
            </div>
          {/if}
        {:else}
          <p class="text-xs text-forge-muted/50 italic">Arrastra aqui...</p>
        {/if}
      </div>
    {/each}
  </div>

  <div class="mt-4 flex gap-3">
    {#if !checked}
      <button onclick={checkAnswers} disabled={!allPlaced} class="btn-primary text-xs {!allPlaced ? 'opacity-50 cursor-not-allowed' : ''}">
        Verificar
      </button>
    {:else}
      <button onclick={reset} class="btn-secondary text-xs">Intentar de nuevo</button>
    {/if}
  </div>
</div>
