(function () {

  'use strict';

  describe('bindNotifier regex', function () {
    var subject;

    beforeEach(function () {
      module('angular.bind.notifier');

      inject(function ($injector) {
        subject = $injector.get('bindNotifierRegex');
      });
    });

    it('is defined', function () {
      expect(!!subject).to.be.true;
    });

    [':key:expr', ':999:expr', ':KEY:expr', ':key:-123'].forEach(isMatch);
    [':keyexpr', 'key:expr', ':key:', '::key:expr'].forEach(isNotMatch);

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
