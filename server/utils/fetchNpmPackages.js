export async function fetchNpmPackages(category) {
    const query = encodeURIComponent(category)
    console.log("Fetching NPM packages for category:", query)
    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${query}&size=25`)
    const data = await res.json()
    return data.objects.map((pkg) => ({
        name: pkg.package.name,
        description: pkg.package.description,
        version: pkg.package.version,
        link: pkg.package.links.npm,
        publisher: pkg.package.publisher?.username || "unknown",
    }))
}
