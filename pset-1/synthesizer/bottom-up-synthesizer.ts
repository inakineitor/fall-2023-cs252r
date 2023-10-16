import _ from 'lodash';

import { Example } from './example.ts';
import {
  Expression,
  Operation,
  Sym,
  stringify,
} from '../interpreter/new-little-scheme.ts';
import { makeArgumentTuplesGenerator } from './argument-tuples-generator.ts';
import { evaluateExamples } from './evaluate-examples.ts';
import {
  computeNaiveExpressionWeight,
  computeStochasticExpressionWeight,
} from './reweighting-model.ts';
import { Environment } from '../interpreter/new-little-scheme.ts';

export interface SynthesizerOptions {
  argumentNames: string[];
  examples: Example[];
  availableOperations: Operation[];
  environment: Environment;
  maxExpressionWeight: number;
  extraPrimitives: Set<Expression>;
  ignoreInputPrimitives: boolean;
  ignoreOutputPrimitives: boolean;
  expressionWeightComputation: 'naive' | 'stochastic';
  debugInfo: {
    printExpressionsTested: boolean;
    printEvaluationErrors: boolean;
  };
}

export type SuccessfulSynthesisResult = {
  success: true;
  program: Expression;
  weight: number;
};

export type SynthesisResult = SuccessfulSynthesisResult | { success: false };

export async function synthesizeProgram({
  argumentNames,
  examples,
  availableOperations,
  environment,
  maxExpressionWeight,
  extraPrimitives,
  ...extraOptions
}: SynthesizerOptions): Promise<SynthesisResult> {
  const argumentSymbols = argumentNames.map((name) => Sym.interned(name));
  const constants = new Set(
    examples.flatMap((example) => example.extractConstants()),
  );
  const exampleInputs = new Set(
    examples.flatMap((example) =>
      example.extractInputs().map(({ value }) => value),
    ),
  );

  const primitives = new Set<Expression>([
    ...argumentSymbols,
    ...(extraOptions.ignoreOutputPrimitives ? [] : constants),
    ...(extraOptions.ignoreInputPrimitives ? [] : exampleInputs),
    ...extraPrimitives,
  ]);

  const weightToTerms = {
    1: primitives,
  };

  const seenEvaluations = new Set<Expression[]>(
    [...primitives].map((term) => Array(examples.length).fill(term)),
  );

  const startingEnvironment = Environment.clone(environment);

  console.log('===== Primitives =====');
  console.log(weightToTerms);

  console.log('===== Operations =====');
  console.log(availableOperations);

  for (let weight = 2; weight <= maxExpressionWeight; weight++) {
    console.log(`========== Weight ${weight} ==========`);

    for (
      let operationIdx = 0;
      operationIdx < availableOperations.length;
      operationIdx++
    ) {
      const operation = availableOperations[operationIdx];

      console.log(`===== Growing through ${operation.name} =====`);

      const argumentTuplesGenerator = makeArgumentTuplesGenerator(
        operation,
        weightToTerms,
        weight - 1,
      );

      let counter = 0;
      const counterDot = Math.pow(10, weight);
      for (const argumentTuple of argumentTuplesGenerator) {
        counter++;
        if (counter % counterDot === 1) {
          console.log(`Expression evaluated ${counter}`);
        }

        // console.log(argumentTuple);
        // console.log(`== Testing Arguments ${argumentTuple} ==`);

        const newExpressionAst = operation.applyTo(argumentTuple);
        if (extraOptions.debugInfo.printExpressionsTested) {
          console.log(stringify(newExpressionAst));
        }

        try {
          // TODO Add revtrieval of expression types and outputs from cache
          const { solutionFound, outputExpressions } = await evaluateExamples(
            newExpressionAst,
            examples,
            startingEnvironment,
          );

          const isProgramEquivalent = seenEvaluations.has(outputExpressions);
          if (!isProgramEquivalent) {
            const computeExpressionWeight =
              extraOptions.expressionWeightComputation === 'naive'
                ? computeNaiveExpressionWeight
                : computeStochasticExpressionWeight;
            const newProgramWeight = computeExpressionWeight(
              weight - 1,
              newExpressionAst,
            );
            if (!weightToTerms[newProgramWeight]) {
              weightToTerms[newProgramWeight] = new Set();
            }
            weightToTerms[newProgramWeight].add(newExpressionAst); // Add expression to set of expressions with the same weight
          }
          if (solutionFound) {
            return {
              success: true,
              program: newExpressionAst,
              weight: weight,
            };
          }
        } catch (err) {
          if (extraOptions.debugInfo.printEvaluationErrors) {
            console.log(
              `🔺 ${stringify(
                newExpressionAst,
              )} 🔺 Evaluation failed, skipped. Error: ${err.message}`,
            );
          }
          // TODO Improve try catch
        }
      }
      console.log(`Expression evaluated ${counter}`);
    }
  }

  return { success: false };
}

export function printSynthesisResults(results: SynthesisResult) {
  if (results.success) {
    console.log('\n===== SUCCESS 🎉 =====');
    console.log('A program that satisfied the examples was found!');
    console.log(`Weight: ${results.weight}`);
    console.log('Program:');
    console.log(stringify(results.program));
  } else {
    console.log('Failed to synthesize program. Try adding new primitives.');
  }
}
