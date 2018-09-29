const gulp = require('gulp');
const sass = require('gulp-ruby-sass');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const named = require('vinyl-named');
const webpackConfig = require('./webpack.config');

gulp.task('default', ['sass', 'webpack']);

gulp.task('sass', () => {
  return sass('src/scss/*.scss', {
    style: 'expanded',
  })
    .on('error', sass.logError)
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('webpack', () => {
  return gulp
    .src('./src/js/app/*.js')
    .pipe(named())
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('sass:watch', () => {
  gulp.watch('src/scss/*.scss', ['sass']).on('change', event => {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

gulp.task('js:watch', () => {
  gulp.watch('src/js/*/*.js', ['webpack']).on('change', event => {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

gulp.task('watch', ['js:watch', 'sass:watch']);
