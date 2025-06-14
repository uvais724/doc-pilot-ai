<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <div>
    <Navbar />
    <NuxtPage />
    <CompareWidget />
  </div>
</template>

<script setup>
import Navbar from '~/components/Navbar.vue'
import CompareWidget from '~/components/CompareWidget.vue'
</script>
