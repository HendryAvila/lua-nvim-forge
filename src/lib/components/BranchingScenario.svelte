<script lang="ts">
  interface ScenarioChoice {
    text: string;
    nextId: string;
    points: number;
    feedback?: string;
  }

  interface ScenarioOutcome {
    title: string;
    description: string;
    score: number;
    maxScore: number;
    grade: 'excellent' | 'good' | 'needs-work' | 'critical';
    lessons: string[];
  }

  interface ScenarioNode {
    id: string;
    narrative: string;
    choices?: ScenarioChoice[];
    outcome?: ScenarioOutcome;
  }

  interface Props {
    nodes: Record<string, ScenarioNode>;
    startId: string;
    title: string;
    onComplete?: (score: number, maxScore: number) => void;
  }

  let { nodes, startId, title, onComplete }: Props = $props();

  let currentId = $state(startId);
  let totalPoints = $state(0);
  let history = $state<string[]>([]);
  let feedbackText = $state('');
  let showFeedback = $state(false);
  let pendingNextId = $state('');

  const currentNode = $derived(nodes[currentId]);
  const isOutcome = $derived(!!currentNode?.outcome);

  const gradeColors: Record<string, string> = {
    excellent: 'text-forge-success',
    good: 'text-forge-accent',
    'needs-work': 'text-forge-warning',
    critical: 'text-forge-danger'
  };

  const gradeLabels: Record<string, string> = {
    excellent: 'Excelente',
    good: 'Bien',
    'needs-work': 'Necesita Practica',
    critical: 'Critico'
  };

  function makeChoice(choice: ScenarioChoice) {
    totalPoints += choice.points;
    history = [...history, currentId];

    if (choice.feedback) {
      feedbackText = choice.feedback;
      showFeedback = true;
      pendingNextId = choice.nextId;
    } else {
      currentId = choice.nextId;
      if (nodes[choice.nextId]?.outcome) {
        onComplete?.(
          nodes[choice.nextId].outcome!.score + totalPoints,
          nodes[choice.nextId].outcome!.maxScore
        );
      }
    }
  }

  function continuePath() {
    showFeedback = false;
    currentId = pendingNextId;
    if (nodes[pendingNextId]?.outcome) {
      onComplete?.(
        nodes[pendingNextId].outcome!.score + totalPoints,
        nodes[pendingNextId].outcome!.maxScore
      );
    }
  }
</script>

<div class="card fade-in">
  <div class="flex items-center gap-2 mb-4">
    <span class="text-2xl">🎯</span>
    <h3 class="text-lg font-bold">{title}</h3>
  </div>

  {#if showFeedback}
    <div class="p-4 rounded-lg bg-forge-darker border border-forge-accent/30 slide-in">
      <p class="text-sm mb-3">{feedbackText}</p>
      <button onclick={continuePath} class="btn-primary text-xs">Continuar</button>
    </div>
  {:else if isOutcome && currentNode.outcome}
    <div class="text-center">
      <div class="text-4xl mb-3">
        {currentNode.outcome.grade === 'excellent'
          ? '🏆'
          : currentNode.outcome.grade === 'good'
            ? '👍'
            : currentNode.outcome.grade === 'needs-work'
              ? '📚'
              : '⚠️'}
      </div>
      <h4 class="text-xl font-bold mb-1">{currentNode.outcome.title}</h4>
      <p class={`text-sm font-bold mb-3 ${gradeColors[currentNode.outcome.grade]}`}>
        {gradeLabels[currentNode.outcome.grade]}
      </p>
      <p class="text-forge-muted text-sm mb-4">{currentNode.outcome.description}</p>

      <div class="w-full bg-forge-darker rounded-full h-3 mb-4">
        <div
          class="bg-forge-accent h-3 rounded-full transition-all duration-1000"
          style="width: {Math.round(
            ((currentNode.outcome.score + totalPoints) / currentNode.outcome.maxScore) * 100
          )}%"
        ></div>
      </div>
      <p class="text-sm text-forge-muted mb-4">
        {currentNode.outcome.score + totalPoints} / {currentNode.outcome.maxScore} puntos
      </p>

      {#if currentNode.outcome.lessons.length > 0}
        <div class="text-left mt-4 p-4 bg-forge-darker rounded-lg">
          <h5 class="text-sm font-bold text-forge-accent mb-2">Lecciones aprendidas:</h5>
          <ul class="space-y-1">
            {#each currentNode.outcome.lessons as lesson}
              <li class="text-sm text-forge-muted flex gap-2">
                <span class="text-forge-accent">→</span>
                {lesson}
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {:else}
    <div class="prose prose-sm mb-6">
      <p class="text-forge-text leading-relaxed">{currentNode.narrative}</p>
    </div>

    {#if currentNode.choices}
      <div class="space-y-3">
        {#each currentNode.choices as choice}
          <button
            onclick={() => makeChoice(choice)}
            class="w-full text-left p-4 rounded-lg border border-forge-border hover:border-forge-accent/50 bg-forge-darker hover:bg-forge-card transition-all duration-200 cursor-pointer"
          >
            <span class="text-sm">{choice.text}</span>
          </button>
        {/each}
      </div>
    {/if}
  {/if}

  {#if history.length > 0 && !isOutcome}
    <div class="mt-4 flex gap-1">
      {#each history as _, i}
        <div class="w-2 h-2 rounded-full bg-forge-accent"></div>
      {/each}
      <div class="w-2 h-2 rounded-full bg-forge-accent/30"></div>
    </div>
  {/if}
</div>
