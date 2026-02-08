// src/composables/useTheme.js
import { ref, watchEffect } from "vue";

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

// Always start from system preference
const isDark = ref(mediaQuery.matches);

// Track whether the user manually toggled (in-memory only, resets on reload)
let manualOverride = false;

// Sync <html> class (no localStorage — always follows system on reload)
watchEffect(() => {
  const root = document.documentElement;
  if (isDark.value) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
});

// Listen for system theme changes — follow them unless manually overridden
const handleSystemChange = (e) => {
  // When system changes, always follow it (reset manual override)
  manualOverride = false;
  isDark.value = e.matches;
};
mediaQuery.addEventListener("change", handleSystemChange);

export function useTheme() {
  const toggle = () => {
    manualOverride = true;
    isDark.value = !isDark.value;
  };

  return { isDark, toggle };
}
