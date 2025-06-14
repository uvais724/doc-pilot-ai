export async function enrichNpmPackages(packages) {
  const enriched = await Promise.all(packages.map(async (pkg) => {
    const [meta, downloads] = await Promise.all([
      fetch(`https://registry.npmjs.org/${pkg.name}`).then(res => res.json()),
      fetch(`https://api.npmjs.org/downloads/point/last-week/${pkg.name}`).then(res => res.json())
    ])

    return {
      ...pkg,
      lastPublish: meta.time?.[meta["dist-tags"]?.latest] || null,
      weeklyDownloads: downloads.downloads || 0,
      size: meta.versions?.[meta["dist-tags"]?.latest]?.dist?.unpackedSize || 0
    }
  }))
  return enriched
}
