var gulp = require('gulp');
var stylus = require('gulp-stylus');

gulp.task('css', function() {
    return gulp.src('*.styl')
        .pipe(stylus())
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['css']);

gulp.task('watch', ['default'], function() {
    gulp.watch('*.styl', ['css']);
});
