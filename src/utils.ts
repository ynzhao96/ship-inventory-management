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

export const deriveCategoryIdFromItemId = (v: string | number): string => {
  const m = String(v ?? '').trim().match(/^\d{2}/); // 前两位数字
  return m ? m[0] : '';
};