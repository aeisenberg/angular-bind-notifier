var gulp   = require('gulp');
var gutil  = require('gulp-util');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var eslint = require('gulp-eslint');
var Karma  = require('karma').Server;
var argv   = require('minimist')(process.argv.slice(2));

gulp.task('lint', function () {
  return gulp
    .src(['test/**/!(bind.poly).js', 'src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', function (done) {
  new Karma({
    configFile: __dirname + '/karma.conf.js',
    singleRun: !argv.tdd
  }, done).start();
});

gulp.task('test:browser', function (done) {
  new Karma({
    configFile: __dirname + '/karma.conf.js',
    singleRun: !argv.tdd,
    browsers: [ 'Firefox', 'Chrome', 'Opera' ]
  }, done).start();
});

gulp.task('build', function () {
  return gulp
    .src('src/bindNotifier.js')
    .pipe(rename('angular-bind-notifier.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('angular-bind-notifier.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('ci',      ['lint', 'test']);
gulp.task('package', ['lint', 'test', 'build']);
gulp.task('default', ['build']);
