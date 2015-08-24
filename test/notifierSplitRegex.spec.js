(function () {

  'use strict';

  describe('notifierSplitRegex regex', function () {
    var subject, result;

    beforeEach(function () {
      module('angular.bind.notifier');

      inject(function ($injector) {
        subject = $injector.get('notifierSplitRegex');
      });
    });

    it('is defined', function () {
      expect(!!subject).to.be.true;
    });

    it('splits at :', function () {
      execute('asdf:qwer');
      expect(result).to.eql(['asdf', 'qwer']);
    });

    it('handles multiple notifiers', function () {
      execute('asdf:qwer:foo:bar');
      expect(result).to.eql(['asdf', 'qwer', 'foo', 'bar']);
    });

    it('does not split when : is followed by whitespace', function () {
      execute('asdf:qwer:wat: nope');
      expect(result).to.eql(['asdf', 'qwer', 'wat: nope']);
    });

    it('handles object literals', function () {
      execute('asdf:qwer:{x: y}');
      expect(result).to.eql(['asdf', 'qwer', '{x: y}']);
    });

    it('handles an object literal with multiple properties', function () {
      execute('asdf:qwer:{x: foo, y: bar, z: baz}');
      expect(result).to.eql(['asdf', 'qwer', '{x: foo, y: bar, z: baz}']);
    });

    xit('does not handle object literals that lack spaces', function () {
      execute('asdf:qwer:{x:y}');
      expect(result).to.eql(['asdf', 'qwer', '{x:y}']);
    });

    // Helper
    function execute (expression) {
      result = expression.split(subject);
    }
  });

}());
