import {
  printSynthesisResults,
  synthesizeProgram,
} from '../../synthesizer/bottom-up-synthesizer.ts';
import { createSchemeSubsetEnvironment } from '../../environments/scheme-subset-env.ts';
import { Example } from '../../synthesizer/example.ts';
import {
  GlobalEnv as globalEnv,
  Environment,
  Expression,
} from '../../interpreter/new-little-scheme.ts';
import { makeInternedOperation } from '../../synthesizer/make-operation.ts';
import { composeEnvironments } from '../../utils/ast/function-declaration.ts';
import { createStringManipulationDslEnvironment } from '../../environments/string-manipulation-dsl.ts';

async function main() {
  const schemeSubsetEnv = await createSchemeSubsetEnvironment();
  const stringDslEnv = await createStringManipulationDslEnvironment();
  const currentEnv = composeEnvironments([
    stringDslEnv,
    schemeSubsetEnv,
    globalEnv,
  ]) as Environment;

  const addition = makeInternedOperation('+', 2, () => true);
  const substration = makeInternedOperation('-', 2, () => true);
  const multiplication = makeInternedOperation('*', 2, () => true);
  const equalityCheck = makeInternedOperation('=', 2, () => true);
  const lessThanCheck = makeInternedOperation('<', 2, () => true);

  const synthesizeFromExamples = async (
    args: string[],
    examples: Example[],
    {
      printExpressionsTested = false,
      ignoreInputPrimitives = false,
      ignoreOutputPrimitives = false,
    },
  ) => {
    const synthesisResults = await synthesizeProgram({
      argumentNames: args,
      examples,
      availableOperations: [
        addition,
        substration,
        multiplication,
        // equalityCheck,
        // lessThanCheck,
      ],
      environment: currentEnv,
      maxExpressionWeight: 40,
      extraPrimitives: new Set([1]),
      expressionWeightComputation: 'naive',
      ignoreInputPrimitives,
      ignoreOutputPrimitives,
      debugInfo: {
        printExpressionsTested,
        printEvaluationErrors: false,
      },
    });

    printSynthesisResults(synthesisResults);
  };

  const generateExamplesForFunction = async <
    T extends Record<string, Expression>,
  >(
    func: (T) => any,
    inputObjs: T[],
  ) => {
    return Promise.all(
      inputObjs.map(async (inputObj) => {
        return new Example(inputObj, await func(inputObj));
      }),
    );
  };

  const enabledExamples = {
    min: true,
    fixedLinearCombination: true,
    matrixDeterminant: true,
  };

  if (enabledExamples.min) {
    const examples = await generateExamplesForFunction(
      ({ x, y }: { x: number; y: number }) => (x < y ? x : y),
      [
        { x: 1, y: 3 },
        { x: 22, y: 4 },
        { x: 3, y: 5 },
      ],
    );

    const synthesisResults = await synthesizeProgram({
      argumentNames: ['x', 'y'],
      examples,
      availableOperations: [
        makeInternedOperation('if', 3, () => true),
        lessThanCheck,
        addition,
        substration,
        multiplication,
        equalityCheck,
      ],
      environment: currentEnv,
      maxExpressionWeight: 40,
      extraPrimitives: new Set([1]),
      expressionWeightComputation: 'stochastic',
      ignoreInputPrimitives: true,
      ignoreOutputPrimitives: true,
      debugInfo: {
        printExpressionsTested: false,
        printEvaluationErrors: false,
      },
    });

    printSynthesisResults(synthesisResults);
  }

  if (enabledExamples.fixedLinearCombination) {
    await synthesizeFromExamples(
      ['x', 'y'],
      await generateExamplesForFunction(
        ({ x, y }: { x: number; y: number }) => 2 * x + 3 * y,
        [
          { x: 1, y: 3 },
          { x: 2, y: 4 },
          { x: 3, y: 5 },
        ],
      ),
      {},
    );
  }

  if (enabledExamples.matrixDeterminant) {
    await synthesizeFromExamples(
      ['a', 'b', 'c', 'd'],
      await generateExamplesForFunction(
        ({ a, b, c, d }: { a: number; b: number; c: number; d: number }) =>
          a * d - b * c,
        [
          {
            a: 2,
            b: 3,
            c: 4,
            d: 6,
          },
          {
            a: 2,
            b: 4,
            c: 9,
            d: 3,
          },
        ],
      ),
      {
        ignoreInputPrimitives: true,
        ignoreOutputPrimitives: true,
      },
    );
  }
}

main();
