'use strict';

var readFileSync = require('fs').readFileSync;

var assign = require('lodash.assign');

var gulp = require('gulp');
var gulpif = require('gulp-if');
var rename = require('gulp-rename');
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
var inlineNg2Template = require('gulp-inline-ng2-template');

var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');

var del = require('del');

var sequence = require('run-sequence');

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

var tsOpt= {
  target: "es5",
  module: "system",
  moduleResolution: "node",
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  noImplicitAny: true,
  removeComments: true,
  outFile: 'bundle.js',
  rootDir: 'ts',
  typescript: require('typescript')
}

var depList = [
  'lib/fix.js',
  'lib/material.min.js',
  'node_modules/es6-shim/es6-shim.js',
  'node_modules/systemjs/dist/system-polyfills.js',
  'node_modules/angular2/bundles/angular2-polyfills.min.js',
  'node_modules/systemjs/dist/system.js',
  'node_modules/rxjs/bundles/Rx.js',
  'node_modules/angular2/bundles/angular2.dev.js', // Minified version is broken
  'node_modules/angular2/bundles/router.dev.js',
  'node_modules/angular2/bundles/http.dev.js'
];

var fontList = [
  'node_modules/material-design-icons/iconfont/MaterialIcons-Regular.eot',
  'node_modules/material-design-icons/iconfont/MaterialIcons-Regular.woff',
  'node_modules/material-design-icons/iconfont/MaterialIcons-Regular.woff2',
  'node_modules/material-design-icons/iconfont/MaterialIcons-Regular.ttf',
];

var tsProject = typescript.createProject(tsOpt);

function buildjs(bundler) {
  return gulp.src(['./typings/browser.d.ts','./ts/**/*.ts', '!./ts/config.example.ts'])
      .on('error', util.log)
      .pipe(inlineNg2Template({ base: '/html' })) // Currently doesn't support source maps
      .pipe(sourcemaps.init())
      .pipe(typescript(tsProject))
      .pipe(gulpif(production, uglify({mangle: false})))
      .pipe(gulpif(!production, sourcemaps.write('./')))
      .pipe(rev())
      .pipe(gulp.dest('./build/js'))
      .pipe(rev.manifest({
        path: './build/rev-manifest.json',
        base: './build',
        merge: true
      }))
      .pipe(gulp.dest('./build'));
};

function buildcss() {
  return gulp.src('./sass/**/*.scss')
      .on('error', util.log)
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.src('./lib/*.css', {passthrough: true}))
      .pipe(concat('main.css'))
      .pipe(gulpif(production, cssmin()))
      .pipe(gulpif(!production, sourcemaps.write('./')))
      .pipe(rev())
      .pipe(gulp.dest('./build/css'))
      .pipe(rev.manifest({
        path: './build/rev-manifest.json',
        base: './build',
        merge: true
      }))
      .pipe(gulp.dest('./build'));
};

function builddep() {
  return gulp.src(depList)
      .pipe(concat({path: './bundle-dep.js', cwd: ''}))
      .pipe(gulpif(production, uglify({mangle: false})))
      .pipe(rev())
      .pipe(gulp.dest('./build/js'))
      .pipe(rev.manifest({
        path: './build/rev-manifest.json',
        base: './build',
        merge: true
      }))
      .pipe(gulp.dest('./build'));
}

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
      .pipe(gulp.dest('./dist'))
      .pipe(gulpif(webserver, connect.reload()));
}

gulp.task('prebuild:production', function(done) {
  production = true;
  done();
});

gulp.task('clean', function() {
  return del(['dist', 'build']);
});

gulp.task('clean:js', function() {
  return del(['dist/js/**/*.*', '!dist/js/bundle-dep-*.*', 'build/js/**/*.*', '!build/js/bundle-dep-*.*']);
});

gulp.task('clean:css', function() {
  return del(['dist/css', 'build/css']);
});

gulp.task('clean:dep', function() {
  return del('dist/js/bundle-dep-*.*', 'build/js/bundle-dep-*.*');
});

gulp.task('clean:font', function() {
  return del('dist/fonts/**/*.*', 'build/fonts/**/*.*');
});

gulp.task('clean:index', function() {
  return del('dist/index.html');
});

gulp.task('build:js', gulp.series('clean:js', buildjs));
gulp.task('build:css', gulp.series('clean:css', buildcss));
gulp.task('build:dep', gulp.series('clean:dep', builddep));
gulp.task('build:font', gulp.series('clean:font', buildfont));
gulp.task('build:index', gulp.series('clean:index', function() {
  return gulp.src('./html/index.html')
      .pipe(gulp.dest('./build'));
}));
gulp.task('build:rev', gulp.series(buildrev));

gulp.task('build', gulp.series(gulp.series('build:font', 'build:dep', 'build:js', 'build:css', 'build:index'), 'build:rev'));
gulp.task('build:production', gulp.series('prebuild:production', 'build'));
gulp.task('watch', gulp.series('build', function(done) {
  gulp.watch(['./ts/**/*.ts', './html/views/**/*.html', './html/tmpl/**/*.html'], gulp.series('build:js', 'build:rev'));
  gulp.watch('./sass/**/*.scss', gulp.series('build:css', 'build:rev'));
  gulp.watch('./html/index.html', gulp.series('build:index', 'build:rev'));
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
