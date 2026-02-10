<script lang="ts">
  import type { Badge } from '$lib/stores/course';

  interface Props {
    badge: Badge;
    onClose?: () => void;
  }

  let { badge, onClose }: Props = $props();

  $effect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 5000);
    return () => clearTimeout(timer);
  });
</script>

<div class="fixed top-4 right-4 z-50 slide-in">
  <div class="bg-forge-card border border-forge-accent rounded-xl p-4 shadow-xl glow-accent max-w-xs">
    <div class="flex items-start gap-3">
      <span class="text-3xl">{badge.icon}</span>
      <div class="flex-1">
        <p class="text-xs text-forge-accent uppercase tracking-wider font-bold">Logro desbloqueado!</p>
        <p class="font-bold mt-1">{badge.name}</p>
        <p class="text-xs text-forge-muted mt-0.5">{badge.description}</p>
      </div>
      <button onclick={() => onClose?.()} class="text-forge-muted hover:text-forge-text cursor-pointer text-sm">
        ✕
      </button>
    </div>
  </div>
</div>
