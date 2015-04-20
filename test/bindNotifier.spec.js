(function () {

  'use strict';

  describe('bindNotifier directive', function () {
    var $scope, el, span, createEl, run, broadcaster;

    beforeEach(function () {
      module('angular-bind-notifier');

      inject(function ($compile, $rootScope) {
        $scope = $rootScope.$new();

        createEl = function (exprObjs, expression) {
          var keyExprString = '',
              keys          = [];

          exprObjs = exprObjs || [];

          exprObjs.forEach(function (obj) {
            Object.keys(obj).forEach(function (k) {
              keys.push(k);
            });

            keyExprString += JSON.stringify(obj);
          });

          var template = '<div bind-notifier="' + keyExprString.replace(/"/g, "'") + '">' +
                           '<span>{{:' + keys.join(':') + ':' + expression + '}}</span>' +
                         '</div>';

          el   = $compile(template)($scope);
          span = el[0].children[0];
          broadcaster = sinon.spy(el.scope(), '$broadcast');
          $scope.$digest();
        };

        run = function (val) {
          $scope[val] = !$scope[val];
          $scope.$digest();
        }
      });
    });

    it('creates a child scope', function () {
      createEl([{ k1: 'k1Expr' }]);
      expect(el.scope()).to.not.equal($scope);
    });

    it('does not update the bound value if the watched expression didnt change', function () {
      $scope.dummy = 'y';
      createEl([{ k1: 'k1Expr' }], 'dummy');
      $scope.dummy = 'n';
      $scope.$digest();
      expect(span.innerText).to.equal('y');
    });

    it('updates the bound value if the watched expression changed', function () {
      $scope.dummy = 'y';
      createEl([{ k1: 'k1Expr' }], 'dummy');

      $scope.dummy = 'n';
      run('k1Expr');

      expect(span.innerText).to.equal('n');

      expectBroadcast('once');
    });

    it('binds the childscope value of the watched expression if it exists', function () {
      $scope.dummy = 'y';
      createEl([{ k1: 'k1Expr' }], 'dummy');

      $scope.dummy = 'value';
      el.scope().dummy = 'childValue';
      run('k1Expr');

      expect(span.innerText).to.equal('childValue');
      expectBroadcast('once');
    });

    it('allows multiple notifier keys', function () {
      $scope.dummy = 'y';
      createEl([{ k1: 'k1Expr', k2: 'k2Expr' }], 'dummy');

      $scope.dummy = 'val1';
      run('k1Expr');
      expect(span.innerText).to.equal('val1');

      $scope.dummy = 'val2';
      run('k2Expr');
      expect(span.innerText).to.equal('val2');

      expectBroadcast('twice');
    });

    it('sets up a deep watch if the expressions points to an object', function () {
      $scope.obj   = { x: 'y' };
      $scope.dummy = 'yay!';
      createEl([{ k1: 'obj' }], 'dummy');

      $scope.dummy = 'val1';
      $scope.obj.x = 'n';
      $scope.$digest();

      expect(span.innerText).to.equal('val1');
      expectBroadcast('once');
    });

    function expectBroadcast (times, scope) {
      times = times.charAt(0).toUpperCase() + times.slice(1);

      expect(broadcaster).to.have.been['called' + times]
        .and.calledWithMatch('$$rebind::', sinon.match.any, sinon.match.any, {});
    }
  });

}());
