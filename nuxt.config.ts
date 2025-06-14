// https://nuxt.com/docs/api/configuration/nuxt-config


import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['public/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
