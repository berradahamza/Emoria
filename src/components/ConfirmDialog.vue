<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: "Confirmer" },
  message: { type: String, default: "Es-tu sûr(e) ?" },
  confirmLabel: { type: String, default: "Supprimer" },
  cancelLabel: { type: String, default: "Annuler" },
  danger: { type: Boolean, default: true },
});

const emit = defineEmits(["confirm", "cancel"]);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-100 flex items-center justify-center bg-black/40"
      @click.self="emit('cancel')"
    >
      <div class="w-[90%] max-w-sm bg-surface rounded-2xl p-6 shadow-xl animate-pop">
        <h2 class="text-lg font-bold text-heading mb-2">{{ title }}</h2>
        <p class="text-sm text-body mb-6">{{ message }}</p>
        <div class="flex gap-3">
          <button
            @click="emit('cancel')"
            class="flex-1 py-2.5 rounded-lg border border-line-strong text-muted font-semibold active:scale-95 transition-all"
          >
            {{ cancelLabel }}
          </button>
          <button
            @click="emit('confirm')"
            class="flex-1 py-2.5 rounded-lg font-semibold active:scale-95 transition-all"
            :class="danger ? 'bg-danger text-white' : 'bg-accent-soft text-white'"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes pop {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-pop {
  animation: pop 0.15s ease-out;
}
</style>
