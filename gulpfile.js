const gulp = require('gulp');
const sass = require('gulp-ruby-sass');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const named = require('vinyl-named');
const webpackConfig = require("./webpack.config.js");

gulp.task('default', ['sass', 'webpack']);

gulp.task('sass', () => {
  return sass('src/scss/content.scss', {
      style: 'expanded'
    })
    .on('error', sass.logError)
    .pipe(gulp.dest('dist/css'));
});

gulp.task('webpack', () => {
  return gulp.src('./src/js/app/*.js')
    .pipe(named())
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest('./dist/js/'));
});