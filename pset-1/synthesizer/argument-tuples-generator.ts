import { Permutation } from 'js-combinatorics';

import { Expression, Operation } from '../interpreter/new-little-scheme.ts';

type WeightedExpression = { expression: Expression; weight: number };

function calculateTotalWeight(weightedExpressions: WeightedExpression[]) {
  return weightedExpressions.reduce((acc, curr) => acc + curr.weight, 0);
}

// TODO Definitely optimizable through type narrowing
// TODO Definitely optimizable through weight narrowing

export function* makePermutationCombinationGenerator<T>(
  elements: T[],
): Generator<T[]> {
  for (let i = 0; i <= elements.length; i++) {
    const permutationGenerator = new Permutation(elements, i);
    for (const permutation of permutationGenerator) {
      yield permutation;
    }
  }
}

export function* makeArgumentTuplesGenerator(
  operation: Operation,
  expressions: Record<number, Set<Expression>>,
  targetWeight: number,
): Generator<Expression[]> {
  let weightedExpressions: WeightedExpression[] = [];
  for (let weight = 0; weight <= targetWeight; weight++) {
    if (!expressions[weight]) continue;
    weightedExpressions = weightedExpressions.concat(
      [...expressions[weight]].map((expr) => ({ expression: expr, weight })),
    );
  }

  const argumentTupleGenerator = operation.arity
    ? new Permutation(weightedExpressions, operation.arity)
    : makePermutationCombinationGenerator(weightedExpressions);
  for (const weightedArgumentTuple of argumentTupleGenerator) {
    const argumentTuple = weightedArgumentTuple.map((arg) => arg.expression);
    const totalWeight = calculateTotalWeight(weightedArgumentTuple);
    if (totalWeight === targetWeight) {
      const applicable = operation.canApplyTo(argumentTuple);
      if (applicable) {
        yield argumentTuple;
      }
    }
  }
}
