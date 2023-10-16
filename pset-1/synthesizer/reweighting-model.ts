import { Expression } from '../interpreter/new-little-scheme.ts';
import { weightedRandomSample } from '../utils/general/weighed-sample.ts';

export function computeStochasticExpressionWeight(
  previousWeight: number,
  expression: Expression,
): number {
  // return previousWeight + 1; // Count any operation as +1 // TODO Review this
  const deltaOptions = [0, 1, 2, 3, 4, 5];
  const deltaOptionWeights = [0.0, 0.1, 0.2, 0.3, 0.4, 0.6, 1.0];
  const delta = weightedRandomSample(deltaOptions, deltaOptionWeights);
  return previousWeight + 5 - delta;
}

// ! Naive growth function is pretty slow
export function computeNaiveExpressionWeight(
  previousWeight: number,
  expression: Expression,
): number {
  return previousWeight + 1;
}
