<script setup>
import { computed } from "vue";

const props = defineProps({
  type: { type: String, required: true },
  label: { type: String, required: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "🔔" },
  enabled: { type: Boolean, default: false },
  hour: { type: Number, default: 21 },
  minute: { type: Number, default: 0 },
});

const emit = defineEmits(["toggle", "update:schedule"]);

const formattedTime = computed(() => {
  return `${String(props.hour).padStart(2, "0")}:${String(props.minute).padStart(2, "0")}`;
});

const timeValue = computed({
  get: () => formattedTime.value,
  set: (val) => {
    const [h, m] = val.split(":").map(Number);
    emit("update:schedule", h, m);
  },
});
</script>

<template>
  <div
    class="rounded-xl border border-line p-4 shadow-sm transition-colors"
    :class="enabled ? 'bg-surface-alt' : 'bg-surface'"
  >
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="text-xl">{{ icon }}</span>
        <span class="font-bold text-heading text-sm">{{ label }}</span>
      </div>
      <!-- Toggle -->
      <button
        @click="emit('toggle', !enabled)"
        class="relative w-11 h-6 rounded-full transition-colors duration-200"
        :class="enabled ? 'bg-accent-soft' : 'bg-dim'"
      >
        <span
          class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
          :class="{ 'translate-x-5': enabled }"
        />
      </button>
    </div>

    <p class="text-xs text-muted mb-3">{{ description }}</p>

    <!-- Time picker (visible only when enabled) -->
    <div v-if="enabled" class="flex items-center gap-2">
      <label class="text-xs text-body font-semibold">Heure :</label>
      <input
        type="time"
        :value="formattedTime"
        @input="timeValue = $event.target.value"
        class="px-3 py-1.5 rounded-lg border border-line-strong bg-input-bg text-body text-sm focus:outline-none focus:ring-2 focus:ring-accent-soft/40"
      />
    </div>
  </div>
</template>
