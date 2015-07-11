## angular-bind-notifier ![travisci](https://travis-ci.org/kasperlewau/angular-bind-notifier.svg?branch=master)
> adds on-demand (and dynamic) re-evaluation of angular one-time bindings

### installation
```
  /** with Bower **/
  bower install angular-q-thenresolve --save
  <script src="path/to/angular-bind-notifier/dist/angular-bind-notifier.js"></script>

  /** with jspm **/
  jspm install angular-bind-notifier --save
  import 'angular-bind-notifier';
```

### description
This package is meant for those who want to be able to refresh their one-time bindings
occasionally.

This is based on the work done by [@kseamon](https://github.com/kseamon/fast-bind) on fast-bind and [@kasperlewau's bower port](https://github.com/kasperlewau/fast-bind), but
it is designed to resemble the one time binding syntax introduced with Angular 1.3 - `{{:: }}`.

The idea is to pass a `key` in between the two colons of the expression, that has been preregistered
with the `bind-notifier` directive.

A `scope.$watch` is then setup for the `expression`, and whenever the expression changes a `$broadcast`
is sent off with the `key`, effectively notifying every binding with the `{{:key:expression}}` syntax to refresh itself.

The `bind-notifier` directive accepts multiple key:expression's for use within the newly created childscope.

### possible use cases
* Data that changes occasionally.
* Translation(s) of the entire page, where static data needs to be re-translated.
* Slow `$interval` updates of value(s).
* and more?

### usage
```js
  angular.module('your_module_name', [ 'angular.bind.notifier' ]);
```
**single notifierkey:expression**
```html
<div bind-notifier="{ notifierKey:watchedExpression }">
  <span>{{:notifierKey:someExpressionToBind}}</span>
</div>
```
**multiple notifierkey:expression's**
```html
<div bind-notifier="{ keyOne:watchedExprOne, keyTwo:watchedExprTwo }">
  <span>{{:keyOne:someExpressionToBind}}</span>
  <span>{{:keyTwo:someExpressionToBind}}</span>
</div>
```
**multiple notifierkey:expression's (for a single binding)**
> yes, a single binding can compose multiple expressions for it's re-evaluation

```html
<div bind-notifier="{ keyOne:watchedExprOne, keyTwo:watchedExprTwo }">
  <span>{{:keyOne:keyTwo:someExpressionToBind}}</span>
</div>
```
**nested notifiers**
```html
<div bind-notifier="{ keyOne:watchedExprOne }">
  <div bind-notifier="{ keyTwo:watchedExprTwo }">
    <span>{{:keyOne:someExpressionToBind}}</span>
    <span>{{:keyTwo:someExpressionToBind}}</span>
  </div>
  <span>{{:keyOne:anotherExpressionToBind}}</span>
</div>
```

### manually refreshing
The above use cases showcase how a $watched expression would refresh
the bindings.

But what if one wants to refresh the bindings manually, **right now?**

*don't fret.*

Get onto the `$scope` of the bind-notifier and send off a `$broadcast` in the following format, where `key` matches
that of the bound expression key `{{:supahKey:expr}}`.

```js
  $scope.$broadcast('$$rebind::' + 'supahKey');
```

And there you go, your bindings just got refreshed - without having to wait for a `$watched` expression
to change.

### what about ng-bind? 

ng-bind works *just fine* if you're working with primitives. 
If however you want to bind something other than a primitive, you cannot - due to [https://github.com/angular/angular.js/issues/11716](https://github.com/angular/angular.js/issues/11716). 

A temporary workaround is to do the following: 

```html
  <span ng-bind-template="{{:key:bound}}"></span>
```

### Running tests
`npm install; npm test`

### License
MIT
