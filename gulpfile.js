'use strict';

var browserify = require('browserify');
var watchify = require('watchify');
var tsify = require('tsify');

var assign = require('lodash.assign');

var gulp = require('gulp');
var vinylSource = require('vinyl-source-stream');
var vinylBuffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-typescript');
var sass = require('gulp-sass');
var htmlmin = require('gulp-htmlmin');
var cssmin = require('gulp-cssmin');
var connect = require('gulp-connect');

var del = require('del');

var browserifyOpt = {
  entries: ['./ts/main.ts'],
  debug: true
};

var htmlminOpt = {
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeComments: true,
  removeCommentsFromCDATA: true,
  caseSensitive: true,
  minifyJS: true,
  minifyCSS: true,
  minifyURLs: true
}
var b = watchify(browserify(assign({}, watchify.args, browserifyOpt)));

function buildjs() {
  b.plugin(tsify, {noImplicitAny: true})
      .bundle()
      .pipe(vinylSource('bundle.js'))
      .pipe(vinylBuffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/js'))
      .pipe(connect.reload());
};

function buildcss() {
  gulp.src('./sass/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(cssmin())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/css'))
      .pipe(connect.reload());
};

function buildhtml() {
  gulp.src('./html/**/*.html')
      .pipe(sourcemaps.init())
      .pipe(htmlmin())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'))
      .pipe(connect.reload());
};

gulp.task('build:js', ['clean:js'], buildjs);
gulp.task('build:html', ['clean:html'], buildhtml);
gulp.task('build:css', ['clean:css'], buildcss);
gulp.task('build', ['clean'], function() {
  buildjs();
  buildhtml();
  buildcss();
});
gulp.task('watch', ['build'], function() {
  gulp.watch('./ts/**/*.ts', ['build:js']);
  gulp.watch('./sass/**/*.scss', ['build:css']);
  gulp.watch('./html/**/*.html', ['build:html']);
});

gulp.task('clean', function() {
  return del('dist');
});

gulp.task('clean:js', function() {
  return del('dist/js');
});

gulp.task('clean:css', function() {
  return del('dist/css');
});

gulp.task('clean:html', function() {
  return del('dist/html');
});

gulp.task('webserver', function() {
  connect.server({
    root: 'dist',
    port: 3000,
    livereload: true
  });
});

gulp.task('default', ['watch', 'webserver']);
