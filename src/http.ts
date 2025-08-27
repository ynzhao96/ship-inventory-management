export function getToken() {
  return localStorage.getItem('a-token') ?? '';
}