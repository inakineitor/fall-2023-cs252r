import _ from 'lodash';
import {
  Environment,
  Intrinsic,
  IntrinsicBody,
  c,
} from '../../interpreter/new-little-scheme.ts';

export function generateFunctionEnvironment(intrinsicDeclaration: Intrinsic) {
  return c(
    intrinsicDeclaration.name,
    intrinsicDeclaration.arity,
    intrinsicDeclaration.fun,
    null,
  );
}

export function composeEnvironments(environments: Environment[]): Environment {
  const clonedEnvs = environments.map((env) => Environment.clone(env));
  for (let i = 0; i < clonedEnvs.length - 1; i++) {
    let current = clonedEnvs[i];
    while (current.next !== null) {
      current = current.next;
    }
    current.next = clonedEnvs[i + 1];
  }
  return clonedEnvs[0];

  // return environments.reduce(
  //   (bigEnv: Environment | null, currEnv: Environment) => {
  //     let newBigEnv = currEnv;
  //     while (newBigEnv.next !== null) {
  //       newBigEnv = newBigEnv.next;
  //     }
  //     newBigEnv.next = bigEnv;
  //     return currEnv;
  //   },
  //   null,
  // );
}

export function generateMultiFunctionEnvironment(
  intrinsicDeclarations: Intrinsic[],
) {
  const environments = intrinsicDeclarations.map(generateFunctionEnvironment);
  return composeEnvironments(environments);
}
