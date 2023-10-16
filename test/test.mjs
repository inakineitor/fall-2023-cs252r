import { Permutation } from "js-combinatorics";

const gen = new $C.Permutation([{ num: 1}, { num: 2}, { num: 3}], 2);

for (const a of gen) {
  console.log(a);
}
