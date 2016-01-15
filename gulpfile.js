var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');

var js = "./src/**/*.js";
var lib = "./lib";
var test = "./test/**/*.test.js";
var dev = "./dev";
var devTest = dev + "/**/*.test.js";

function compileTask(src, dest, genMap) {
  return gulp.src(src)
    .pipe($.plumber())
    .pipe($.if(genMap, $.sourcemaps.init()))
    .pipe($.babel({
      presets: ["es2015"]
    }))
    .pipe($.if(genMap, $.sourcemaps.write('.')))
    .pipe(gulp.dest(dest));
}

gulp.task('compile:dev', function() {
  return compileTask(js, dev, true);
});

gulp.task('compile:test', function() {
  return compileTask(test, dev, true);
});

gulp.task('test', ['compile:dev', 'compile:test'], function() {
  return gulp.src(devTest, {read: false})
    .pipe($.mocha({reporter: 'list'}));
});

gulp.task('clean', function (done) {
  del([lib, dev], function () {
    done();
  });
});

gulp.task('dev', ['copmile:dev', 'compile:test'], function () {
  gulp.watch(js, ['test']);
  gulp.watch(test, ['test']);
});

gulp.task('dist', function() {
  return compileTask(js, lib, false);
});

gulp.task('default', ['dev']);
