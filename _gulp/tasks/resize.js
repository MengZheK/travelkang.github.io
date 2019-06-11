/**
 * Image resizer for Travelog
 * --------------------------
 * Converts a folder of source images into properly resized, responsive and optimized files
 * ready for use in a post. Images are resized in two varieties: full-width and split-width.
 * By default, images are assumed to be full-width unless suffixed with an "s".
 *
 * For example, given a folder containing these files:
 *
 * your-source-folder/
 * - 1.jpg
 * - 2.jpg
 * - 3s.jpg
 * - 4s.jpg
 *
 * This task will assume 1.jpg and 2.jpg are to be resized to full-width, while 3s.jpg and 4s.jpg
 * are split-width. The resulting output would thus be:
 *
 * your-destination-folder/
 * - 1.jpg
 * - 1@2x.jpg
 * - 1@3x.jpg
 * - 2.jpg
 * - 2@2x.jpg
 * - 2@3x.jpg
 * - 3.jpg
 * - 3@2x.jpg
 * - 3@3x.jpg
 * - 4.jpg
 * - 4@2x.jpg
 * - 4@3x.jpg
 *
 * where 1 & 2 are resized to 750px, 3 & 4 are resized to 365px
 */
var gulp = require('gulp-param')(require('gulp'), process.argv)
var rename = require('gulp-rename')
var mkdirp = require('mkdirp')
var extend = require('extend')
var sharp = require('gulp-sharp')
var merge = require('merge-stream')
var config = require('../config')

gulp.task('resize', function (src, dest) {
  var destinationFolder
  var defaults
  var globs
  var exports
  var tasks

  if (!src || !dest) {
    console.error('Must specify source & destination with --src and --dest')
    process.exit()
  }

  destinationFolder = 'photography/' + dest

  // Default settings for sharp
  // - enlargement is enabled so we can scale up an image for 2x and 3x assets
  // - bicubic matches Photoshops "Save for web" export quality —the benchark I have been using to date
  defaults = {
    withoutEnlargement: false,
    interpolateWith: 'bicubic',
    rotate: true
  }

  // Globs
  globs = {
    full: [src + '/*.jpg', '!' + src + '/*s.jpg'],
    split: src + '/*s.jpg'
  }

  exports = [
    {
      // Full-width, 1x
      glob: globs.full,
      size: config.sizes.full,
      quality: config.qualities.high,
      suffix: config.suffixes.oneTimes
    },
    {
      // Full-width, 2x
      glob: globs.full,
      size: config.sizes.full * 2,
      quality: config.qualities.medium,
      suffix: config.suffixes.twoTimes
    },
    {
      // Full-width, 3x
      glob: globs.full,
      size: config.sizes.full * 3,
      quality: config.qualities.low,
      suffix: config.suffixes.threeTimes
    },
    {
      // Split-width, 1x
      glob: globs.split,
      size: config.sizes.split,
      quality: config.qualities.high,
      suffix: config.suffixes.oneTimes
    },
    {
      // Split-width, 2x
      glob: globs.split,
      size: config.sizes.split * 2,
      quality: config.qualities.medium,
      suffix: config.suffixes.twoTimes
    },
    {
      // Split-width, 3x
      glob: globs.split,
      size: config.sizes.split * 3,
      quality: config.qualities.low,
      suffix: config.suffixes.threeTimes
    }
  ]

  // Create the destination folder
  mkdirp.sync(destinationFolder)

  // Run exports
  tasks = exports.map(function (settings) {
    return gulp.src(settings.glob)
      .pipe(sharp(
        extend(defaults, {
          resize: [settings.size],
          quality: settings.quality
        })
      ))
      .pipe(rename(function (path) {
        path.basename = (path.basename.replace('s', '') + settings.suffix)
      }))
      .pipe(gulp.dest(destinationFolder))
  })

  return merge(tasks)
})
