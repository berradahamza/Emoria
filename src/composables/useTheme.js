// src/composables/useTheme.js
import { ref, watchEffect } from "vue";

const isDark = ref(false);

// Initialise from localStorage + system preference
const stored = localStorage.getItem("emoria-theme");
if (stored === "dark") {
  isDark.value = true;
} else if (stored === "light") {
  isDark.value = false;
} else {
  // Follow system preference by default
  isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
}

// Sync <html> class + localStorage
watchEffect(() => {
  const root = document.documentElement;
  if (isDark.value) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("emoria-theme", isDark.value ? "dark" : "light");
});

export function useTheme() {
  const toggle = () => {
    isDark.value = !isDark.value;
  };

  return { isDark, toggle };
}
