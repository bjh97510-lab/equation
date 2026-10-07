/** 난수 유틸리티 */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 0 을 제외한 정수 */
export function randNonZero(min, max) {
  let v = 0;
  let guard = 0;
  while (v === 0 && guard++ < 50) v = randInt(min, max);
  return v === 0 ? 1 : v;
}

export function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function chance(p) {
  return Math.random() < p;
}
