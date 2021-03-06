'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

// Optimize Images
gulp.task('images', function () {
  return gulp.src('src/images/**/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));
});

// Copy All Files At The Root Level (src)
gulp.task('copy', function () {
  return gulp.src(['src/*','!src/*.html'], {dot: true})
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function () {
  return gulp.src(['src/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Automatically Prefix CSS
gulp.task('styles:css', function () {
  return gulp.src('src/css/**/*.css')
    .pipe($.changed('src/css'))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('src/css'))
    .pipe($.size({title: 'styles:css'}));
});

// Compile Any Other Sass Files You Added (src/scss)
gulp.task('styles:scss', function () {
  return gulp.src(['src/scss/**/*.scss'])
    .pipe($.compass({
        style: 'expanded',
        comments: false,
        javascript: 'src/js',
        font: 'src/fonts',
        sass: 'src/scss',
        css: 'src/css',
        image: 'src/images',
        debug: false
    }))
    .on('error', console.error.bind(console))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('src/css'))
    .pipe($.size({title: 'styles:scss'}));
});

// Output Final CSS Styles
gulp.task('styles', ['styles:scss', 'styles:css']);

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function () {
  return gulp.src('src/**/*.html')
    .pipe($.useref.assets({searchPath: '{.tmp,src}'}))
    // Concatenate And Minify JavaScript
    .pipe($.if('*.js', $.uglify({preserveComments: 'some'})))
    // Concatenate And Minify Styles
    .pipe($.if('*.css', $.csso()))
    .pipe($.useref.restore())
    .pipe($.useref())
    // Output Files
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});

// Watch Files For Changes & Reload
gulp.task('serve', function () {
  browserSync({
    notify: false,
    server: {
      baseDir: ['.tmp', 'src']
    }
  });
  gulp.watch(['src/**/*.html'], reload);
  gulp.watch(['src/scss/**/*.scss'], ['styles:scss']);
  gulp.watch(['{.tmp,src}/css/**/*.css'], ['styles:css', reload]);
  gulp.watch(['src/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function () {
  browserSync({
    notify: false,
    server: {
      baseDir: 'dist'
    }
  });
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function (cb) {
  runSequence('styles', ['html', 'images', 'fonts', 'copy'], cb);
});
