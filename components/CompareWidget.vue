<template>
  <div v-if="!minimized" class="fixed bottom-6 right-6 z-50 bg-base-100 shadow-xl rounded-xl p-4 flex flex-col items-center w-[350px]">
    <div class="flex w-full items-center justify-between mb-2">
      <span class="font-bold text-lg">Compare Libraries</span>
      <button class="btn btn-xs btn-circle btn-ghost no-hover-effect" @click="minimized = true">
        <span class="material-icons">minimize</span>
      </button>
    </div>
    <div class="flex items-center w-full justify-between gap-2 mb-4">
      <div class="flex-1 border rounded p-2 min-h-[60px] flex items-center justify-center bg-base-200 relative">
        <span v-if="compare[0]">{{ compare[0].name }}</span>
        <span v-else class="text-gray-400">Add Library</span>
        <button v-if="compare[0]" class="btn btn-xs btn-circle btn-error absolute top-1 right-1" @click="removeFromCompare(0)">
          <span class="material-icons">close</span>
        </button>
      </div>
      <span class="font-bold text-xl mx-2">VS</span>
      <div class="flex-1 border rounded p-2 min-h-[60px] flex items-center justify-center bg-base-200 relative">
        <span v-if="compare[1]">{{ compare[1].name }}</span>
        <span v-else class="text-gray-400">Add Library</span>
        <button v-if="compare[1]" class="btn btn-xs btn-circle btn-error absolute top-1 right-1" @click="removeFromCompare(1)">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>
    <button class="btn btn-primary w-full mb-2" :disabled="compare.length < 2" @click="showFullComparison">
      Show Full Comparison
    </button>
  </div>
  <button v-else class="fixed bottom-6 right-6 z-50 btn btn-circle btn-primary" @click="minimized = false">
    <span class="material-icons">compare_arrows</span>
  </button>
</template>

<script setup>
import { ref } from 'vue'
const minimized = ref(false) // Widget is open by default
const compare = ref([])

// Listen for add-to-compare events
if (process.client) {
  window.addEventListener('add-to-compare', (e) => {
    const lib = e.detail
    // Only add if not already present and max 2
    if (!compare.value.find(l => l && l.name === lib.name) && compare.value.length < 2) {
      compare.value.push(lib)
    }
  })
  window.addEventListener('open-compare-widget', () => {
    minimized.value = false
  })
}

function removeFromCompare(idx) {
  compare.value.splice(idx, 1)
}

function showFullComparison() {
  // Navigate to /compare page with both libraries
  if (compare.value.length === 2) {
    window.location.href = `/compare?libraries=${encodeURIComponent(JSON.stringify(compare.value))}`
  }
}
</script>

<style scoped>
.material-icons {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: normal;
  font-size: 20px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  direction: ltr;
  font-feature-settings: 'liga';
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
.no-hover-effect:hover, .no-hover-effect:focus {
  background: none !important;
  color: inherit !important;
  box-shadow: none !important;
  border-color: transparent !important;
}
</style>
