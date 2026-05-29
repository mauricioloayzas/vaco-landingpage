export const useSubdomainSlug = (): string | null => {
  if (import.meta.server) return null

  const host = window.location.hostname
  const parts = host.split('.')

  // profile1.hayayaku.com → parts[0] = 'profile1'
  if (parts.length >= 3 && parts[parts.length - 2] === 'hayayaku') {
    return parts[0]
  }

  // Dev fallback: ?slug=profile1
  return new URLSearchParams(window.location.search).get('slug')
}
