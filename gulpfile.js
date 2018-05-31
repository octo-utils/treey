/* Created by tommyZZM.OSX on 2018/5/22. */
'use strict';
const gulp = require('gulp');
const babel = require('gulp-babel');
const mocha = require('gulp-mocha');

const babelrc = _ => ({
  presets: [["@babel/preset-env", {
    loose: false,
    targets: {
      "node": "8.0"
    },
    exclude: [
      "transform-block-scoping",
      "transform-modules-commonjs"
    ]
  }]],
  plugins: [
    ["@babel/plugin-proposal-decorators", {
      legacy: true
    }],
    "@babel/plugin-proposal-object-rest-spread",
    ["@babel/plugin-transform-modules-commonjs", {
      strict: false
    }],
    "@babel/plugin-proposal-class-properties"
  ]
});

gulp.task('build', _ => {
  return gulp.src(['./src/**/*.js'])
    .pipe(babel(babelrc()))
    .pipe(gulp.dest('./lib'))
})

gulp.task('test', _ => {
  return gulp.src(['./test/test.js', './test/test.*.js'], {read: false, allowEmpty: true})
    .pipe(mocha({reporter: 'nyan'}))
})

gulp.task('build-then-test', gulp.series(['build', 'test']))

gulp.task('build-watch', gulp.series(['build-then-test'], _ => {
  return gulp.watch(['./src/**/*.js', './test/**/*'], gulp.series(['build-then-test']))
}))

