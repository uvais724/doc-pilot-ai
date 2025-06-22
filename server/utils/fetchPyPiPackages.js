export async function fetchPyPiPackages(category) {
    const query = encodeURIComponent(category)
    // Use PyPI's search API via libraries.io (since PyPI's own search API is limited)
    const res = await fetch(`https://libraries.io/api/search?q=${query}&platforms=PyPI&per_page=25&api_key=${process.env.LIBRARIES_IO_API_KEY}`)
    const data = await res.json()
    return data.map(pkg => ({
        name: pkg.name,
        description: pkg.description,
        version: pkg.latest_release_number,
        link: pkg.repository_url || pkg.homepage || `https://pypi.org/project/${pkg.name}/`,
        publisher: pkg.maintainers && pkg.maintainers.length ? pkg.maintainers[0].username : "unknown",
    }))
}
