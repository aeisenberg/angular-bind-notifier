module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['mocha', 'chai', 'sinon-chai'],
    files: [
      'bower_components/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'src/_module.js',
      'src/*.js',
      'test/*.js'
    ],
    port: 8067,
    logLevel: config.LOG_INFO,
    singleRun: true,
    browsers: [ 'PhantomJS' ]
  });
};
