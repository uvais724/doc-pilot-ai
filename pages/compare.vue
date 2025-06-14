<template>
  <div class="p-6 max-w-4xl mx-auto">
    <button @click="goBack" class="btn btn-outline btn-primary mb-6 flex items-center gap-2">
      <span class="material-icons">arrow_back</span>
      Back
    </button>
    <h1 class="text-3xl font-extrabold mb-6 text-center text-primary">Library Comparison</h1>
    <div v-if="loading" class="flex justify-center my-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <div v-else-if="report">
      <div class="card bg-base-100 shadow-xl p-8 mb-8">
        <h2 class="text-xl font-bold mb-4 text-secondary">Comparison Report</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(lib, idx) in libraries" :key="lib.name" class="bg-base-200 rounded-xl p-5 flex flex-col gap-2 border border-base-300">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-lg">{{ lib.name }}</span>
              <span v-if="winnerIdx === idx" class="badge badge-success">Winner</span>
            </div>
            <div v-for="metric in metrics" :key="metric" class="text-gray-700 text-sm mb-1">
              <span class="font-semibold">{{ metric }}:</span>
              <span class="font-mono">{{ report[lib.name]?.[metric]?.score || '-' }}/5</span>
              <span class="ml-2 text-xs text-gray-500">{{ report[lib.name]?.[metric]?.reason || '' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="report.summary" class="bg-gradient-to-r from-primary/10 to-secondary/10 border-l-4 border-primary p-6 rounded-xl shadow mb-8 flex flex-col items-start">
        <h3 class="text-xl font-bold mb-2 text-primary">AI Summary</h3>
        <p class="text-base text-gray-700 leading-relaxed">{{ report.summary }}</p>
      </div>
    </div>
    <div v-else class="text-gray-500 text-center mt-8">No comparison report available.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const libraries = ref([])
const loading = ref(true)
const report = ref(null)
const metrics = [
  'Functionality',
  'Performance',
  'Community',
  'Usability',
  'Security'
]
const winnerIdx = ref(null)

function goBack() {
  router.back()
}

onMounted(async () => {
  // Get libraries from query param
  libraries.value = JSON.parse(route.query.libraries || '[]')
  if (libraries.value.length < 2) return
  loading.value = true
  const res = await $fetch('/api/compare', {
    method: 'POST',
    body: {
      compare: libraries.value
    }
  })
  report.value = res.report
  // Determine winner by total score or use AI winner
  if (report.value && report.value.winner) {
    winnerIdx.value = libraries.value.findIndex(l => l.name === report.value.winner)
  } else {
    const scores = libraries.value.map(lib =>
      metrics.reduce((sum, m) => sum + (report.value[lib.name]?.[m]?.score || 0), 0)
    )
    winnerIdx.value = scores[0] === scores[1] ? null : (scores[0] > scores[1] ? 0 : 1)
  }
  loading.value = false
})
</script>
