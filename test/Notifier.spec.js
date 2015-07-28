(function () {

  'use strict';

  describe('$Notifier {Service}', function () {
    var $Notifier, $scope, $rootScope;

    beforeEach(function () {
      module('angular.bind.notifier');

      inject(function ($injector) {
        $Notifier    = $injector.get('$Notifier');
        $rootScope   = $injector.get('$rootScope');
        $scope       = $rootScope.$new();
      });
    });

    it('is defined', function () {
      expect($Notifier).to.be.a('function');
    });

    it('returns a constructor fn', function () {
      var x = new $Notifier($scope, {});
      var y = new $Notifier($scope, {});
      expect(x).to.not.eq(y);
    });

    it('expects a $scope as its first parameter', function () {
      function fn () {
        return $Notifier();
      }

      expect(fn).to.throw(Error, 'No $scope given');
    });

    it('expects an object as its second parameter', function () {
      function fn () {
        return $Notifier($scope);
      }

      expect(fn).to.throw(Error, 'No notifier object given');
    });

    it('sets up a watcher on the given $scope for each given value', function () {
      expect($scope.$$watchers).to.eq(null);
      new $Notifier($scope, { k: 'v', k2: 'v2' });
      expect($scope.$$watchers.length).to.eq(2);
      expect($scope.$$watchers[0].exp).to.eq('v2');
      expect($scope.$$watchers[1].exp).to.eq('v');
    });

    it('sends out a $$rebind::{key} notification when $scope[value] changes', function () {
      var spy = sinon.spy($scope, '$broadcast');
      $scope.x = 'y';

      new $Notifier($scope, { k: 'x' });
      $scope.$digest();

      $scope.x = 'z';
      $scope.$digest();

      expect(spy).to.have.been.calledOnce.and.calledWith('$$rebind::k');
    });

    it('sets up a deep watch if $scope[value] is an object', function () {
      var spy = sinon.spy($scope, '$broadcast');

      $scope.x = { x: 'y' };
      new $Notifier($scope, { k: 'x' });
      $scope.$digest();

      $scope.x.x = 'z';
      $scope.$digest();

      expect(spy).to.have.been.calledOnce.and.calledWith('$$rebind::k');
    });
  });

}());
