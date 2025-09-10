export const formatTime = (iso: string) =>
  iso.replace('T', ' ').replace(/\.\d+Z$/, '');

// 简易防抖
export function debounce<F extends (...args: any[]) => void>(fn: F, wait = 300) {
  let t: any;
  return (...args: Parameters<F>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}