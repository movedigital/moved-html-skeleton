'use strict';

// - Modules:
var gulp = require('gulp');

var $ = require('gulp-load-plugins')();

var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var coffeeify = require('coffeeify');
var watchify = require('watchify');
var assign = require('lodash.assign');

var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

// - Configs:
var assetsGlob = 'assets/**/*.*';
var sassGlob = 'scss/**/*.scss';
var coffeeGlob = 'coffee/**/*.coffee';
var jadeGlob = 'jade/*.jade';

var sassConfig = {
  includePaths: [
    './node_modules/motion-ui',
    './node_modules/foundation-sites/scss'
  ]
};

var vendorScripts = [
  './node_modules/jquery/dist/jquery.js',
  './node_modules/jquery.easing/jquery.easing.js',
  './node_modules/foundation-sites/js/foundation.core.js',
  './node_modules/foundation-sites/js/foundation.util.mediaQuery.js',
  './node_modules/foundation-sites/js/foundation.interchange.js'
];

// - Browserify:
var browserifyConfig = {
  entries: ['./coffee/app.coffee'],
  extensions: ['.coffee', '.js'],
  debug: true,
  transform: [coffeeify]
};

var browserifyOpts = assign({}, watchify.args, browserifyConfig);
var b = watchify( browserify(browserifyOpts) );
b.on('log', $.util.log);

var bundle = function() {
  return b.bundle()
      .on('error', $.util.log.bind($.util, 'Browserify Error'))
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
      .on('error', $.util.log)
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('./public/js'))
    .pipe(reload({stream: true}));
};

// - Production Tasks:
gulp.task('default', ['assets', 'jade', 'sass', 'js', 'vendorJs']);

gulp.task('assets', function() {
  gulp.src(assetsGlob)
    .pipe(gulp.dest('./public'));
});

gulp.task('jade', function() {
  gulp.src(jadeGlob)
    .pipe($.jade())
    .pipe(gulp.dest('./public'));
});

gulp.task('sass', function() {
  gulp.src(sassGlob)
    .pipe($.sass( sassConfig ).on('error', $.sass.logError))
    .pipe($.autoprefixer())
    .pipe(gulp.dest('./public/css'));
});

gulp.task('js', function() {
  return bundle();
});

gulp.task('vendorJs', function() {
  gulp.src(vendorScripts)
    .pipe($.babel())
    .pipe($.concat('vendor.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('./public/js'));
});

// - Development Tasks:
gulp.task('dev:assets', function() {
  gulp.src(assetsGlob)
    .pipe(gulp.dest('./public'))
    .pipe(reload({stream: true}));
});

gulp.task('dev:jade', function() {
  gulp.src(jadeGlob)
    .pipe($.jade())
      .on('error', $.util.log)
    .pipe(gulp.dest('./public'))
    .pipe(reload({stream: true}));
});

gulp.task('dev:vendorJs', function() {
  gulp.src(vendorScripts)
    .pipe($.babel())
    .pipe($.concat('vendor.js'))
      .on('error', $.util.log)
    .pipe(gulp.dest('./public/js'));
});

gulp.task('dev:sass', function() {
  gulp.src(sassGlob)
    .pipe($.sass( sassConfig ))
      .on('error', function(e) {
        $.sass.logError(e);
        this.emit('end');
      })
    .pipe($.autoprefixer())
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.stream());
});

gulp.task('watch', ['dev:assets', 'dev:jade', 'dev:sass', 'dev:vendorJs'], function() {
  // browserSync.init { port: [port] }
  gulp.watch([sassGlob], ['dev:sass']);
  gulp.watch([assetsGlob], ['dev:assets']);
  gulp.watch([jadeGlob], ['dev:jade']);

  bundle()
  b.on('update', bundle)
});
