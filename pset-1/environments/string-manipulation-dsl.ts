import { isNumeric } from '../interpreter/arithmetic.ts';
import {
  Environment,
  Intrinsic,
  List,
} from '../interpreter/new-little-scheme.ts';
import { generateMultiFunctionEnvironment } from '../utils/ast/function-declaration.ts';

function left(x: List) {
  if (x === null) return null;
  const str = x.fst as string;
  const n = x.snd as number;
  if (typeof str !== 'string')
    throw new TypeError(`Expected str to be string, got ${typeof str}`);
  if (!isNumeric(n)) {
    throw new TypeError(`Expected n to be number, got ${typeof n}`);
  }
  return str.slice(0, Number(n));
}

function right(x: List) {
  if (x === null) return null;
  const str = x.fst as string;
  const n = x.snd as number;
  if (typeof str !== 'string')
    throw new TypeError(`Expected str to be string, got ${typeof str}`);
  if (typeof n !== 'number' && typeof n !== 'bigint') {
    throw new TypeError(`Expected n to be number, got ${typeof n}`);
  }
  return str.slice(str.length - Number(n));
}

function concatenate(x: List) {
  if (x === null) return null;
  const str1 = x.fst as string;
  const str2 = x.snd as string;
  if (typeof str1 !== 'string')
    throw new TypeError(`Expected str1 to be string, got ${typeof str1}`);
  if (typeof str2 !== 'string')
    throw new TypeError(`Expected str2 to be string, got ${typeof str2}`);
  return `${str1}${str2}`;
}

// function right(x: List) {
//   if (x === null) return null;
//   const str = x.fst as List;
//   const n = x.snd as number;
//   const strLength = str.length;
//   if (n > strLength) {
//     return str;
//   }
//   let newRoot = str;
//   for (let i = 0; i < strLength - n; i++) {
//     newRoot = newRoot.cdr as List;
//   }
//   return newRoot; // TODO Check the memory of this
// }

function strLength(x: List) {
  if (x === null) return 0;
  const str = x.fst as string;
  return str.length;
}

export const createStringManipulationDslEnvironment = async () => {
  // Null environment wrapper marks the end of the environment chain when printing debug info
  const env = new Environment(
    null,
    null,
    generateMultiFunctionEnvironment([
      new Intrinsic('left', 2, left),
      new Intrinsic('right', 2, right),
      new Intrinsic('concatenate', 2, concatenate),
      new Intrinsic('strLength', 1, strLength),
    ]),
  );
  return env;
};
