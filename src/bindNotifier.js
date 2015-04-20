(function () {

  'use strict';

  function bindNotifierDirective () {
    return {
      restrict: 'A',
      scope: true,
      compile: function (element, attributes) {
        var expr = JSON.parse(attributes.bindNotifier.replace(/'/g, '"')),
            keys = Object.keys(expr);

        return function link (scope) {
          function handler (key, newVal, oldVal) {
            if (newVal !== oldVal) {
              scope.$broadcast(('$$rebind::' + key), newVal, oldVal, scope);
            }
          }

          keys.forEach(function (key) {
            scope.$watch(expr[key], handler.bind(null, key), typeof scope[expr[key]] === 'object');
          });
        };
      }
    };
  }

  angular
    .module('angular-bind-notifier')
    .directive('bindNotifier', bindNotifierDirective);

}());
