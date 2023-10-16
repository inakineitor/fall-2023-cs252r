export function weightedRandomSample<T>(elements: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const randomWeight = Math.random() * totalWeight;
  let weightSum = 0;
  for (let i = 0; i < weights.length; i++) {
    weightSum += weights[i];
    if (randomWeight < weightSum) {
      return elements[i];
    }
  }
  return elements[elements.length - 1];
}