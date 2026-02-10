<script lang="ts">
  interface Props {
    duration: number;
    onTimeUp?: () => void;
    autoStart?: boolean;
    label?: string;
  }

  let { duration, onTimeUp, autoStart = true, label = 'Tiempo restante' }: Props = $props();

  let remaining = $state(duration);
  let running = $state(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const percent = $derived(Math.round((remaining / duration) * 100));
  const urgency = $derived(percent > 50 ? 'normal' : percent > 25 ? 'warning' : 'critical');
  const display = $derived(
    `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
  );

  $effect(() => {
    if (autoStart) start();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });

  export function start() {
    if (running) return;
    running = true;
    intervalId = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        remaining = 0;
        pause();
        onTimeUp?.();
      }
    }, 1000);
  }

  export function pause() {
    running = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  export function reset() {
    pause();
    remaining = duration;
  }
</script>

<div
  class="inline-flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-300 {urgency ===
  'critical'
    ? 'border-forge-danger bg-forge-danger/10 pulse-ember'
    : urgency === 'warning'
      ? 'border-forge-warning bg-forge-warning/10'
      : 'border-forge-border bg-forge-card'}"
>
  <span class="text-xs text-forge-muted uppercase tracking-wider">{label}</span>
  <span
    class="font-mono text-lg font-bold {urgency === 'critical'
      ? 'text-forge-danger'
      : urgency === 'warning'
        ? 'text-forge-warning'
        : 'text-forge-accent'}"
  >
    {display}
  </span>
  <div class="w-20 bg-forge-darker rounded-full h-1.5">
    <div
      class="h-1.5 rounded-full transition-all duration-1000 {urgency === 'critical'
        ? 'bg-forge-danger'
        : urgency === 'warning'
          ? 'bg-forge-warning'
          : 'bg-forge-accent'}"
      style="width: {percent}%"
    ></div>
  </div>
</div>
