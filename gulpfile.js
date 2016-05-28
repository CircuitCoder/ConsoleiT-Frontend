'use strict';

var readFileSync = require('fs').readFileSync;

var gulp = require('gulp');

var concat = require('gulp-concat');
var connect = require('gulp-connect');
var cssmin = require('gulp-cssmin');
var del = require('del');
var gulpif = require('gulp-if');
var htmlmin = require('gulp-htmlmin');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var sass = require('gulp-sass');
var shell = require('gulp-shell');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var watch = require('glob-watcher');
var webpack = require('webpack-stream');

var debounce = require('lodash.debounce');

var production = false;
var webserver = false;

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

var fontList = [
  'node_modules/material-design-icons/iconfont/MaterialIcons-Regular.eot',
  'node_modules/material-design-icons/iconfont/MaterialIcons-Regular.woff',
  'node_modules/material-design-icons/iconfont/MaterialIcons-Regular.woff2',
  'node_modules/material-design-icons/iconfont/MaterialIcons-Regular.ttf',
];

function buildjs() {
  return gulp.src('./ts/main.ts')
      .pipe(plumber())
      .pipe(webpack(require('./webpack.config'))) // Handles source map
      .pipe(rev()) // TODO ignore chunk file
      .pipe(gulp.dest('./build/js'))
      .pipe(rev.manifest({
        path: './build/rev-manifest.json',
        base: './build',
        merge: true
      }))
      .on('error', util.log)
      .pipe(gulp.dest('./build'));
};

function buildcss() {
  return gulp.src('./sass/**/*.scss')
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.src('./lib/*.css', {passthrough: true}))
      .pipe(concat('main.css'))
      //.pipe(gulpif(production, cssmin()))
      .pipe(gulpif(!production, sourcemaps.write('./')))
      .pipe(rev())
      .pipe(gulp.dest('./build/css'))
      .pipe(rev.manifest({
        path: './build/rev-manifest.json',
        base: './build',
        merge: true
      }))
      .on('error', util.log)
      .pipe(gulp.dest('./build'));
};

function buildfont() {
  return gulp.src(fontList)
      .pipe(rev())
      .pipe(gulp.dest('./build/fonts'))
      .pipe(rev.manifest({
        path: './build/rev-manifest.json',
        base: './build',
        merge: true
      }))
      .pipe(gulp.dest('./build'));
}

function buildassets() {
  return gulp.src('./assets/**/*.*')
      .pipe(rev())
      .pipe(gulp.dest('./build/assets'))
      .pipe(rev.manifest({
        path: './build/rev-manifest.json',
        base: './build',
        merge: true
      }))
      .pipe(gulp.dest('./build'));
}

function buildrev() {
  function replaceMap(filename) {
    if(filename.indexOf('.map') > -1) {
      return filename.replace(/.*\//g, '');
    } else return filename;
  }
  return gulp.src(['./build/**/*.*', '!./build/rev-manifest.json'])
      .pipe(revReplace({
        manifest: gulp.src('./build/rev-manifest.json'),
        modifiedUnreved: replaceMap,
        modifiedReved: replaceMap
      }))
      .pipe(gulp.dest('./dist'));
}

gulp.task('prebuild:production', function(done) {
  production = true;
  done();
});

gulp.task('clean', function() {
  return del(['dist', 'build']);
});

gulp.task('clean:js', function() {
  return del(['dist/js/**/*.*', 'build/js/**/*.*']);
});

gulp.task('clean:css', function() {
  return del(['dist/css', 'build/css']);
});

gulp.task('clean:font', function() {
  return del(['dist/fonts/**/*.*', 'build/fonts/**/*.*']);
});

gulp.task('clean:assets', function() {
  return del(['dist/assets/**/*.*', 'build/assets/**/*.*']);
});

gulp.task('clean:index', function() {
  return del(['dist/index.html', 'dist/offline.html']);
});

gulp.task('build:js', gulp.series('clean:js', buildjs));
gulp.task('build:css', gulp.series('clean:css', buildcss));
gulp.task('build:font', gulp.series('clean:font', buildfont));
gulp.task('build:assets', gulp.series('clean:assets', buildassets));
gulp.task('build:index', gulp.series('clean:index', function() {
  return gulp.src(['./html/index.html', './html/offline.html'])
      .pipe(gulp.dest('./build'));
}));
gulp.task('build:rev', buildrev);

gulp.task('build', gulp.series(gulp.series('build:font', 'build:assets', 'build:js', 'build:css', 'build:index'), 'build:rev'));
gulp.task('build:production', gulp.series('prebuild:production', 'build'));
gulp.task('watch', gulp.series('build', function(done) {
  gulp.watch(['./ts/**/*.ts', './html/view/**/*.html', './html/tmpl/**/*.html'], gulp.series('build:js'));
  gulp.watch('./sass/**/*.scss', gulp.series('build:css'));
  gulp.watch(['./html/index.html', './html/offline.html'], gulp.series('build:index'));

  //TODO: watch vendor

  var revWatcher = gulp.watch(['./build/**/*.*']);
  revWatcher.on('add', debounce(gulp.series('build:rev'), 200));
  revWatcher.on('change', debounce(gulp.series('build:rev'), 200));

  
  // Reload when revision or index itself changed
  var reloadWatcher = gulp.watch('./dist/**/*.*')
  var reload = debounce(() => {
    return gulp.src('./dist/index.html').pipe(connect.reload())
  }, 200);

  reloadWatcher.on('add', reload);
  reloadWatcher.on('change', reload);
  done();
}));

gulp.task('webserver', function(done) {
  webserver = true;
  connect.server({
    root: 'dist',
    port: 3001,
    livereload: true,
    fallback: 'dist/index.html',
    debug: true
  });
  done();
});

gulp.task('default', gulp.series('watch', 'webserver'));
