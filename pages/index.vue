<template>
  <div class="min-h-screen bg-base-100">
    <!-- Hero Section -->
    <section class="py-16 px-4 text-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <h1 class="text-5xl font-extrabold mb-4 text-primary">VersusDev</h1>
      <p class="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">AI-powered library comparison and evaluation for developers. Instantly compare, evaluate, and choose the best open source tools for your project.</p>
      <NuxtLink to="/search" class="btn btn-primary btn-lg">Get Started</NuxtLink>
    </section>

    <!-- Key Features/Benefits -->
    <section class="py-16 px-4 max-w-5xl mx-auto">
      <h2 class="text-3xl font-bold mb-8 text-center text-secondary">Key Features</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="card bg-base-200 p-6 shadow flex flex-col items-center">
          <span class="material-icons text-4xl text-primary mb-2">compare_arrows</span>
          <h3 class="font-bold text-lg mb-2">Side-by-Side Comparison</h3>
          <p class="text-gray-600">Compare two libraries across Functionality, Performance, Community, Usability, and Security.</p>
        </div>
        <div class="card bg-base-200 p-6 shadow flex flex-col items-center">
          <span class="material-icons text-4xl text-primary mb-2">insights</span>
          <h3 class="font-bold text-lg mb-2">AI-Powered Evaluation</h3>
          <p class="text-gray-600">Get instant, unbiased AI-generated reports and recommendations for any library.</p>
        </div>
        <div class="card bg-base-200 p-6 shadow flex flex-col items-center">
          <span class="material-icons text-4xl text-primary mb-2">search</span>
          <h3 class="font-bold text-lg mb-2">Smart Search</h3>
          <p class="text-gray-600">Find the best libraries for your use case with intelligent search and filtering.</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 px-4 bg-base-200">
      <h2 class="text-3xl font-bold mb-8 text-center text-primary">How It Works</h2>
      <div class="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
        <div class="flex flex-col items-center">
          <span class="material-icons text-4xl text-secondary mb-2">search</span>
          <h4 class="font-semibold mb-1">1. Search Libraries</h4>
          <p class="text-gray-600 text-center">Type your query and discover the best libraries for your needs.</p>
        </div>
        <div class="flex flex-col items-center">
          <span class="material-icons text-4xl text-secondary mb-2">add_circle_outline</span>
          <h4 class="font-semibold mb-1">2. Add to Compare</h4>
          <p class="text-gray-600 text-center">Add libraries to the comparison widget with a single click.</p>
        </div>
        <div class="flex flex-col items-center">
          <span class="material-icons text-4xl text-secondary mb-2">emoji_events</span>
          <h4 class="font-semibold mb-1">3. Get AI Insights</h4>
          <p class="text-gray-600 text-center">View detailed AI-powered reports and see which library is the winner.</p>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-16 px-4 max-w-3xl mx-auto">
      <h2 class="text-3xl font-bold mb-8 text-center text-secondary">Frequently Asked Questions</h2>
      <div class="space-y-4">
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title text-lg font-medium">How does VersusDev generate its reports?</div>
          <div class="collapse-content">
            <p>VersusDev uses advanced AI models to analyze library metadata, GitHub activity, and documentation to provide unbiased, data-driven evaluations and comparisons.</p>
          </div>
        </div>
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title text-lg font-medium">Can I compare any libraries?</div>
          <div class="collapse-content">
            <p>Yes! You can compare any two libraries available on npm and GitHub. Just search, add to compare, and view the results.</p>
          </div>
        </div>
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" />
          <div class="collapse-title text-lg font-medium">Is VersusDev free to use?</div>
          <div class="collapse-content">
            <p>VersusDev is free for individual developers. For advanced features and team plans, contact us for more information.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { NuxtLink } from '#components'

const evaluateLibrary = async (lib) => {
  evaluating.value = true
  let metadata = {}
  if (lib.publisher && lib.link && lib.link.includes('pypi.org')) {
    // PyPI package
    const pypiRes = await fetch(`https://pypi.org/pypi/${lib.name}/json`)
    const pypiData = await pypiRes.json()
    metadata = {
      pypi: {
        name: pypiData.info.name,
        version: pypiData.info.version,
        description: pypiData.info.summary,
        author: pypiData.info.author,
        home_page: pypiData.info.home_page,
        license: pypiData.info.license,
        last_release: pypiData.releases ? Object.keys(pypiData.releases).pop() : '',
      }
    }
  } else {
    // npm/github logic
    const npmRes = await fetch(`https://registry.npmjs.org/${lib.name}`)
    const npmData = await npmRes.json()
    metadata = {
      npm: {
        name: npmData.name,
        version: npmData['dist-tags'].latest,
        description: npmData.description,
        homepage: npmData.homepage,
        repository: npmData.repository.url,
        license: npmData.license,
        author: npmData.author.name,
        maintainers: npmData.maintainers.map(m => m.name).join(', '),
        stars: npmData.stars,
        forks: npmData.forks,
        issues: npmData.issues,
        last_release: npmData.time[npmData['dist-tags'].latest],
      }
    }
  }
  router.push({
    path: '/evaluate',
    query: {
      name: lib.name,
      metadata: JSON.stringify(metadata)
    }
  })
  evaluating.value = false
}
</script>
