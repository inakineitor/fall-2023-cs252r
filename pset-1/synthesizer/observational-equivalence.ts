import { evaluateExamples } from './evaluate-examples';
import { Example } from './example';
import { Environment, Expression } from '../interpreter/new-little-scheme';
import { evaluateAST } from '../interpreter/scheme-interpreter';
import _ from 'lodash';

export async function expressionsAreObservationallyEquivalent(
  expressions: Expression[],
  environment: Environment,
): Promise<boolean> {
  const evalOutputs = await Promise.all(
    expressions.map((expr) =>
      evaluateAST(expr, Environment.clone(environment)),
    ),
  );
  for (let i = 0; i < evalOutputs.length - 1; i++) {
    if (!_.isEqual(evalOutputs[i], evalOutputs[i + 1])) {
      return false;
    }
  }
  return true;
}

export async function expressionsAreObservationallyEquivalentUnderExamples(
  expressions: Expression[],
  environment: Environment,
  examples: Example[],
): Promise<boolean> {
  const evalOutputs = await Promise.all(
    expressions.map((expr) => evaluateExamples(expr, examples, environment)),
  );
  for (let i = 0; i < evalOutputs.length - 1; i++) {
    if (
      !_.isEqual(
        evalOutputs[i].outputExpressions,
        evalOutputs[i + 1].outputExpressions,
      )
    ) {
      return false;
    }
  }
  return true;
}
