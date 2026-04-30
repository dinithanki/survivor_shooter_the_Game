/**
 * Random number generation utilities
 */

let seededState = null;

export function setRandomSeed(seed) {
  const normalizedSeed = Number(seed) >>> 0;
  seededState = normalizedSeed === 0 ? 1 : normalizedSeed;
}

export function clearRandomSeed() {
  seededState = null;
}

function nextRandom() {
  if (seededState === null) {
    return Math.random();
  }

  seededState = (seededState * 1664525 + 1013904223) >>> 0;
  return seededState / 4294967296;
}

export function random(min = 0, max = 1) {
  return nextRandom() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(nextRandom() * (max - min + 1)) + min;
}

export function randomChoice(array) {
  return array[Math.floor(nextRandom() * array.length)];
}

export function randomBool(probability = 0.5) {
  return nextRandom() < probability;
}

export function randomVector(magnitude = 1) {
  const angle = nextRandom() * Math.PI * 2;
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}
