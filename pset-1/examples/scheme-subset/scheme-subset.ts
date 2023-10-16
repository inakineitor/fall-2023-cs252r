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
import { stringToAST } from '../../interpreter/scheme-interpreter.ts';
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

  const cons = makeInternedOperation('cons', 2, () => true);
  const car = makeInternedOperation('car', 1, () => true);
  const cdr = makeInternedOperation('cdr', 1, () => true);
  const not = makeInternedOperation('not', 1, () => true);
  const add1 = makeInternedOperation('add1', 1, () => true);
  const plus = makeInternedOperation('+', 2, () => true);
  const times = makeInternedOperation('*', 2, () => true);
  const append = makeInternedOperation('append', 2, () => true);
  const apply1 = makeInternedOperation('apply1', 2, () => true);
  const apply = makeInternedOperation('apply', 2, () => true);

  const synthesizeFromExamples = async (
    args: string[],
    examples: Example[],
    debug: boolean = false,
  ) => {
    const synthesisResults = await synthesizeProgram({
      argumentNames: args,
      examples,
      availableOperations: [
        cons,
        car,
        cdr,
        // not,
        add1,
        // plus,
        // times,
        append,
        // apply1, // TODO Enable
        // apply,
      ],
      environment: currentEnv,
      maxExpressionWeight: 40,
      extraPrimitives: new Set([1]),
      expressionWeightComputation: 'stochastic',
      ignoreInputPrimitives: true,
      ignoreOutputPrimitives: true,
      debugInfo: {
        printExpressionsTested: debug,
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
    return Promise.all(inputObjs.map(async (inputObj) => {
      return new Example(inputObj, await func(inputObj));
    }));
  };

  const enabledExamples = {
    basicAppend: true,
    multiplyAndAppend: true
  };

  if (enabledExamples.basicAppend) {
    await synthesizeFromExamples(
      ['x', 'y'],
      [
        new Example(
          {
            x: stringToAST('(2 3)'),
            y: stringToAST('(4 5)'),
          },
          stringToAST('(2 3 4 5)'),
        ),
        new Example(
          {
            x: stringToAST('(10 20)'),
            y: stringToAST('(30 40)'),
          },
          stringToAST('(10 20 30 40)'),
        ),
      ],
    );
  }
  
  if (enabledExamples.multiplyAndAppend) {
    await synthesizeFromExamples(
      ['x', 'y'],
      [
        new Example(
          {
            x: stringToAST('(2 3)'),
            y: stringToAST('(4 5)'),
          },
          stringToAST('(2 4 5)'),
        ),
        new Example(
          {
            x: stringToAST('(10 20)'),
            y: stringToAST('(30 40)'),
          },
          stringToAST('(10 30 40)'),
        ),
      ],
    );

  }
}

main();
