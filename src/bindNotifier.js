(function () {

  'use strict';

  function bindNotifierDirective () {
    return {
      restrict: 'A',
      scope: true,
      compile: function (element, attributes) {
        var expr = JSON.parse(attributes.bindNotifier.replace(/'/g, '"')),
            keys = Object.keys(expr),
            len  = keys.length;

        return function link (scope) {
          function handler (name, newVal, oldVal, scope) {
            if (newVal !== oldVal) {
              scope.$broadcast(('$$rebind::' + name), newVal, oldVal, scope);
            }
          }

          for (var i = 0; i < len; i++) {
            scope.$watch(expr[keys[i]], handler.bind(null, keys[i]), typeof expr[keys[i]] === 'object');
          }
        };
      }
    };
  }

  angular
    .module('angular-bind-notifier')
    .directive('bindNotifier', bindNotifierDirective);

}());
