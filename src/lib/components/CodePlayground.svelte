<script lang="ts">
  interface PlaygroundExercise {
    id: string;
    title: string;
    instructions: string;
    initialCode: string;
    expectedOutput?: string;
    expectedOutputRegex?: string;
    hints?: string[];
    solution?: string;
    language?: string;
  }

  interface Props {
    exercise: PlaygroundExercise;
    onComplete?: (passed: boolean, attempts: number) => void;
  }

  let { exercise, onComplete }: Props = $props();

  let code = $state(exercise.initialCode);
  let output = $state('');
  let isError = $state(false);
  let running = $state(false);
  let attempts = $state(0);
  let passed = $state(false);
  let hintsRevealed = $state(0);
  let showSolution = $state(false);

  async function runCode() {
    if (running) return;
    running = true;
    output = '';
    isError = false;
    attempts++;

    try {
      const { LuaFactory } = await import('wasmoon');
      const factory = new LuaFactory();
      const engine = await factory.createEngine();

      try {
        const outputLines: string[] = [];

        engine.global.set('print', (...args: any[]) => {
          outputLines.push(args.map(String).join('\t'));
        });

        const timeoutMs = 5000;
        const result = await Promise.race([
          engine.doString(code),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout: el codigo tardo mas de 5 segundos. Posible loop infinito.')), timeoutMs)
          )
        ]);

        output = outputLines.join('\n');
        if (output === '' && result !== undefined && result !== null) {
          output = String(result);
        }
        if (output === '') {
          output = '(sin output)';
        }

        // Validate if expected output is configured
        if (exercise.expectedOutput || exercise.expectedOutputRegex) {
          const trimmedOutput = output.trim();
          let isMatch = false;

          if (exercise.expectedOutput) {
            isMatch = trimmedOutput === exercise.expectedOutput.trim();
          }
          if (!isMatch && exercise.expectedOutputRegex) {
            const re = new RegExp(exercise.expectedOutputRegex);
            isMatch = re.test(trimmedOutput);
          }

          if (isMatch && !passed) {
            passed = true;
            onComplete?.(true, attempts);
          }
        }
      } finally {
        engine.global.close();
      }
    } catch (err: any) {
      isError = true;
      const msg = err?.message || String(err);
      // Clean up wasmoon internal paths from error messages
      output = msg.replace(/\[string ".*?"\]:/, 'linea');
    } finally {
      running = false;
    }
  }

  function revealHint() {
    if (exercise.hints && hintsRevealed < exercise.hints.length) {
      hintsRevealed++;
    }
  }

  function revealSolution() {
    showSolution = true;
  }

  function resetCode() {
    code = exercise.initialCode;
    output = '';
    isError = false;
    showSolution = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
  }
</script>

<div class="card fade-in">
  <div class="flex items-center justify-between mb-3">
    <h3 class="font-bold text-forge-accent text-sm uppercase tracking-wider flex items-center gap-2">
      <span>&#9654;</span> {exercise.title}
    </h3>
    {#if passed}
      <span class="text-xs font-bold text-forge-success bg-forge-success/10 px-2 py-1 rounded">Completado</span>
    {/if}
  </div>

  <p class="text-sm text-forge-muted leading-relaxed mb-4">{exercise.instructions}</p>

  <!-- Editor -->
  <div class="rounded-lg overflow-hidden border border-forge-border mb-3">
    <div class="bg-forge-darker px-3 py-1.5 border-b border-forge-border flex items-center justify-between">
      <span class="text-xs text-forge-muted font-mono">{exercise.language || 'lua'}</span>
      <span class="text-xs text-forge-muted/50">Ctrl+Enter para ejecutar</span>
    </div>
    <textarea
      bind:value={code}
      onkeydown={handleKeydown}
      spellcheck="false"
      class="w-full bg-[#1a1a2e] text-forge-text font-mono text-sm p-4 leading-relaxed resize-y min-h-[120px] focus:outline-none focus:ring-1 focus:ring-forge-accent/30 border-none"
      rows="6"
    ></textarea>
  </div>

  <!-- Action buttons -->
  <div class="flex flex-wrap gap-2 mb-3">
    <button
      onclick={runCode}
      disabled={running}
      class="btn-primary text-xs flex items-center gap-1 {running ? 'opacity-50 cursor-not-allowed' : ''}"
    >
      {#if running}
        <span class="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full"></span>
        Ejecutando...
      {:else}
        &#9654; Ejecutar
      {/if}
    </button>

    <button onclick={resetCode} class="btn-secondary text-xs">Reiniciar</button>

    {#if exercise.hints && exercise.hints.length > 0 && hintsRevealed < exercise.hints.length}
      <button onclick={revealHint} class="btn-secondary text-xs">
        Pista ({hintsRevealed}/{exercise.hints.length})
      </button>
    {/if}

    {#if exercise.solution && attempts >= 3 && !showSolution}
      <button onclick={revealSolution} class="btn-secondary text-xs text-forge-warning">
        Ver solucion
      </button>
    {/if}
  </div>

  <!-- Output panel -->
  {#if output}
    <div class="rounded-lg overflow-hidden border {isError ? 'border-forge-danger/50' : passed ? 'border-forge-success/50' : 'border-forge-border'}">
      <div class="px-3 py-1.5 border-b {isError ? 'bg-forge-danger/10 border-forge-danger/30' : passed ? 'bg-forge-success/10 border-forge-success/30' : 'bg-forge-darker border-forge-border'}">
        <span class="text-xs font-bold {isError ? 'text-forge-danger' : passed ? 'text-forge-success' : 'text-forge-muted'}">
          {isError ? 'Error' : passed ? 'Correcto!' : 'Output'}
        </span>
      </div>
      <pre class="bg-[#0d0d1a] p-4 text-sm font-mono leading-relaxed overflow-x-auto {isError ? 'text-forge-danger' : 'text-forge-success'}">{output}</pre>
    </div>
  {/if}

  <!-- Hints -->
  {#if hintsRevealed > 0 && exercise.hints}
    <div class="mt-3 space-y-2">
      {#each exercise.hints.slice(0, hintsRevealed) as hint, i}
        <div class="p-3 rounded-lg bg-forge-accent/5 border border-forge-accent/20 slide-in">
          <p class="text-xs text-forge-muted">
            <span class="text-forge-accent font-bold">Pista {i + 1}:</span> {hint}
          </p>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Solution -->
  {#if showSolution && exercise.solution}
    <div class="mt-3 rounded-lg overflow-hidden border border-forge-warning/30 slide-in">
      <div class="bg-forge-warning/10 px-3 py-1.5 border-b border-forge-warning/20">
        <span class="text-xs font-bold text-forge-warning">Solucion</span>
      </div>
      <pre class="bg-[#1a1a2e] p-4 text-sm font-mono leading-relaxed overflow-x-auto text-forge-text">{exercise.solution}</pre>
    </div>
  {/if}
</div>
