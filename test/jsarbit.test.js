/* global describe, it */
'use strict';
import * as arbit from './';
import chai from 'chai';
const assert = chai.assert;

describe('arbit', () => {

  describe('choose', () => {

    it('generates numbers in range', () => {
      const arb = arbit.gen.choose(0, 50);
      arbit.forAll(arb, (num) => {
        assert(num >= 0 && num <= 50);
      });
    });

    it('generates negative numbers in range', () => {
      const arb = arbit.gen.choose(-100, -20);
      arbit.forAll(arb, (num) => {
        assert(num >= -100 && num <= -20);
      });
    });

  });

  describe('oneOf', () => {
    const enums = ['get', 'the', 'chance'];

    it('generates values of enums', () => {
      const arb = arbit.gen.oneOf(enums);
      arbit.forAll(arb, (v) => {
        assert(enums.indexOf(v) >= 0);
      });
    });
  });

  describe('arrayOfN', () => {
    const enums = ['dont', 'go', 'away'];

    it('generates array of oneOf generator', () => {
      const arb = arbit.gen.arrayOfN(10, arbit.gen.oneOf(enums));
      arbit.forAll(arb, (ary) => {
        assert(ary.length === 10);
        ary.forEach((v) => assert(enums.indexOf(v) >= 0));
      });
    });

    it('generates array of value', () => {
      const arb = arbit.gen.arrayOfN(10, 'love');
      arbit.forAll(arb, (ary) => {
        assert(ary.length === 10);
        ary.forEach((v) => assert(v === 'love'));
      });
    });
  });

  describe('identifier', () => {
    it('generates generic alphanumeric strings.', () => {
      const arb = arbit.gen.identifier(3, 10);
      arbit.forAll(arb, (s) => {
        assert(s.length >= 3 && s.length <= 10 );
        assert(s.match(/[a-zA-Z0-9]*/) !== null);
      });
    });
  });

  describe('object', () => {
    it('generates objects from arbit map.', () => {
      const arbMap = {
        You: {
          are: arbit.gen.oneOf(["cool", "shit"])
        },
        score: arbit.gen.choose(0, 100),
        asis: {
          num: 1,
          ary: [1,2,3]
        }
      };
      const arb = arbit.gen.obj(arbMap);
      arbit.forAll(arb, (o) => {
        assert(['cool', 'shit'].indexOf(o.You.are) >= 0);
        assert(o.score >= 0 && o.score <= 100);
        assert.deepEqual(o.asis, arbMap.asis);
      });
    });
  });

  describe('frequency', () => {

    it('generates deviation.', () => {
      const freq = [
        [10, 'ten'],
        [1, 'one'],
        [5, 'five'],
        [3, 'trhee']
      ];
      const arb = arbit.gen.frequency(freq);

      var [total, ratioBase] = freq.reduce((acc, pair) => {
        const [accTotal, accBase] = acc;
        accTotal[pair[1]] = 0;
        return [accTotal, accBase + pair[0]];
      }, [{}, 0]);

      const count = ratioBase * 10000;

      arbit.forAll(arb, (v) => {
        total[v] = total[v] + 1;
      }, count);

      const actualRatio = Object.keys(total).reduce((acc, k) => {
        acc[k] = total[k] / count * ratioBase;
        return acc;
      }, {});
      console.log(actualRatio);

      freq.forEach((pair) => {
        const key = pair[1];
        const min = pair[0]-1;
        const max = pair[0]+1;
        assert(min < actualRatio[key]);
        assert(max > actualRatio[key]);
      });
    });

    it('generates with arbitraries', () => {
      const freq = [
        [1, arbit.gen.oneOf(['a', 'b', 'c'])],
        [9, arbit.gen.int(1,10)]
      ];
      const ratioBase = 10;
      const count = ratioBase * 10000;
      const arb = arbit.gen.frequency(freq);
      var total = {number:0, string:0};
      arbit.forAll(arb, (v) => {
        const k = typeof v;
        total[k] = total[k] + 1;
      }, count);

      const actualString = total.string / count * ratioBase;
      const actualNumber = total.number / count * ratioBase;
      assert(0 < actualString && actualString < 2);
      assert(8 < actualNumber && actualNumber < 10);
    });
  });
});
