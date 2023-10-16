import {
  Environment,
  Expression,
  evaluate,
  readFromTokens,
  readStringFrom,
  splitStringIntoTokens,
} from './new-little-scheme.ts';

export function tokenize(sourceCode: string): string[] {
  return splitStringIntoTokens(sourceCode);
}

export function buildAST(tokens: string[]): Expression {
  return readFromTokens(tokens) as Expression;
}

export function stringToAST(sourceCode: string): Expression {
  return buildAST(tokenize(sourceCode));
}

export async function evaluateAST(
  ast: Expression,
  env: Environment,
): Promise<Expression> {
  return evaluate(ast, env) as Promise<Expression>;
}

export async function evaluateString(
  sourceCode: string,
  env: Environment,
): Promise<Expression> {
  return evaluateAST(stringToAST(sourceCode), env);
}
