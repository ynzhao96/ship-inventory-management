export const formatTime = (iso: string) =>
  iso.replace('T', ' ').replace(/\.\d+Z$/, '');
