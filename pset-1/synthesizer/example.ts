import { Expression } from '../interpreter/new-little-scheme.ts';

export type VariableDeclaration = {
  name: string;
  value: Expression;
};

export class Example {
  constructor(
    public inputs: Record<string, Expression>,
    public output: Expression,
  ) {}

  extractInputs(): VariableDeclaration[] {
    return Object.entries(this.inputs).map(([name, value]) => ({
      name,
      value,
    }));
  }

  extractConstants(): Expression {
    return this.output; // TODO Review this assumption
  }
}
