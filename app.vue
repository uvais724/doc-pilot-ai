<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <div>
    <Navbar />
    <NuxtPage />
    <ClientOnly>
      <CompareWidget v-if="$route.name !== 'index'" />
    </ClientOnly>
  </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue'
import CompareWidget from '~/components/CompareWidget.vue'
import { useRoute } from 'vue-router'
const $route = useRoute()
</script>
