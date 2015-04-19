(function () {

  'use strict';

  describe('bindNotifier directive', function () {
    var $scope, el, span, createEl, triggerExpr, run;

    beforeEach(function () {
      module('angular-bind-notifier');

      inject(function ($compile, $rootScope) {
        triggerExpr         = 'triggerExpr';
        $scope              = $rootScope.$new();
        $scope[triggerExpr] = false;

        createEl = function (key, expression) {
          var keyExpression = "'" + key + "':" + " " + "'" + triggerExpr + "'";

          var template = '<div bind-notifier="{' + keyExpression + '}">' +
                           '<span>{{:' + key + ':' + expression + '}}</span>' +
                         '</div>';

          el   = $compile(template)($scope);
          span = el[0].children[0];
          $scope.$digest();
        };

        run = function () {
          $scope[triggerExpr] = !$scope[triggerExpr];
          $scope.$digest();
        }
      });
    });

    it('creates a child scope', function () {
      createEl();
      expect(el.scope()).to.not.equal($scope);
    });

    it('does not update the bound value if the watched expression didnt change', function () {
      $scope.dummy = 'y';
      createEl('k1', 'dummy');
      $scope.dummy = 'n';
      $scope.$digest();
      expect(span.innerText).to.equal('y');
    });

    it('updates the bound value if the watched expression changed', function () {
      $scope.dummy = 'y';
      createEl('k1', 'dummy');
      $scope.dummy = 'n';
      run();
      expect(span.innerText).to.equal('n');
    });

    it('binds the childscope value of the watched expression if it exists', function () {
      $scope.dummy = 'y';
      createEl('k1', 'dummy');
      $scope.dummy = 'value';
      el.scope().dummy = 'childValue';
      run();
      expect(span.innerText).to.equal('childValue');
    });
  });

}());
