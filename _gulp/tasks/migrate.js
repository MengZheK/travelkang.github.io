/*
 * Migration script to resize all thumbnails of the 435px-width variety to the 365px-width required by the new galileo theme
 * Note that gulp-image-resize requires GraphicsMagick or ImageMagick be installed on your system
 * -----------------------------------------------------
 * DEFUNCT — Unhappy with final image quality of resizes
 * Code remains checked in for posterity / possible improvement in future
 */
var gulp = require('gulp')
var rename = require('gulp-rename')
var ignore = require('gulp-ignore')
var size = require('image-size')
var imgResize = require('gulp-image-resize')
var parallel = require('concurrent-transform')
var os = require('os')

gulp.task('migrate', function () {
  gulp.src('photography/**/*-full.jpg')
    .pipe(ignore(function (file) {
      var thumbnailFilename = file.path.replace('-full', '')

      // Filter out any thumbnails that aren't 435px wide
      return size(thumbnailFilename).width !== 435
    }))
    .pipe(parallel(
      imgResize({
        width: 365
      }),
      os.cpus().length))
    .pipe(rename(function (path) {
      // As we are resizing from the HQ images, we need to adjust the names to remove the "-full" suffix
      path.basename = path.basename.replace('-full', '')
    }))
    .pipe(gulp.dest('photography'))
})

