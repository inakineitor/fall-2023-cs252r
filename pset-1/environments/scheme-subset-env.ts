import { Numeric, add } from '../interpreter/arithmetic.ts';
import {
  Cell,
  Environment,
  ErrorException,
  Intrinsic,
  List,
  loadSchemeDefinitions,
} from '../interpreter/new-little-scheme.ts';
import { generateMultiFunctionEnvironment } from '../utils/ast/function-declaration.ts';

// Implement add1 -> Modify add to have arity 1 and only add 1
// Implement append -> Traditional append, arity 2 and appends the two lists
// Implement apply1 -> Not sure
// Implement apply -> basically reduce in JS

function add1(x: List) {
  return add(x?.fst as Numeric, 1);
}

function append(x: List) {
  if (x == null) return null;
  const list1 = x.fst as List;
  const list2 = x.snd as List;
  if (list1 === null) {
    return list2;
  }

  return new Cell(
    list1.car,
    append(new Cell(list1.cdr, new Cell(list2, null))),
  );
}

function apply1(x: List) {
  // ! Revise function implementation
  if (x == null) return null;
  return new Cell(x.fst, x.snd); // TODO Ask Nada what this does
}

// ! Turns out it is already defined
// function apply(x: List) {
//   if (x == null) return null;
//   const intrinsic = x?.fst as Intrinsic;
//   const args = x?.snd as Cell;
//   if (args.length !== intrinsic.arity) {
//     throw new ErrorException('Arity mismatch', x);
//   }
//   return intrinsic.fun(args);
// }

export const createSchemeSubsetEnvironment = async () => {
  // Null environment wrapper marks the end of the environment chain when printing debug info
  const env = new Environment(
    null,
    null,
    generateMultiFunctionEnvironment([
      // new Intrinsic('add1', 1, add1),
      new Intrinsic('append', 2, append),
      new Intrinsic('apply1', 1, apply1),
      // new Intrinsic('apply', 2, apply),
    ]),
  );
  const envWithSchemeDefinitions = await loadSchemeDefinitions(
    './environments/scheme-subset-defs.scm',
    env,
  );
  return envWithSchemeDefinitions;
};
