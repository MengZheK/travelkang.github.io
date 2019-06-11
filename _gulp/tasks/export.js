var gulp = require('gulp-param')(require('gulp'), process.argv)

gulp.task('export', ['resize', 'markup'])
