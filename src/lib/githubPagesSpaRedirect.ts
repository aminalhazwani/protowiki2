/**
 * Restore the real path after the root 404.html redirect used on GitHub Pages
 * (/?/route → /route under import.meta.env.BASE_URL). See public/404.html.
 */
export function restoreGithubPagesSpaUrl(): void {
  const { search, hash } = window.location
  if (!search.startsWith('?/') && !search.startsWith('?%2F')) {
    return
  }

  let routePath = search.slice(2).replace(/~and~/g, '&')
  const amp = routePath.indexOf('&')
  if (amp > -1) {
    routePath = routePath.slice(0, amp)
  }
  routePath = decodeURIComponent(routePath).replace(/^\//, '')

  const base = import.meta.env.BASE_URL
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  const target = normalizedBase + routePath + hash

  window.history.replaceState(null, '', target)
}
