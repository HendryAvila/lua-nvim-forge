<script lang="ts">
  import { courseStore, progressPercent } from '$lib/stores/course';
</script>

<div class="w-full">
  <div class="flex items-center justify-between mb-1">
    <span class="text-xs text-forge-muted uppercase tracking-wider">Progreso del curso</span>
    <span class="text-xs font-bold text-forge-accent">{$progressPercent}%</span>
  </div>
  <div class="w-full bg-forge-darker rounded-full h-2">
    <div
      class="bg-gradient-to-r from-forge-ember to-forge-accent h-2 rounded-full transition-all duration-700"
      style="width: {$progressPercent}%"
    ></div>
  </div>
</div>
