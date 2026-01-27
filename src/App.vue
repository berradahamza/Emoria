<template>
  <main class="min-h-screen max-w-md mx-auto bg-white shadow-sm overflow-x-hidden">
    <RouterView />
  </main>
</template>

<style>
@import "tailwindcss";

@theme {
  --color-emoria-purple: #6B46C1; /* Couleur du Figma */
}

body {
  @apply bg-slate-50;
}
</style>