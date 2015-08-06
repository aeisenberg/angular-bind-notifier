# angular-bind-notifier

[![travisci](https://travis-ci.org/kasperlewau/angular-bind-notifier.svg?branch=master)](https://travis-ci.org/kasperlewau/angular-bind-notifier) [![bitHound Score](https://www.bithound.io/github/kasperlewau/angular-bind-notifier/badges/score.svg)](https://www.bithound.io/github/kasperlewau/angular-bind-notifier) [![Bower version](https://badge.fury.io/bo/angular-bind-notifier.svg)](http://badge.fury.io/bo/angular-bind-notifier) ![NPM version](https://img.shields.io/npm/v/angular-bind-notifier.svg)

> on-demand & semi-automatic re-evaluation of angular one-time bindings

## installation
```js
  bower install angular-bind-notifier --save
  jspm install angular-bind-notifier --save
  npm install angular-bind-notifier --save

  <script src="path/to/angular-bind-notifier/dist/angular-bind-notifier.js"></script>
```

## description
This package is meant for those looking for a middleground between two way binding, and one time bindings. *someTimeBinding?*

Based off of the work done by [@kseamon](https://github.com/kseamon/fast-bind) on fast-bind, [a proposal from August 2014 on labeled bindings](https://docs.google.com/document/d/1fTqaaQYD2QE1rz-OywvRKFSpZirbWUPsnfaZaMq8fWI/edit#) and [@kasperlewau's bower port of fast-bind](https://github.com/kasperlewau/fast-bind),
designed to closely resemble the one-time double-colon syntax introduced with Angular 1.3.

The idea is to pass a set of `key(s)` between the first and second colon of a one-time expression.

Said key(s) will need to be pre-registered with a corresponding value, either by a `bind-notifier` directive or or a `$Notifier` instance, DI'd and coupled with your `$scope`.

Once a key's value changes, a broadcast will be sent down through the descendant scopes, letting each expression
with the `:key:expr` syntax know that it is time to re-evaluate the result of the expression.

Possible use cases include but are not limited to;

* Model data that changes seldomly, that then needs to be reflected in the view.
* Translation(s) of the entire page (or a subsection), where static data needs to be re-translated.

## usage
```js
// inject the module dependency
angular.module('your_module_name', [ 'angular.bind.notifier' ]);
```

### bind-notifier
> [jsbin example](http://jsbin.com/boxafasibo/1/edit?html,js,output)


```html
<!--single notifierkey:expression-->
<div bind-notifier="{ notifierKey:watchedExpression }">
  <span>{{:notifierKey:someExpressionToBind}}</span>
</div>
```

```html
<!--multiple notifierkey:expression's-->
<div bind-notifier="{ keyOne:watchedExprOne, keyTwo:watchedExprTwo }">
  <span>{{:keyOne:someExpressionToBind}}</span>
  <span>{{:keyTwo:someExpressionToBind}}</span>
</div>
```

```html
<!--multiple notifierkey:expression's (for a single binding)-->
<div bind-notifier="{ keyOne:watchedExprOne, keyTwo:watchedExprTwo }">
  <span>{{:keyOne:keyTwo:someExpressionToBind}}</span>
</div>
```

```html
<!--nested bind-notifiers-->
<div bind-notifier="{ keyOne:watchedExprOne }">
  <div bind-notifier="{ keyTwo:watchedExprTwo }">
    <span>{{:keyOne:someExpressionToBind}}</span>
    <span>{{:keyTwo:someExpressionToBind}}</span>
  </div>
  <span>{{:keyOne:anotherExpressionToBind}}</span>
</div>
```

### $Notifier(scope, notifierMap)
> [jsbin example](http://jsbin.com/zelaqimihe/1/edit?html,js,output)

The `$Notifier` *factory* returns a constructor function for you to setup a new $Notifier instance.

Both params (`$scope` & `notifierMap`) are **required**, a lack of either is considered a programmatical error and an error will be thrown.


```js
.controller('...', function ($scope, $Notifier) {
  $scope.a = 'a';
  $scope.b = 'b';

  new $Notifier($scope, {
    aNameSpace: 'a',
    bNameSpace: 'b'
  });
});
```
```html
<span ng-bind=":aNameSpace:expression"></span>
<span ng-bind=":bNameSpace:expression"></span>
```

### manual refreshment
> [jsbin example](http://jsbin.com/tovexareje/1/edit?html,js,output)

The above use cases showcase how $watched expressions refrehs binds.

What happens behind the scenes is that a `$broadcast` is sent with the `$$rebind::` prefix, followed by the key
of your notifier key:value mapping.

As such, you can manually $broadcast whenever you want to refresh the binds - you don't *need* to setup a semi-automatic watcher through `bind-notifier` or `$Notifier`.

```html
<span ng-bind=":superduper:expression">
```
```js
$scope.$broadcast('$$rebind::' + 'superduper'); // binding: refreshed!
```

## testing
`npm install; npm test`

## license
MIT © [Kasper Lewau](https://github.com/kasperlewau)
