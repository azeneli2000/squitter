var _ = require('lodash'),
  timeframeToSeconds = require('..');

function assertEqual(actual, expected) {
  if (actual !== expected && isNaN(actual) !== isNaN(expected)) {
    throw new Error(
      'Expected ' + expected + ' (' + typeof expected + '), but got ' + actual + ' (' + typeof actual + ')!'
    );
  }
}

describe('Valid inputs', function() {
  describe('String', function() {
    _.each(
      {
        '1': 1,
        '1s': 1,
        '10': 10,
        '15s': 15,
        '1m': 60,
        '3m': 180,
        '1h': 3600,
        '2h': 7200,
        '12h': 43200,
        '1d': 86400,
        '1w': 604800
      },
      function(expectedSeconds, input) {
        it(input + ' => ' + expectedSeconds, function() {
          assertEqual(timeframeToSeconds(input), expectedSeconds);
        });
      }
    );
  });

  describe('Number', function() {
    _.each(
      [ 0, 1, 1729, Infinity ],
      function(num) {
        it(num + ' => ' + num, function() {
          assertEqual(timeframeToSeconds(num), num);
        });
      }
    );
  });
});

describe('Bad inputs', function() {
  _.each(
    [ null, undefined, true, false, NaN, '', 'a', function() {}, {}, [] ],
    function(input) {
      it(input + ' => NaN', function() {
        assertEqual(timeframeToSeconds(input), NaN);
      });
    }
  );
});
