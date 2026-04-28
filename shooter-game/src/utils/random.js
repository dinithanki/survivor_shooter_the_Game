/**
 * Random number generation utilities
 */

export function random(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomBool(probability = 0.5) {
  return Math.random() < probability;
}

export function randomVector(magnitude = 1) {
  const angle = Math.random() * Math.PI * 2;
  return {
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  };
}
