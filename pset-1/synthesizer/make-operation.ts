import { composeFunction } from '../utils/ast/compose-function.ts';
import {
  Expression,
  Operation,
  Sym,
} from '../interpreter/new-little-scheme.ts';

export function makeInternedOperation(
  functionName: string,
  functionArity: number,
  canApplyTo: (argumentTuple: Expression[]) => boolean,
): Operation {
  return {
    name: functionName,
    arity: functionArity,
    canApplyTo: canApplyTo,
    applyTo(argumentTuple: Expression[]) {
      return composeFunction(Sym.interned(functionName), argumentTuple);
    },
  };
}
