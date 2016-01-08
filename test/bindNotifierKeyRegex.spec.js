(function () {

  'use strict';

  describe('bindNotifier key regex', function () {
    var subject;

    beforeEach(function () {
      module('angular.bind.notifier');

      inject(function ($injector) {
        subject = $injector.get('bindNotifierKeyRegex');
      });
    });

    it('is defined', function () {
      expect(!!subject).to.be.true;
    });

    ['regularKey', '99numberStart', 'allows-dashes', 'CAPITALSAREFINE'].forEach(isMatch);
    ['-noStartingDash', 'contains!InvalidChar', '_invalidChar', '', ' initialWhitespace', 'endingWhitespace ',
      'middle whitespace', '{ object: \'expression\' }', 'ternary ? \'statements\' : \'fail\'', 'property.access'].forEach(isNotMatch);

    // Helpers
    function isMatch (value) {
      it('matches ' + value, function () {
        expect(subject.test(value)).to.be.true;
      });
    }

    function isNotMatch (value) {
      it('does not match ' + value, function () {
        expect(subject.test(value)).to.be.false;
      });
    }
  });

}());
