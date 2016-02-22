'use strict';

var assign = require('lodash.assign');

var gulp = require('gulp');
var util = require('gulp-util');
var vinylSource = require('vinyl-source-stream');
var vinylBuffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var typescript = require('gulp-typescript');
var sass = require('gulp-sass');
var htmlmin = require('gulp-htmlmin');
var cssmin = require('gulp-cssmin');
var connect = require('gulp-connect');
var concat = require('gulp-concat');

var del = require('del');

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

var tsOpt= {
  target: "es5",
  module: "system",
  moduleResolution: "node",
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  noImplicitAny: false
}

var depList = [
  'node_modules/es6-shim/es6-shim.js',
  'node_modules/systemjs/dist/system-polyfills.js',
  'node_modules/angular2/bundles/angular2-polyfills.js',
  'node_modules/systemjs/dist/system.src.js',
  'node_modules/rxjs/bundles/Rx.js',
  'node_modules/angular2/bundles/angular2.dev.js'
];


var tsProject = typescript.createProject(tsOpt);

function buildjs(bundler) {
  return gulp.src(['./typings/browser.d.ts','./ts/**/*.ts'])
      .on('error', util.log)
      .pipe(sourcemaps.init())
      .pipe(typescript(tsProject))
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/js'))
      .pipe(connect.reload());
};

function buildcss() {
  return gulp.src('./sass/**/*.scss')
      .on('error', util.log)
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(cssmin())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/css'))
      .pipe(connect.reload());
};

function buildhtml() {
  return gulp.src('./html/**/*.html')
      .on('error', util.log)
      .pipe(sourcemaps.init())
      .pipe(htmlmin())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist'))
      .pipe(connect.reload());
};

function builddep() {
  return gulp.src(depList)
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/lib'));
}

gulp.task('build:js', ['clean:js'], buildjs);
gulp.task('build:html', ['clean:html'], buildhtml);
gulp.task('build:css', ['clean:css'], buildcss);
gulp.task('build:dep', ['clean:dep'], builddep);
gulp.task('build', ['build:js', 'build:css', 'build:html']);
gulp.task('build:fresh', ['build', 'build:dep']);
gulp.task('watch', ['build:js', 'build:css', 'build:html'], function() {
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
  return del('dist/**/*.html');
});

gulp.task('clean:dep', function() {
  return del('dist/lib');
});

gulp.task('webserver', function() {
  connect.server({
    root: 'dist',
    port: 3000,
    livereload: true
  });
});

gulp.task('default', ['watch', 'webserver']);
