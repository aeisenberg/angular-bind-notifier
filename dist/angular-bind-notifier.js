(function() {
    "use strict";
    function setupNotifier(scope, notifierMap) {
        function handler(notifierKey, newValue, oldValue) {
            if (newValue !== oldValue) {
                scope.$broadcast("$$rebind::" + notifierKey);
            }
        }
        Object.keys(notifierMap).forEach(function(k) {
            scope.$watch(notifierMap[k], handler.bind(null, k), typeof scope[notifierMap[k]] === "object");
        });
    }
    function dynamicWatcher(expr, notifierKeys) {
        function wrap(watchDelegate, scope, listener, objectEquality, parsedExpression) {
            var delegateCall = watchDelegate.bind(this, scope, listener, objectEquality, parsedExpression);
            notifierKeys.forEach(function(n) {
                scope.$on("$$rebind::" + n, delegateCall);
            });
            delegateCall();
        }
        return wrap.bind(this, expr.$$watchDelegate);
    }
    ParseDecorator.$inject = [ "$provide" ];
    function ParseDecorator($provide) {
        $parseDecorator.$inject = [ "$delegate", "bindNotifierRegex" ];
        function $parseDecorator($delegate, bindNotifierRegex) {
            function wrap(parse, exp, interceptor) {
                var match, expression, rawExpression, notifiers;
                if (typeof exp === "string" && bindNotifierRegex.test(exp)) {
                    match = exp.split(":").filter(function(v) {
                        return !!v;
                    });
                    notifiers = match.slice(0, -1);
                    rawExpression = match[match.length - 1];
                    expression = parse.call(this, "::" + rawExpression, interceptor);
                    expression.$$watchDelegate = dynamicWatcher(expression, notifiers);
                    return expression;
                } else {
                    var args = [ exp, interceptor ];
                    if (!interceptor) {
                        args.pop();
                    }
                    return parse.apply(this, args);
                }
            }
            return wrap.bind(null, $delegate);
        }
        $provide.decorator("$parse", $parseDecorator);
    }
    function bindNotifierDirective() {
        return {
            restrict: "A",
            scope: true,
            compile: function(element, attrs) {
                var notifierMap = {};
                var keyValues = attrs.bindNotifier.replace(/[\{\}\s]/g, "").split(",");
                keyValues.forEach(function(kv) {
                    var split = kv.split(":");
                    notifierMap[split[0]] = split[1];
                });
                return function(scope) {
                    setupNotifier(scope, notifierMap);
                };
            }
        };
    }
    function $NotifierFactory() {
        return function $Notifier(scope, notifierMap) {
            if (!scope) throw new Error("No $scope given");
            if (!notifierMap) throw new Error("No notifier object given");
            setupNotifier(scope, notifierMap);
        };
    }
    angular.module("angular.bind.notifier", []).constant("bindNotifierRegex", /^:([a-zA-Z0-9][\w-]*):(.+)$/).factory("$Notifier", $NotifierFactory).directive("bindNotifier", bindNotifierDirective).config(ParseDecorator);
})();