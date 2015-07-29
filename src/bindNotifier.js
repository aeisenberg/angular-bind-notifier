/**
 * @license Kasper Lewau
 * (c) 2015 Kasper Lewau https://github.com/kasperlewau
 * License: MIT
 */

(function () {

  'use strict';

  /**
   * @ngdoc method
   * @name  setupNotifier
   * @kind function
   * @description
   *
   * Utility method to setup watcher(s) on the given scope
   * and register a $broadcast callback for the watcher(s).
   *
   * @param {Object} scope - the scope to attach watchers and broadcast from
   * @param {Object} notifierMap - key:value mapping of notifiers and expressions to watch.
   */
  function setupNotifier (scope, notifierMap) {
    function handler (notifierKey, newValue, oldValue) {
      if (newValue !== oldValue) {
        scope.$broadcast('$$rebind::' + notifierKey);
      }
    }

    Object.keys(notifierMap).forEach(function (k) {
      scope.$watch(
        notifierMap[k],
        handler.bind(null, k),
        typeof scope[notifierMap[k]] === 'object'
      );
    });
  }

  /**
   * @ngdoc method
   * @name dynamicWatcher
   * @kind function
   * @description
   *
   * Utility method that extends a regular oneTimeWatchDelegate function with
   * scope listeners for each of the given notifier keys. When an event in the format of
   * '$$rebind::[notifierKey]' is caught in the associated $scope, a oneTimeWatchDelegate
   * will be called with the original options and reevaluate the given expression.
   *
   * @param {String|Function} expr - The expression to evaluate. Can be either a string or a function.
   * @param {Array} notifierKeys - An array of keys to setup $on listeners for.
   *
   * @returns {Function} wrap - A decorated oneTimeWatchDelegate function.
   */
  function dynamicWatcher (expr, notifierKeys) {
    function wrap (watchDelegate, scope, listener, objectEquality, parsedExpression) {
      var delegateCall = watchDelegate.bind(this, scope, listener, objectEquality, parsedExpression);

      notifierKeys.forEach(function (n) {
        scope.$on('$$rebind::' + n, delegateCall);
      });

      delegateCall();
    }

    return wrap.bind(this, expr.$$watchDelegate);
  }

  /**
   * Decorate the $parse service to allow
   * for the bind-notifier binding syntax set up by the bindNotifierRegex
   * to be used in the given application.
   *
   * @example
   *
   * ## Single Notifiers
   * ng-bind=":notifier:expression"
   * ng-repeat="x in :notifier:expression"
   * <span>{{:notifier:expression}}</span>
   *
   * ## Multiple Notifiers
   * ng-bind=":n1:n2:n3:expression"
   * ng-repeat="x in :n1:n2:n3:expression"
   * <span>{{:n1:n2:n3:expression}}</span>
   */
  ParseDecorator.$inject = ['$provide'];
  function ParseDecorator ($provide) {

    $parseDecorator.$inject = ['$delegate', 'bindNotifierRegex'];
    function $parseDecorator ($delegate, bindNotifierRegex) {
      function wrap (parse, exp, interceptor) {
        var match, expression, rawExpression, notifiers;

        if (typeof exp === 'string' && bindNotifierRegex.test(exp)) {
          match         = exp.split(':').filter(function (v) { return !!v; });
          notifiers     = match.slice(0, -1);
          rawExpression = match[match.length - 1];

          expression = parse.call(this, '::' + rawExpression, interceptor);
          expression.$$watchDelegate = dynamicWatcher(expression, notifiers);

          return expression;
        } else {
          var args = [exp, interceptor];
          if (!interceptor) { args.pop(); }
          return parse.apply(this, args);
        }
      }

      return wrap.bind(null, $delegate);
    }

    $provide.decorator('$parse', $parseDecorator);
  }

  /**
   * @ngdoc directive
   * @name bindNotifier
   * @restrict A
   * @priority 0
   * @description
   *
   * Adds the ability to notify all notifier-bindings within the newly
   * created child scope.
   *
   * Expects an object of the following format:
   *
   * { n1: expr1, n2: expr2 }
   *
   * where multiple keys can be supplied so as to allow for multiple
   * namespaces within the given scope. bind-notifier directives can be nested
   * at will.
   */
  function bindNotifierDirective () {
    return {
      restrict: 'A',
      scope: true,
      compile: function (element, attrs) {
        var notifierMap = {};
        var keyValues      = attrs.bindNotifier.replace(/[\{\}\s]/g, '').split(',');

        keyValues.forEach(function (kv) {
          var split = kv.split(':');
          notifierMap[split[0]] = split[1];
        });

        return function (scope) {
          setupNotifier(scope, notifierMap);
        };
      }
    };
  }

  /**
   * @ngdoc factory
   * @name  $NotifierFactory
   * @kind function
   * @description
   *
   * Factory method, returning a $Notifier constructor fn.
   * Injected into controllers/directives for setting up
   * namespaced bindings without manual $broadcast work and/or
   * the usage of a notifier directive.
   *
   * @param {Object} scope - the scope to latch onto.
   * @param {Object} notifierMap - key:value mapping of notifiers and expressions to watch.
   *
   * @throws {Error} Throws an error if no scope was given.
   * @throws {Error} Throws an error if no notifierMap object was given.
   *
   * @returns {Function} $Notifier - $Notifier constructor function.
   *
   * @example
   *
    .controller('someCtrl', function ($scope, $Notifier) {
      scope.v1 = 'a';
      scope.v2 = 'b';

      new $Notifier($scope, {
        v1NameSpace: 'v1',
        v2NameSpace: 'v2'
      });
    });
   *
   */
  function $NotifierFactory () {
    return function $Notifier (scope, notifierMap) {
      if (!scope)       throw new Error('No $scope given');
      if (!notifierMap) throw new Error('No notifier object given');

      setupNotifier(scope, notifierMap);
    };
  }

  /**
   * @ngdoc module
   * @name angular.bind.notifier
   * @module angular.bind.notifier
   * @description
   *
   * Third party Angular module filling the gap between static/dynamic
   * data binding by introducing a new pub/sub based syntax.
   *
   * The syntax builds upon the one-time binding syntax introduced in Angular 1.3
   * with the ability to set up a notification system (or, namespace) said
   * binds. This is done by passing in the namespace(s) between the first and second
   * one-time-bind colon's (::).
   *
   * Useful when model data is so seldomly updated that a regular
   * two-way binding is not warranted due to the internal $watcher required.
   */
  angular
    .module('angular.bind.notifier', [])
    .constant('bindNotifierRegex', /^:([a-zA-Z0-9][\w-]*):(.+)$/)
    .factory('$Notifier', $NotifierFactory)
    .directive('bindNotifier', bindNotifierDirective)
    .config(ParseDecorator);

}());
