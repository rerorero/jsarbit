'use strict';

export default function forAll(arbitrary, func, count = 100) {
  if (typeof func !== 'function')
    throw new TypeError('Not a function. ' + func);

  while(count > 0) {
    func(arbitrary.sample());
    count--;
  }
}
