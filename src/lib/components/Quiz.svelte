<script lang="ts">
  interface QuizOption {
    text: string;
    correct: boolean;
    explanation: string;
  }

  interface QuizQuestion {
    question: string;
    options: QuizOption[];
    source?: string;
    sourceUrl?: string;
    codeBlock?: string;
    codeLanguage?: string;
  }

  interface Props {
    questions: QuizQuestion[];
    onComplete?: (score: number, total: number) => void;
  }

  let { questions, onComplete }: Props = $props();

  let currentIndex = $state(0);
  let selectedOption = $state<number | null>(null);
  let showExplanation = $state(false);
  let score = $state(0);
  let finished = $state(false);
  let answers = $state<boolean[]>([]);

  const currentQuestion = $derived(questions[currentIndex]);
  const progressPercent = $derived(Math.round((currentIndex / questions.length) * 100));

  function selectOption(index: number) {
    if (showExplanation) return;
    selectedOption = index;
    showExplanation = true;
    const isCorrect = currentQuestion.options[index].correct;
    if (isCorrect) score++;
    answers = [...answers, isCorrect];
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      currentIndex++;
      selectedOption = null;
      showExplanation = false;
    } else {
      finished = true;
      onComplete?.(score, questions.length);
    }
  }
</script>

{#if !finished}
  <div class="card fade-in">
    <div class="flex items-center justify-between mb-4">
      <span class="text-forge-muted text-sm">
        Pregunta {currentIndex + 1} de {questions.length}
      </span>
      <span class="text-forge-accent font-bold text-sm">{score} pts</span>
    </div>

    <div class="w-full bg-forge-darker rounded-full h-2 mb-6">
      <div
        class="bg-forge-accent h-2 rounded-full transition-all duration-500"
        style="width: {progressPercent}%"
      ></div>
    </div>

    <h3 class="text-lg font-bold mb-4">{currentQuestion.question}</h3>

    {#if currentQuestion.codeBlock}
      <div class="mb-4 rounded-lg overflow-hidden border border-forge-border">
        <div class="bg-forge-darker px-3 py-1.5 border-b border-forge-border">
          <span class="text-xs text-forge-muted font-mono">{currentQuestion.codeLanguage || 'lua'}</span>
        </div>
        <pre class="bg-[#1a1a2e] p-4 text-sm font-mono leading-relaxed overflow-x-auto text-forge-text">{currentQuestion.codeBlock}</pre>
      </div>
    {/if}

    <div class="space-y-3">
      {#each currentQuestion.options as option, i}
        <button
          onclick={() => selectOption(i)}
          disabled={showExplanation}
          class="w-full text-left p-4 rounded-lg border transition-all duration-200 {
            showExplanation
              ? option.correct
                ? 'border-forge-success bg-forge-success/10 text-forge-success'
                : selectedOption === i
                  ? 'border-forge-danger bg-forge-danger/10 text-forge-danger'
                  : 'border-forge-border text-forge-muted opacity-50'
              : selectedOption === i
                ? 'border-forge-accent bg-forge-accent/10'
                : 'border-forge-border hover:border-forge-accent/50 cursor-pointer'
          }"
        >
          <span class="font-mono text-sm mr-2 opacity-60">{String.fromCharCode(65 + i)}.</span>
          {option.text}
        </button>
      {/each}
    </div>

    {#if showExplanation}
      <div class="mt-4 p-4 rounded-lg bg-forge-darker border border-forge-border slide-in">
        <p class="text-sm">
          {#if currentQuestion.options[selectedOption!].correct}
            <span class="text-forge-success font-bold">Correcto!</span>
          {:else}
            <span class="text-forge-danger font-bold">Incorrecto.</span>
          {/if}
          {' '}{currentQuestion.options[selectedOption!].explanation}
        </p>
        {#if currentQuestion.source}
          <p class="text-xs text-forge-muted mt-2">
            Fuente: <a
              href={currentQuestion.sourceUrl}
              target="_blank"
              rel="noopener"
              class="text-forge-accent hover:underline">{currentQuestion.source}</a
            >
          </p>
        {/if}
        <button onclick={nextQuestion} class="btn-primary mt-4 text-xs">
          {currentIndex < questions.length - 1 ? 'Siguiente' : 'Ver resultados'}
        </button>
      </div>
    {/if}
  </div>
{:else}
  <div class="card fade-in text-center">
    <div class="text-5xl mb-4">{score >= questions.length * 0.7 ? '🔥' : '💪'}</div>
    <h3 class="text-2xl font-black mb-2">
      {score} / {questions.length}
    </h3>
    <p class="text-forge-muted mb-4">
      {#if score === questions.length}
        Perfecto! Dominas este tema.
      {:else if score >= questions.length * 0.7}
        Muy bien! Tienes una base solida.
      {:else}
        Hay espacio para mejorar. Revisa la teoria.
      {/if}
    </p>
    <div class="w-full bg-forge-darker rounded-full h-3 mb-4">
      <div
        class="h-3 rounded-full transition-all duration-1000 {score >= questions.length * 0.7
          ? 'bg-forge-success'
          : 'bg-forge-warning'}"
        style="width: {Math.round((score / questions.length) * 100)}%"
      ></div>
    </div>
    <div class="flex gap-2 justify-center flex-wrap">
      {#each answers as correct, i}
        <span
          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold {correct
            ? 'bg-forge-success/20 text-forge-success'
            : 'bg-forge-danger/20 text-forge-danger'}"
        >
          {i + 1}
        </span>
      {/each}
    </div>
  </div>
{/if}
