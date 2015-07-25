module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon-chai'],
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'src/bindNotifier.js',
      'test/bind.poly.js',
      'test/*.js'
    ],
    port: 8067,
    logLevel: config.LOG_INFO,
    singleRun: true,
    browsers: [ 'PhantomJS' ]
  });
};
