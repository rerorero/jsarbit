# jsarbit
`jsarbit` is tiny random value generator.

It is not test framework, but you can use with any test library such as `mocha`, `chai` and any other, if you want to property-based test simply.

## Installation

```
npm install jsarbit
```

## Usage

### Example
```
var arb = require('jsarbit');
var assert = require('chai').assert;

describe('example', function() {

  it('Choose one of', function() {
    var values = ['love', 'hate', 'apathy'];
    var enums = arb.gen.oneOf(values);

    arb.forAll(enums, function(v) {
      // value is one of enums.
      assert(values.indexOf(v) >= 0);
    });

  });
});
```

#### gen
`gen` is set of helper functions to create Arbitrary.

* `gen.of(value: any)`
  - Asis `value` generator.


* `int(min: number, max: number)`
* `float(min: number, max: number)`
* `posNum()`
* `posNum(max: number)`
* `negNum()`
* `negNum(min: number)`
  - Generator of numbers in range.


* `array(element: Arbitrary or any value, sizeMin: number, sizeMax: number)`
* `array(element: Arbitrary or any value, sizeMax: number)`
  - Generator of array.
  - Example:
    ```
    var dogOrCatArray = gen.array(choose('dog', 'cat'), 10);
    var someOfPizza = gen.array('pizza', 1, 10);
    ```


* `array(element: Arbitrary or any value, sizeMin: number, sizeMax: number)`
* `array(element: Arbitrary or any value, sizeMax: number)`
  - Generator of array.


* `arrayOfN(size: number, arb: Arbitrary or value)`
  - Generator of array which has `size` number of elements generated by `arb` (or `arb` value if `arb` is not Arbitrary).


* `obj(propArbitrary: object)`
  - Generator of object.
  - `propArbitrary` is object which property takes Arbitrary.
  - Example:
    ```
    var arb = gen.obj({
      name: gen.oneOf("Alice", "Bob"),
      address: {
        country: "Japan",      // No Arbitrary property
        zip: gen.numericStr(3)
      },
    });

    var sample = arb.sample();
    /* {
      name: "Alice",
      address: {
        country: "Japan"    // as it is.
        zip: "491"
      }
    } */
    ```

* `choose(min: number, max: number)`
  - Generator of arbitrary number in range.


* `oneOf(ary: array)`
  - Generator which choose a element of `ary` randomly.


* `bool()`
  - Generator of boolean.


* `alphaLowerChar()`
* `alphaUpperChar()`
* `alphaChar()`
* `numericChar()`
* `alphaNumericChar()`
  - Generator of a char.


* `charSeqOf(arb: Arbitrary which generates of char, minLen, maxLen)`
* `charSeqOf(arb: Arbitrary, minLen)`
  - Generator of string consisted of `arb`'s sample.


* `numericStr(minLen, maxLen)`
* `numericStr(maxLen)`
* `identifier(minLen, maxLen)`
* `identifier(maxLen)`
  - Generator of string.


* `frequency(freq: array)`
  - Chooses one of the given generators with a weighted random distribution.
  - Example
    ```
    var arb = gen.frequency([
      [1, gen.oneOf(['a', 'b', 'c'])],
      [9, gen.choose(1,10)]
    ]);

    forAll(arb, function (value) {
      console.log(value); // char generated 10% of all.
    });
    ```

#### Arbitrary
`Arbitrary` is an arbitrary value generator class.

* `new Arbitrary(sampleFunc: function)`
  - Creates new instance which has `sample()` function as `sampleFunc`.
* `Arbitrary.sample()`
  - Generates arbitrary value.
* `Arbitrary.map(func: function)`
  - Returns new Arbitrary which `sample()` applied `func` to `this.sample()`'s return value.
* `Arbitrary.flatMap(func: function)`
  - Returns new Arbitrary which returned by `func` applied with `this.sample()`'s return value.


#### forAll
function to generate with Arbitrary.

* `forAll(arb: Arbitrary, func: function, count=100)`
  - Call `func` number of `count` times with arbitrary value generated by `arb`.
  - Example
    ```
    forAll(choose(0, 50), function(num) {
      assert(num >= 0 && num <= 50);
    });
    ```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D


## License

MIT