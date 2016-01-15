'use strict';

import {Arbitrary, isArbitrary} from './Arbitrary';

function of(value) {
  return new Arbitrary(() => value);
}

function int(min, max) {
  if (typeof min !== 'number')
    throw new TypeError('min is not a number.:' + min);
  if (typeof max !== 'number')
    throw new TypeError('max is not a number.:' + max);

  // TODO use frequency() to generate prefer min, max, 0, 1, -1
  return new Arbitrary(() => {
    return Math.floor( Math.random() * (max - min + 1)) + min;
  });
}

function float(min, max) {
  if (typeof min !== 'number')
    throw new TypeError('min is not a number.:' + min);
  if (typeof max !== 'number')
    throw new TypeError('max is not a number.:' + max);

  // TODO use frequency() to generate prefer min, max, 0, 1, -1
  return new Arbitrary(() => {
    return Math.random() * (max - min) + min;
  });
}

function array(element, sizeMin, sizeMax) {
  if (typeof sizeMax === 'undefined')
    sizeMax = sizeMin;
  if (typeof sizeMin !== 'number' || typeof sizeMax !== 'number')
    throw new TypeError('Not number:' + sizeMin + ', ' + sizeMax);
  if (sizeMin < 0 || (sizeMin > sizeMax))
    throw new RangeError('Wrong size specified.' + sizeMin + ', ' + sizeMax);

  if (!isArbitrary(element))
    element = of(element);

  return choose(sizeMin, sizeMax).map((size) => {
    return Array.apply(null, new Array(size)).map(() => element.sample());
  });
}

function reduceObjectArbitrary(arbMap) {
  return Object.keys(arbMap).reduce((acc, key) => {
    const value = arbMap[key];
    if (typeof value === 'object' && !Array.isArray(value)) {
      if (isArbitrary(value)) {
        acc[key] = value.sample();
      } else {
        const sub = reduceObjectArbitrary(value);
        acc[key] = sub;
      }
    } else {
      acc[key] = value;
    }
    return acc;
  }, {});
}

/**
 * object generator
 * @param {Object} propArbitraries - arbitrary map,
 */
function obj(propArbitrary) {
  return new Arbitrary(() => {
    return reduceObjectArbitrary(propArbitrary);
  });
}

function choose(...range) {
  let min, max;
  if (range.length === 1) {
    min = 0;
    max = range[0];
  } else if (range.length === 2) {
    min = range[0];
    max = range[1];
  } else {
    throw new TypeError('Spacify range (max) or (min, max).');
  }

  if (typeof min !== 'number')
    throw new TypeError('Invalid max argument.');
  if (typeof max !== 'number')
    throw new TypeError('Invalid min argument.');

  if (Number.isInteger(min) && Number.isInteger(max)) {
    return int(min, max);
  } else {
    return float(min, max);
  }
}

function oneOf(ary) {
  if (!Array.isArray(ary))
    throw new TypeError('Invalid argument, not an Array.:' + ary);
  if (ary.length === 0)
    throw new TypeError('Empty array.');

  return choose(0, ary.length - 1).map((i) => {
    return ary[i];
  });
}

function arrayOfN(size, arbitrary) {
  return array(arbitrary, size);
}

function bool() {
  return oneOf([true, false]);
}

const chars = {
  lowerAlpha: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  upperAlpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  numeric: '0123456789'.split('')
};

const alphaLowerChar = oneOf(chars.lowerAlpha);
const alphaUpperChar = oneOf(chars.upperAlpha);
const alphaChar = oneOf(chars.lowerAlpha.concat(chars.upperAlpha));
const numericChar = oneOf(chars.numeric);
const alphaNumericChar = oneOf(chars.numeric.concat(chars.lowerAlpha, chars.upperAlpha));

function charSeqOf(charSet, minLen = 1, maxLen = 10) {
  if (typeof maxLen === 'undefined')
    maxLen = minLen;
  if (typeof minLen !== 'number' || typeof maxLen !== 'number')
    throw new TypeError('Not number:' + minLen + ', ' + maxLen);
  if (minLen < 0 || (minLen > maxLen))
    throw new RangeError('Wrong length specified.' + minLen + ', ' + maxLen);

  if (Array.isArray(charSet)) {
    charSet = oneOf(charSet);
  } else if (!isArbitrary(charSet)) {
    throw new TypeError('charSet is not array and Arbitrary:' + charSet);
  }

  return choose(minLen, maxLen)
    .flatMap((len) => arrayOfN(len, charSet))
    .map((seq) => seq.join(''));
}

function identifier(minLen = 1, maxLen = 10) {
  if (typeof maxLen === 'undefined')
    maxLen = minLen;
  if (minLen < 0 || (minLen > maxLen))
    throw new RangeError('Wrong length specified.' + minLen + ', ' + maxLen);

  const head = alphaChar;

  if (maxLen > 1) {
    const tailMinLen = (minLen > 0) ? minLen - 1 : 0;
    return head.flatMap((h) => {
      return charSeqOf(alphaNumericChar, tailMinLen, maxLen-1)
        .map((t) => h + t);
    });

  } else {
    return head;
  }
}

function numericStr(minLen = 1, maxLen = 10) {
  return charSeqOf(numericChar, minLen, maxLen);
}

function posNum(max = Number.MAX_VALUE) {
  return new int(0, max);
}

function negNum(min = Number.MIN_VALUE) {
  return new int(min, 0);
}

function searchFreqArbs(arbFreqs, freq) {
  // TODO Better to use a binary search Tree
  for(var arbFreq of arbFreqs) {
    const [w, arb] = arbFreq;
    if (freq <= w) {
      return arb;
    }
  }
  return arbFreqs[arbFreqs.length - 1][1];
}

/**
 * With a weighted random ditribution
 * @param  {Array} ratioArray Array of tuple, weight and arbitrary or value,
 * @return {Arbitrary} Arbitrary
 */
function frequency(ratioArray) {
  if (!Array.isArray(ratioArray) || ratioArray.length === 0)
    throw new TypeError('Invalid ratioArray. It takes Array of pair which has weight and value, or arbitrary.');

  const [total, arbs] = ratioArray.reduce((acc, ratio, i) => {
    const [total, arbs] = acc;

    if (!Array.isArray(ratio) || typeof ratio[0] !== 'number' || ratio.length != 2)
      throw new TypeError('Invalid ratioArray. It takes Array such as [[number, Arbitrary], [number, Arbitrary], ...]');

    if (ratio[0] <= 0) {
      console.warn('Index of ' + i + ' has no weight');
      return acc;
    }

    let arb;
    if (isArbitrary(ratio[1])) {
      arb = ratio[1];
    } else {
      arb = of(ratio[1]);
    }

    const newTotal = total + ratio[0];
    arbs.push([newTotal, arb]);
    return [newTotal, arbs];
  }, [0, []]);

  return choose(1, total).flatMap((freq) => {
    const natoring = searchFreqArbs(arbs, freq);
    return natoring;
  });
}

const gen = {
  of,
  int,
  float,
  array,
  obj,
  choose,
  oneOf,
  arrayOfN,
  bool,
  charSeqOf,
  identifier,
  numericStr,
  alphaLowerChar,
  alphaUpperChar,
  alphaChar,
  numericChar,
  alphaNumericChar,
  posNum,
  negNum,
  chars,
  frequency
};

export default gen;
