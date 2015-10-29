var gulp   = require('gulp');
var gutil  = require('gulp-util');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('lint', function () {
  gutil.log(gutil.colors.red('@todo: Implement eslint step.'));
});

gulp.task('test', function () {
  gutil.log(gutil.colors.red('@todo: Implement karma/mocha/sinon/chai step.'));
});

gulp.task('ci', ['lint', 'test']);

gulp.task('build', ['lint', 'test'], function () {
  return gulp
    .src('src/bindNotifier.js')
    .pipe(rename('angular-bind-notifier.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('angular-bind-notifier.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build']);
