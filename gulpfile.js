var gulp = require('gulp');
var uglify = require("gulp-uglify");
var scss = require("gulp-sass");
var minify = require("gulp-minify-css")
//var imagemin = require('gulp-imagemin');
gulp.task('deals', function() {
 	gulp.src('./deals/public/javascript/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/deals/javascript'));
  gulp.src('./deals/public/css/*.scss')
  	.pipe(scss())
    .pipe(minify())
    .pipe(gulp.dest('build/deals/css'));

  gulp.src('./deals/public/images/**/')
    .pipe(gulp.dest('build/deals/images/'));

  gulp.src('./deals/public/css/iconfont/*')
  .pipe(gulp.dest('build/deals/css/iconfont'));
})