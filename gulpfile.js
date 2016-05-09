const gulp = require('gulp');
const liveReload = require('gulp-livereload');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const moment = require('moment');
const notify = require('gulp-notify');
const less = require('gulp-less');
const htmlmin = require('gulp-htmlmin');
const mainFiles = require('main-bower-files');
const path = require('path');
const babel = require('gulp-babel');

// Concat JS libraries
gulp.task('js-libraries', function() {
  return gulp.src(
    mainFiles().filter(function(file) {
        return path.extname(file) === '.js';
      })
      .map(function(file) {
        return file.substr(__dirname.length+1)
      })
      .concat(['client/js/libraries/**/*.js'])
    )
    .pipe(concat('libraries'))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('public/js'))
    .pipe(notify('Updated JavaScript Libraries (' + moment().format('MMM Do h:mm:ss A') + ')'))
    .pipe(liveReload({
      auto: false
    }));
});

// Concat, Uglify JavaScript into a single app.min.js
gulp.task('uglify-js', function() {
  return gulp.src(['client/js/source/app.js', 'client/js/source/**/*.js'])
    .pipe(concat('app'))
    /*.pipe(babel({
      presets: ['es2015']
    }))*/
    //.on('error', notify.onError("Error: <%= error.message %>"))
    /*.pipe(uglify({
      mangle: false,
      compress: false,
      output: {
        beautify: true
      }
    }))*/
    //.on('error', notify.onError("Error: <%= error.message %>"))
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(gulp.dest('public/js'))
    .pipe(notify('Uglified JavaScript (' + moment().format('MMM Do h:mm:ss A') + ')'))
    .pipe(liveReload({
      auto: false
    }));
});

// Concat CSS libraries
gulp.task('css-libraries', function() {
  return gulp.src(
    mainFiles().filter(function(file) {
        return path.extname(file) === '.css';
      })
      .concat(['client/css/libraries/**/*.css'])
    )
    .pipe(concat('libraries'))
    .pipe(rename({
      extname: ".css"
    }))
    .pipe(gulp.dest('public/css'))
    .pipe(notify('Updated CSS Libraries (' + moment().format('MMM Do h:mm:ss A') + ')'))
    .pipe(liveReload({
      auto: false
    }));
});

// Compile less into a single app.css
gulp.task('less', function() {
  return gulp.src(['client/css/source/**/*.*'])
    .pipe(concat('app'))
    .pipe(less())
    .on('error', notify.onError("Error: <%= error.message %>"))
    .pipe(gulp.dest('public/css'))
    .pipe(notify('Compiled less (' + moment().format('MMM Do h:mm:ss A') + ')'))
    .pipe(liveReload({
      auto: false
    }));
});

// Minify html
gulp.task('html-minify', function() {
  return gulp.src(['client/views/**/*.html'])
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('public/views'))
    .pipe(notify('Minified html (' + moment().format('MMM Do h:mm:ss A') + ')'))
    .pipe(liveReload({
      auto: false
    }));
});

// Watch for changes and live reloads Chrome. Requires the Chrome extension 'LiveReload'
gulp.task('watch', function() {
  liveReload.listen();

  gulp.watch(['bower_components/**/*.js', 'client/js/libraries/**/*.js'], ['js-libraries']);

  gulp.watch('client/js/source/**/*.js', ['uglify-js']);

  gulp.watch(['bower_components/**/*.css', 'client/css/libraries/**/*.css'], ['css-libraries']);

  gulp.watch('client/css/source/**/*.less', ['less']);

  gulp.watch('client/views/**/*.html', ['html-minify']);

});

gulp.task('build', ['js-libraries', 'uglify-js', 'css-libraries', 'less', 'html-minify'])

gulp.task('default', ['watch']);