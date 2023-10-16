import { Example } from './example.ts';
import {
  Environment,
  Expression,
  Sym,
} from '../interpreter/new-little-scheme.ts';
import { evaluateAST } from '../interpreter/scheme-interpreter.ts';
import { composeEnvironments } from '../utils/ast/function-declaration.ts';
import _ from 'lodash';

export async function evaluateExample(
  expression: Expression,
  example: Example,
  environment: Environment,
): Promise<Expression> {
  const argumentEnvironmentDeclarations = example
    .extractInputs()
    .map(({ name, value }) => new Environment(Sym.interned(name), value)); // TODO Map through example inputs and add to environment

  const clonedEnvironment = composeEnvironments([
    ...argumentEnvironmentDeclarations,
    environment,
  ]);
  return evaluateAST(expression, clonedEnvironment);
}

export type EvaluatedExamples = {
  solutionFound: boolean;
  outputExpressions: Expression[];
};

export async function evaluateExamples(
  programAst: Expression,
  examples: Example[],
  environment: Environment,
): Promise<EvaluatedExamples> {
  const outputExpressions = await Promise.all(
    examples.map((example) =>
      evaluateExample(programAst, example, environment),
    ),
  );

  const solutionFound = examples.every((example, idx) =>
    _.isEqualWith(
      example.output,
      outputExpressions[idx],
      (a: unknown, b: unknown) => {
        if (typeof a === 'bigint' || typeof a === 'bigint') {
          return a == b; // Compare weakly in case the other value is a non-bigint number
        }
      },
    ),
  );

  return {
    solutionFound,
    outputExpressions: outputExpressions,
  };
}
