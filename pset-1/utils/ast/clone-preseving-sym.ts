import _ from 'lodash';

import { Sym } from '../../interpreter/new-little-scheme.ts';

export function clonePreservingSym(object: unknown) {
  return _.cloneDeepWith(object, (val) => {
    if (val instanceof Sym) {
      return val;
    }
  });
}
