import {
  Cell,
  Expression,
  Intrinsic,
  List,
  Sym,
} from '../../interpreter/new-little-scheme.ts';

// ! This function assumes that the argumentTuples is valid (i.e., its applicability has been verified beforehand)
export function composeFunction(
  functionExpression: Expression,
  argumentTuple: Expression[],
): Expression {
  let argumentsCell: List = null;
  for (let i = argumentTuple.length - 1; i >= 0; i--) {
    argumentsCell = new Cell(argumentTuple[i], argumentsCell);
  }
  return new Cell(functionExpression, argumentsCell);
}
