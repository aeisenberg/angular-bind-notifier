(function () {

  'use strict';

  describe('bindNotifier {Directive}', function () {
    var $scope, $compile, el, span, createEl, run, broadcaster;

    beforeEach(function () {
      module('angular.bind.notifier');

      inject(function ($injector) {
        $scope   = $injector.get('$rootScope').$new();
        $compile = $injector.get('$compile');

        createEl = function (exprObjs, expression, prefix) {
          exprObjs = exprObjs || [];
          prefix = prefix || '';

          var keys = [], values = [];

          exprObjs.forEach(function (kv) {
            Object.keys(kv).forEach(function (k) {
              keys.push(k);
              values.push(kv[k]);
            });
          });

          var string = '';

          keys.forEach(function (k, i) {
            var joinColon   = (k + ':' + values[i]);
            var splitComma  = ((i >= 0 && keys[keys.length - 1] !== k) ? ',' : '');
            string += joinColon + splitComma;
          });

          var tpl = '<div bind-notifier="{ ' + string + ' }">' +
                      '<span>{{' + prefix + ':' + keys.join(':') + ':' + expression + '}}</span>' +
                    '</div>';

          el          = $compile(tpl)($scope);
          span        = el[0].firstChild;
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
      createEl([{ k1: 'k1Expr', k2: 'k2Expr' }]);
      expect(el.scope()).to.not.equal($scope);
    });

    it('handles spaces before initial key', function () {
      createEl([{ k1: 'k1Expr', k2: 'k2Expr' }], undefined, ' ');
      expect(el.scope()).to.not.equal($scope);
    });

    it('does not update the bound value if the watched expression did not change', function () {
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

      expect(broadcaster).to.have.been.calledOnce.and.calledWith('$$rebind::k1');
    });

    it('binds the childscope value of the watched expression if it exists', function () {
      $scope.dummy = 'y';
      createEl([{ k1: 'k1Expr' }], 'dummy');

      $scope.dummy = 'value';
      el.scope().dummy = 'childValue';
      run('k1Expr');

      expect(span.innerText).to.equal('childValue');
      expect(broadcaster).to.have.been.calledOnce.and.calledWith('$$rebind::k1');
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

      expect(broadcaster).to.have.been.calledTwice.and.calledWithMatch('$$rebind');
    });

    it('sets up a deep watch if the expressions points to an object', function () {
      $scope.obj   = { x: 'y' };
      $scope.dummy = 'yay!';
      createEl([{ k1: 'obj' }], 'dummy');

      $scope.dummy = 'val1';
      $scope.obj.x = 'n';
      $scope.$digest();

      expect(span.innerText).to.equal('val1');
      expect(broadcaster).to.have.been.calledOnce.and.calledWith('$$rebind::k1');
    });

    it('does not broadcast bloat data', function () {
      $scope.dummy = 'y';
      createEl([{ k1: 'k1Expr' }], 'dummy');

      $scope.dummy = 'n';
      run('k1Expr');

      expect(broadcaster).to.have.been.calledOnce.and.calledWith('$$rebind::k1');
    });

    context('object expression', function () {
      context('when terse', function () {
        expectBothSingleAndMultiple('{value:dummy}.value');
      });
      context('when spaces are present', function () {
        expectBothSingleAndMultiple(' { value : dummy }.value ');
      });
    });

    context('array expression', function () {
      context('when terse', function () {
        expectBothSingleAndMultiple('[null,{value:dummy}][1].value');
      });
      context('when spaces are present', function () {
        expectBothSingleAndMultiple(' [ null , { value: dummy } ][1].value ');
      });
    });

    context('directive compatibility', function () {
      var dirs = [
        'ng-class', 'ng-hide', 'ng-show', 'ng-bind', 'ng-if',
        'ng-class-even', 'ng-class-odd', 'ng-pattern'
      ];

      dirs.forEach(function (dir) {
        it(dir + ' does not increase $$listener count exponentially', function () {
          $scope.items = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
          var dom = '<div>' +
                      '<span ng-repeat="i in :f:items" ' + dir + '=":f:i">{{:f:i}}</span>' +
                    '</div>';

          dom = $compile(dom)($scope);
          $scope.$digest();

          rebindAndDigest($scope, 2000);

          var totalCount = $scope.$$listenerCount['$$rebind::f'];

          expect(totalCount).to.be.at.most($scope.items.length * 2 + 1);
        });

        it(dir + ' does not increase $$watcher count to a ridiculous amount', function () {
          $scope.items = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
          var dom = '<div>' +
                      '<span ng-repeat="i in :f:items" ' + dir + '=":f:i">{{:f:i}}</span>' +
                    '</div>';

          dom = $compile(dom)($scope);

          rebindAndDigest($scope, 2000);

          expect(getWatchers(dom).length).to.be.at.most($scope.items.length);
        });
      });
    });

    function expectBothSingleAndMultiple (expression) {
      it('handles a single notifier key', function () {
        createEl([{ k1: 'k1Expr' }], expression);

        $scope.dummy = 'glenn';
        run('k1Expr');

        expect(span.innerText).to.equal('glenn');
      });
      it('handles several notifier keys', function () {
        createEl([{ k1: 'k1Expr' }, { k2: 'k2Expr' }], expression);

        $scope.dummy = 1;
        run('k1Expr');
        expect(span.innerText).to.equal('1');

        $scope.dummy = 2;
        run('k2Expr');
        expect(span.innerText).to.equal('2');
      });
    }

    function getWatchers(root) {
      root = angular.element(root);

      function getElemWatchers(element) {
        var isolateWatchers = getWatchersFromScope(element.data().$isolateScope);
        var scopeWatchers = getWatchersFromScope(element.data().$scope);
        var watchers = scopeWatchers.concat(isolateWatchers);

        angular.forEach(element.children(), function (childElement) {
          watchers = watchers.concat(getElemWatchers(angular.element(childElement)));
        });

        return watchers;
      }

      function getWatchersFromScope(scope) {
        if (scope) {
          return scope.$$watchers || [];
        } else {
          return [];
        }
      }

      return getElemWatchers(root);
    }

    function rebindAndDigest (scope, times) {
      for (var i = 0; i < times; i++) {
        scope.$broadcast('$$rebind::f');
        scope.$digest();
      }
    }
  });

}());
