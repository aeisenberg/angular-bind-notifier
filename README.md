![travisci](https://travis-ci.org/kasperlewau/angular-bind-notifier.svg?branch=master)
## angular-bind-notifier
**Note:** This is experimental. Performance is not guaranteed.

Modifies the internal `$parse` service to accomodate a new binding syntax, allowing for manual refreshes of bindings on demand.

#### Installation::Bower
```js
  bower install angular-bind-notifier --save

  <script src="path/to/angular-bind-notifier/dist/angular-bind-notifier.js">
```

#### Installation::JSPM
```js
  jspm install angular-bind-notifier --save

  import 'angular-bind-notifier';
```

```js
angular.module('your_module_name', [ 'angular-bind-notifier' ]);
```

### Example usage
```html
<!-- Single notifierKey/expression -->
<div bind-notifier="{ 'notifierKey': 'watchedExpression' }">
  <span>{{:notifierKey:expression}}</span>
</div>

<!-- Multiple notifiers and expressions -->
<div bind-notifier="{ 'keyOne': 'exprOne', 'keyTwo': 'exprTwo' }">
  <span>{{:keyOne:expression}}</span>
  <span>{{:keyTwo:expression}}</span>
</div>

<!-- Multiple notifiers/expressions for a single binding -->
<div bind-notifier="{ 'keyOne': 'exprOne', 'keyTwo': 'exprTwo' }">
  <span>{{:keyOne:keyTwo:expression}}</span>
</div>

<!-- Nested notifiers -->
<div bind-notifier="{ 'keyOne': 'exprOne' }">
  <div bind-notifier="{ 'keyTwo': 'exprTwo' }">
    <span>{{:keyOne:expression}}</span>
    <span>{{:keyTwo:expression}}</span>
  </div>
</div>
```

### Running tests
`npm install; npm test`

### License
MIT
