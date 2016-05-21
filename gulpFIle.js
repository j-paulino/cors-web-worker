var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    args = require('yargs').argv,
    concat = require('gulp-concat'),
    gulpIf = require('gulp-if'),
    uglify = require('gulp-uglify');

gulp.task('default', function () {
    var flag = args.env;

    if (flag) {
        var mangle;

        if (flag === 'minify') {
            mangle = false;
        } else if (flag === 'uglify') {
            mangle = true;
        }
    }

    var isMangleDefined = typeof mangle !== 'undefined';
    var task = gulp.src(['src/http.js', 'src/*.js'])
        .pipe(plumber())
        .pipe(concat(isMangleDefined ? 'cors-worker.min.js' : 'cors-worker.js'))
        .pipe(gulpIf(isMangleDefined, uglify({mangle: mangle})));

    return task.pipe(gulp.dest('dist'));
});
gulp.task('watch', function () {
    gulp.watch('src/*.js', ['default']);
});

