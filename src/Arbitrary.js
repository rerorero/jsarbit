'use strict';

export function isArbitrary(obj) {
  return (typeof obj['sample']) === 'function';
}

export class Arbitrary {

  constructor(sampleFunc) {
    if (typeof sampleFunc !== 'function')
      throw new TypeError('sampleFunc is not a function. ' + sampleFunc);
    this.sample = sampleFunc;
  }

  map(f) {
    const that = this;
    return new Arbitrary(() => {
      return f(that.sample());
    });
  }

  flatMap(f) {
    const that = this;
    return new Arbitrary(() => {
      return f(that.sample()).sample();
    });
  }
}
