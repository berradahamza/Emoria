<script setup>
import { onMounted } from "vue";

onMounted(() => {
  // Dynamic import keeps messaging.js out of the critical init path.
  // Firebase is guaranteed to be initialized by the time onMounted runs.
  if ("serviceWorker" in navigator) {
    import("./composables/useFCM").then(({ useFCM }) => {
      useFCM().listenForegroundMessages();
    });
  }
});
</script>

<template>
  <main
    class="min-h-screen max-w-md mx-auto bg-surface shadow-sm overflow-x-hidden transition-colors duration-200"
  >
    <RouterView />
  </main>
</template>
