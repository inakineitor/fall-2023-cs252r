import {
  printSynthesisResults,
  synthesizeProgram,
} from '../../synthesizer/bottom-up-synthesizer.ts';
import { createSchemeSubsetEnvironment } from '../../environments/scheme-subset-env.ts';
import { Example } from '../../synthesizer/example.ts';
import {
  GlobalEnv as globalEnv,
  Environment,
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

  const left = makeInternedOperation('left', 2, () => true);
  const right = makeInternedOperation('right', 2, () => true);
  const concatenate = makeInternedOperation('concatenate', 2, () => true);
  const strLength = makeInternedOperation('strLength', 1, () => true);

  const synthesizeFromExamples = async (
    args: string[],
    examples: Example[],
    debug: boolean = false,
  ) => {
    const synthesisResults = await synthesizeProgram({
      argumentNames: args,
      examples,
      availableOperations: [left, right, concatenate, strLength],
      environment: currentEnv,
      maxExpressionWeight: 40,
      extraPrimitives: new Set([
        stringToAST('" "'),
        1,
      ]),
      expressionWeightComputation: 'naive',
      ignoreInputPrimitives: true,
      ignoreOutputPrimitives: true,
      debugInfo: {
        printExpressionsTested: debug,
        printEvaluationErrors: false,
      },
    });

    printSynthesisResults(synthesisResults);
  };


  const firstLetter = true;
  const lastLetter = true;
  const simpleConcatenate = true;
  const concatenateWithSpace = true;
  const concatenateLeftRight = true;


  // input/output examples:
  // "hello" -> "h"
  // "world" -> "w"
  // arguments: x
  // solution: Left(input(x), 1)

  if (firstLetter) {
    await synthesizeFromExamples(
      ['x'],
      [
        new Example(
          {
            x: 'hello',
          },
          'h',
        ),
        new Example(
          {
            x: 'world',
          },
          'w',
        ),
      ],
    );
  }

  // input/output examples:
  // "hello" -> "o"
  // "world" -> "d"
  // arguments: x
  // solution: Right(input(x), 1)

  if (lastLetter) {
    await synthesizeFromExamples(
      ['x'],
      [
        new Example(
          {
            x: 'hello',
          },
          'o',
        ),
        new Example(
          {
            x: 'world',
          },
          'd',
        ),
      ],
    );
  }

  // input/output examples:
  // "hello", "you" -> "helloyou"
  // "world", "domination" -> "worlddomination"
  // arguments: x, y
  // solution: Concatenate(input(x), input(y))

  if (simpleConcatenate) {
    await synthesizeFromExamples(
      ['x', 'y'],
      [
        new Example(
          {
            x: 'hello',
            y: 'you',
          },
          'helloyou',
        ),
        new Example(
          {
            x: 'world',
            y: 'domination',
          },
          'worlddomination',
        ),
      ],
    );
  }

  // input/output examples:
  // "hello", "you" -> "hello you"
  // "world", "domination" -> "world domination"
  // arguments: x, y
  // solution: Concatenate(Concatenate(input(x), " "), input(y))

  if (concatenateWithSpace) {
    await synthesizeFromExamples(
      ['x', 'y'],
      [
        new Example(
          {
            x: 'hello',
            y: 'you',
          },
          'hello you',
        ),
        new Example(
          {
            x: 'world',
            y: 'domination',
          },
          'world domination',
        ),
      ],
    );
  }

  // input/output examples:
  // "hello" -> "ho"
  // "world" -> "wd"
  // "domination" -> "dn"
  // arguments: x
  // solution: Concatenate(Left(input(x), 1), Right(input(x), 1))

  if (concatenateLeftRight) {
    const examples = [
      new Example(
        {
          x: 'hello',
        },
        'ho',
      ),
      new Example(
        {
          x: 'world',
        },
        'wd',
      ),
      new Example(
        {
          x: 'domination',
        },
        'dn',
      ),
    ];
    await synthesizeFromExamples(['x'], examples);
  }
}

main();
