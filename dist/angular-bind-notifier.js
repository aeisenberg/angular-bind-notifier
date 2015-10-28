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
        function setupListeners(scope, cb) {
            notifierKeys.forEach(function(nk) {
                scope.$on("$$rebind::" + nk, cb);
            });
        }
        function wrap(watchDelegate, scope, listener, objectEquality, parsedExpression) {
            var delegateCall = watchDelegate.bind(this, scope, listener, objectEquality, parsedExpression);
            if (watchDelegate.prototype && Object.getOwnPropertyNames(watchDelegate.prototype).indexOf("constructor") > -1) {
                setupListeners(scope, delegateCall);
            }
            delegateCall();
        }
        return wrap.bind(this, expr.$$watchDelegate);
    }
    ParseDecorator.$inject = [ "$provide" ];
    function ParseDecorator($provide) {
        $parseDecorator.$inject = [ "$delegate", "bindNotifierRegex" ];
        function $parseDecorator($delegate, bindNotifierRegex) {
            function wrap(parse, exp, interceptor) {
                var parts, part, expression, rawExpression, notifiers;
                if (typeof exp === "string" && bindNotifierRegex.test(exp)) {
                    parts = exp.split(/:/);
                    notifiers = [];
                    while (parts.length) {
                        part = parts.shift();
                        if (part) {
                            if (/^\s*[\{\[]/.test(part)) {
                                rawExpression = [ part ].concat(parts).join(":");
                                break;
                            }
                            notifiers.push(part);
                        }
                    }
                    if (!rawExpression) {
                        rawExpression = notifiers.splice(-1, 1)[0];
                    }
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