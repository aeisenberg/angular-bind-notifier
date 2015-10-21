(function () {

  function ctrl ($scope, $element, $interval, $timeout) {
    var int1, int2, int3;
    var w = [];
    var running = false;

    $scope.elCounter = 0;
    $scope.els  = [];
    $scope.rebind = false;

    $timeout(function () {
      $scope.watchCount = f($element);
    });

    /**
     * Watcher Count func
     */
    function f (el) {
      if (el.data().hasOwnProperty('$scope')) {
        angular.forEach(el.data().$scope.$$watchers, function (watcher) {
          w.push(watcher);
        });
      }

      angular.forEach(el.children(), function (childElement) {
        f(angular.element(childElement));
      });

      return _.uniq(w).length;
    }

    $scope.kill = function () {
      console.log(running);
      if (!running) { return; }

      running = false;

      $scope.els = [];
      $scope.elCounter = 0;
      $interval.cancel(int1);
      $interval.cancel(int2);

      if (int3) {
        $interval.cancel(int3);
      }

      $timeout(function () {
        w = [];
        $scope.watchCount = f($element);
        $scope.rebind = !$scope.rebind;
      });
    };

    $scope.start = function (shuffle) {
      if (running) { return; }

      running = true;

      int1 = $interval(function () {
        $scope.els.push($scope.elCounter);
        $scope.elCounter++;
      });

      if (shuffle) {
        int3 = $interval(function () {
          $scope.els = _.shuffle($scope.els);
        });
      }

      int2 = $interval(function () {
        $scope.watchCount = f($element);
        $scope.rebind = !$scope.rebind;
      }, 1000);
    };
  }

  angular
    .module('bn', [ 'angular.bind.notifier' ])
    .controller('ctrl', ctrl);

}());
