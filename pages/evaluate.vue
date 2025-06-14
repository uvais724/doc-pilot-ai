<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-3xl font-extrabold mb-6 text-center text-primary">{{ libraryName }} Evaluation Report</h1>
    <div v-if="loading" class="flex justify-center my-12">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
    <div v-else>
      <!-- Metadata Card -->
      <div v-if="metadata" class="card bg-base-200 shadow mb-8 p-6">
        <h2 class="text-xl font-bold mb-2 text-secondary">Library Metadata</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="mb-1"><span class="font-semibold">Name:</span> {{ metadata.npm?.name }}</div>
            <div class="mb-1"><span class="font-semibold">Version:</span> {{ metadata.npm?.version }}</div>
            <div class="mb-1"><span class="font-semibold">Description:</span> {{ metadata.npm?.description }}</div>
            <div class="mb-1"><span class="font-semibold">Weekly Downloads:</span> {{ metadata.npm?.weeklyDownloads?.toLocaleString() }}</div>
            <div class="mb-1"><span class="font-semibold">Size:</span> {{ (metadata.npm?.size/1024).toFixed(1) }} KB</div>
            <div class="mb-1"><span class="font-semibold">Last Publish:</span> {{ metadata.npm?.lastPublish ? new Date(metadata.npm.lastPublish).toLocaleDateString() : '-' }}</div>
          </div>
          <div>
            <div class="mb-1"><span class="font-semibold">GitHub Stars:</span> {{ metadata.github?.stars }}</div>
            <div class="mb-1"><span class="font-semibold">Open Issues:</span> {{ metadata.github?.issuesOpen }}</div>
            <div class="mb-1"><span class="font-semibold">Last Commit:</span> {{ metadata.github?.lastCommit ? new Date(metadata.github.lastCommit).toLocaleDateString() : '-' }}</div>
            <div class="mb-1"><span class="font-semibold">Repo:</span> <a :href="metadata.github?.repoUrl" class="link link-primary" target="_blank">{{ metadata.github?.repoUrl }}</a></div>
            <div class="mb-1"><span class="font-semibold">Docs:</span> <a :href="metadata.github?.docs" class="link link-secondary" target="_blank">{{ metadata.github?.docs }}</a></div>
          </div>
        </div>
      </div>
      <!-- Evaluation Card -->
      <div v-if="report" class="card bg-base-100 shadow-xl p-8">
        <h2 class="text-2xl font-bold mb-6 text-secondary">AI Evaluation</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(item, key) in evaluationFields" :key="key" class="bg-base-200 rounded-xl p-5 flex flex-col gap-2 border border-base-300">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-lg">{{ item.label }}</span>
              <span :class="['badge badge-lg text-lg',
                report[key]?.score >= 4 ? 'badge-success' :
                report[key]?.score === 3 ? 'badge-warning' :
                report[key]?.score > 0 ? 'badge-error' : 'badge-ghost']">
                {{ report[key]?.score || '-' }}/5
              </span>
            </div>
            <div class="text-gray-700 text-sm mb-1">
              <span class="font-semibold">Reason:</span>
              <span class="font-mono">{{ report[key]?.reason || 'No reason provided.' }}</span>
            </div>
            <div class="text-green-700 text-xs mt-1" v-if="report[key]?.suggestion">
              <span class="font-semibold">Suggestion:</span> {{ report[key]?.suggestion || 'No suggestions provided.' }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500 text-center mt-8">No evaluation report available.</div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const libraryName = route.query.name || 'Library'
const metadata = route.query.metadata ? JSON.parse(route.query.metadata) : null
const loading = ref(true)
const report = ref(null)

const evaluationFields = {
  Functionality: { label: 'Functionality' },
  Performance: { label: 'Performance' },
  Community: { label: 'Community' },
  Usability: { label: 'Usability' },
  Security: { label: 'Security' }
}

onMounted(async () => {
  loading.value = true
  const res = await $fetch('/api/evaluate', {
    method: 'POST',
    body: {
      name: libraryName,
      metadata
    }
  })
  report.value = res.report
  console.log('Evaluation report:', report.value);
  loading.value = false
})
</script>
