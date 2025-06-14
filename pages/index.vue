<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div class="form-control mb-6">
      <input
        v-model="query"
        type="text"
        placeholder="Search libraries or type a query..."
        class="input input-bordered w-full text-lg"
      />
      <label class="label">
        <span class="label-text-alt text-gray-500">
          Hint: For best results, try queries like <span class="font-mono">"React table pagination performance"</span> or <span class="font-mono">"Vue form validation lightweight"</span>.
        </span>
      </label>
    </div>
    <button @click="searchLibraries" class="btn btn-primary w-full text-lg mb-6">
      <span v-if="!loading">🔍 Search</span>
      <span v-else class="loading loading-spinner loading-sm"></span>
    </button>

    <div v-if="results.length" class="grid gap-6">
      <div v-for="lib in results" :key="lib.name" class="card bg-base-100 shadow-xl p-6 border border-base-200">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold text-primary">{{ lib.name }}</h2>
            <p class="text-gray-700 mb-2">{{ lib.description }}</p>
          </div>
          <button
            class="btn btn-secondary btn-sm ml-4"
            @click="evaluateLibrary(lib)"
          >
            Evaluate
          </button>
        </div>
        <div class="mt-4 pt-2 border-t flex flex-wrap gap-4 text-sm text-gray-600">
          <div v-if="lib.weeklyDownloads">
            <span class="font-semibold">Downloads:</span> {{ lib.weeklyDownloads.toLocaleString() }} / week
          </div>
          <div v-if="lib.size">
            <span class="font-semibold">Size:</span> {{ (lib.size / 1024).toFixed(1) }} KB
          </div>
          <div v-if="lib.rating">
            <span class="font-semibold">Rating:</span> {{ lib.rating }}
          </div>
          <div v-if="lib.lastPublish">
            <span class="font-semibold">Last Updated:</span> {{ new Date(lib.lastPublish).toLocaleDateString() }}
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="!loading" class="text-center text-gray-400 mt-12">
      <span>No results yet. Try searching for a library!</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const query = ref('')
const results = ref([])
const loading = ref(false)
const router = useRouter()

const searchLibraries = async () => {
  loading.value = true
  const res = await $fetch('/api/search', { method: 'POST', body: { query: query.value } })
  results.value = res.results || []
  console.log('Search results:', results.value)
  loading.value = false
}

const evaluateLibrary = async (lib) => {
  // Fetch npm metadata
  const npmRes = await fetch(`https://registry.npmjs.org/${lib.name}`)
  const npmData = await npmRes.json()

  // Try to extract GitHub repo info from npm metadata
  let githubRepo = ''
  if (npmData.repository && npmData.repository.url) {
    // e.g. "git+https://github.com/owner/repo.git"
    const match = npmData.repository.url.match(/github.com[:/](.+?)\.(git)?$/)
    if (match && match[1]) {
      githubRepo = match[1]
    }
  }

  let githubMeta = {}
  if (githubRepo) {
    // Fetch GitHub repo metadata (stars, issues, last commit, etc.)
    const repoRes = await fetch(`https://api.github.com/repos/${githubRepo}`)
    const repoData = await repoRes.json()
    const commitsRes = await fetch(`https://api.github.com/repos/${githubRepo}/commits?per_page=1`)
    const commitsData = await commitsRes.json()
    githubMeta = {
      stars: repoData.stargazers_count,
      issuesOpen: repoData.open_issues_count,
      lastCommit: commitsData && commitsData[0] ? commitsData[0].commit.author.date : '',
      repoUrl: repoData.html_url,
      docs: npmData.homepage || repoData.homepage || '',
    }
  }

  // Compose metadata for evaluation
  const metadata = {
    npm: {
      name: npmData.name,
      version: npmData['dist-tags']?.latest,
      description: npmData.description,
      weeklyDownloads: lib.weeklyDownloads,
      size: lib.size,
      lastPublish: npmData.time?.[npmData['dist-tags']?.latest],
    },
    github: githubMeta
  }

  router.push({
    path: '/evaluate',
    query: {
      name: lib.name,
      metadata: JSON.stringify(metadata)
    }
  })
}
</script>