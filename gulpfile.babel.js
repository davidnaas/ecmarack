import gulp from 'gulp';
import babel from 'gulp-babel';
import del from 'del';

gulp.task('transpile', ['clean'], function() {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('build'));
});

gulp.task('html', ['clean'], function() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function() {
  return del(['build/**/*.js']);
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['transpile']);
  gulp.watch('src/**/*.html', ['html']);
});

gulp.task('default', ['watch', 'html', 'transpile']);
