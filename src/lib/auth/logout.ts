export async function performLogout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })

  // Clear all known app keys
  localStorage.removeItem('lastChart')

  // Clear namespaced local storage keys only
  Object.keys(localStorage)
    .filter(k => k.startsWith('astrotattwa:'))
    .forEach(k => localStorage.removeItem(k))

  sessionStorage.clear()

  // Signal all tabs to logout
  localStorage.setItem('astrotattwa:logout', Date.now().toString())

  // Hard redirect
  window.location.href = '/login'
}
