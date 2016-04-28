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
   * If the given expr.$$watchDelegate has already been flagged as 'wrapped', we're hitting this
   * function again due to some caching behaviour of Angular expressions. In which case,
   * we should not register additional $on listeners, nor should we re-wrap the given expression.
   * Exit early o/
   *
   * @param {String|Function} expr - The expression to evaluate. Can be either a string or a function.
   * @param {Array} notifierKeys - An array of keys to setup $on listeners for.
   *
   * @returns {Function} wrap - A decorated oneTimeWatchDelegate function.
   */
  function dynamicWatcher (expr, notifierKeys) {
    if (expr.$$watchDelegate.wrapped) {
      return expr.$$watchDelegate;
    }

    function setupListeners (scope, cb) {
      notifierKeys.forEach(function (nk) {
        scope.$on('$$rebind::' + nk, cb);
      });
    }

    function wrapDelegate (watchDelegate, scope, listener, objectEquality, parsedExpression) {
      var delegateCall = watchDelegate.bind(this, scope, listener, objectEquality, parsedExpression);
      setupListeners(scope, delegateCall);
      delegateCall();
    }

    var delegate     = wrapDelegate.bind(this, expr.$$watchDelegate);
    delegate.wrapped = true;

    return delegate;
  }

  /**
   * Decorate the $parse service to allow to use our custom bind-notifier
   * syntax in the given application.
   *
   * It parses out all the leading notifiers and the last expression to be reevaluated
   * whenever the notifiers trigger it.
   *
   * @example Single Notifiers
   * ng-bind=":notifier:expression"
   * ng-repeat="x in :notifier:expression"
   * <span>{{:notifier:expression}}</span>
   *
   * @example Multiple Notifiers
   * ng-bind=":n1:n2:n3:expression"
   * ng-repeat="x in :n1:n2:n3:expression"
   * <span>{{:n1:n2:n3:expression}}</span>
   *
   * @example Object literals
   * ng-class=":n1:{ x: xExpr, y: yExpr }"
   * ng-bind=":n1:'string' | translate: { translate-value: 'x' }"
   */
  ParseDecorator.$inject = ['$provide'];
  function ParseDecorator ($provide) {

    $parseDecorator.$inject = ['$delegate', 'bindNotifierRegex', 'bindNotifierKeyRegex'];
    function $parseDecorator ($delegate, bindNotifierRegex, bindNotifierKeyRegex) {
      function wrapParse (parse, exp, interceptor) {
        var parts, part, expression, rawExpression, notifiers;

        if (typeof exp !== 'string' || !bindNotifierRegex.test(exp)) {
          return parse.call(this, exp, interceptor);
        }

        parts = exp.split(':');
        notifiers = [];

        while (parts.length) {
          part = parts.shift();
          if (part) {
            if (!bindNotifierKeyRegex.test(part)) {
              rawExpression = [part].concat(parts).join(':');
              break;
            }
            notifiers.push(part);
          }
        }

        if (!rawExpression) {
          rawExpression = notifiers.splice(-1, 1)[0];
        }

        expression = parse.call(this, '::' + rawExpression, interceptor);
        expression.$$watchDelegate = dynamicWatcher(expression, notifiers);

        return expression;
      }

      return wrapParse.bind(null, $delegate);
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
        var keyValues   = attrs.bindNotifier.replace(/[\{\}\s]/g, '').split(',');

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
      if (!scope)       { throw new Error('No $scope given'); }
      if (!notifierMap) { throw new Error('No notifier object given'); }

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
    .constant('bindNotifierKeyRegex', /^[a-zA-Z0-9][\w-]*$/)
    .constant('bindNotifierRegex', /^[\s]*:([a-zA-Z0-9][\w-]*):(.+)$/)
    .factory('$Notifier', $NotifierFactory)
    .directive('bindNotifier', bindNotifierDirective)
    .config(ParseDecorator);

}());
