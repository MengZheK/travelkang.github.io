var fs = require('fs')
var gulp = require('gulp-param')(require('gulp'), process.argv)
var rename = require('gulp-rename')
var size = require('image-size')
var clipboard = require('copy-paste')
var sort = require('gulp-sort')
var path = require('filepath')
var filesize = require('filesize')
var chalk = require('chalk')
var notifier = require('node-notifier')
var folderSize = require('get-folder-size')
var config = require('../config')

gulp.task('markup', ['resize'], function (src, dest) {
  var destinationFolder = 'photography/' + dest
  var markup = ''
  var splitCount = 0
  var getMarker
  var sorter
  var comparator
  var builder

  getMarker = function (size) {
    return size >= 2621440 ? chalk.red : size >= 1048576 ? chalk.yellow : chalk.green
  }

  comparator = function (file1, file2) {
    var path1 = path.create(file1.path)
    var path2 = path.create(file2.path)
    var numericPath1 = parseInt(path1.basename(path1.extname()), 10)
    var numericPath2 = parseInt(path2.basename(path2.extname()), 10)
    var greater = numericPath1 > numericPath2
    var same = numericPath1 === numericPath2

    return same ? 0 : greater ? 1 : -1
  }

  sorter = sort({
    comparator: comparator
  })

  builder = rename(function (path) {
    var fullPath = destinationFolder + '/' + path.basename + path.extname
    var dimensions = size(fullPath)
    var isSplit = (dimensions.width === config.sizes.split)
    var imgMarkup = ''
    var bytes = {
      oneTimes: fs.statSync(fullPath)['size'],
      twoTimes: fs.statSync(destinationFolder + '/' + path.basename + config.suffixes.twoTimes + path.extname)['size'],
      threeTimes: fs.statSync(destinationFolder + '/' + path.basename + config.suffixes.threeTimes + path.extname)['size']
    }
    var sizeReport = getMarker(bytes.oneTimes)(filesize(bytes.oneTimes)) + ',\t' + getMarker(bytes.twoTimes)(filesize(bytes.twoTimes)) + ',\t' + getMarker(bytes.threeTimes)(filesize(bytes.threeTimes))

    imgMarkup += '\t'
    imgMarkup += '<img '
    imgMarkup += 'alt="" '
    imgMarkup += 'width="' + dimensions.width + '" '
    imgMarkup += 'height="' + dimensions.height + '" '
    imgMarkup += 'srcset="'
    imgMarkup += '/' + destinationFolder + '/' + path.basename + config.suffixes.oneTimes + path.extname + ' 1x, '
    imgMarkup += '/' + destinationFolder + '/' + path.basename + config.suffixes.twoTimes + path.extname + ' 2x, '
    imgMarkup += '/' + destinationFolder + '/' + path.basename + config.suffixes.threeTimes + path.extname + ' 3x'
    imgMarkup += '" />'
    imgMarkup += '\n'

    if (isSplit) {
      splitCount++

      if (splitCount === 2) {
        splitCount = 0

        // Render end tag
        markup += imgMarkup
        markup += '</div>'
        markup += '\n'
        markup += '\n'
      } else {
        // Render open tag
        markup += '<div class="post-image post-image--split">'
        markup += '\n'
        markup += imgMarkup
      }
    } else {
      // Render open & end tag
      markup += '<div class="post-image">'
      markup += '\n'
      markup += imgMarkup
      markup += '</div>'
      markup += '\n'
      markup += '\n'
    }

    console.log('Processed: ' + getMarker(bytes.threeTimes)(path.basename + path.extname) + '\t' + sizeReport)
  })

  return gulp.src([destinationFolder + '/*.jpg', '!' + destinationFolder + '/*@*.jpg'])
    .pipe(sorter)
    .pipe(builder)
    .on('end', function () {
      clipboard.copy(markup)

      folderSize(destinationFolder, function (err, size) {
        if (err) throw err

        console.log('----------------------------------------')
        console.log('Total filesize: ' + chalk.green(filesize(size)))
        console.log('----------------------------------------')

        notifier.notify({
          title: 'Export done',
          message: 'Total size: ' + filesize(size),
          icon: 'img/dude.png',
          sound: true
        })
      })
    })
})
