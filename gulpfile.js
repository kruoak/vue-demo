'use strict'

const gulp      = require('gulp')
const q         = require('q')
const gls       = require('gulp-live-server')
const watch     = require('gulp-watch')
//const babel     = require('gulp-babel')
//const sass      = require('gulp-sass')
//const uglifycss = require('gulp-uglifycss')
//const plumber   = require('gulp-plumber')

gulp.task('server' /*, ['server-babel']*/, function() {
  var server = gls.new(['dist/app.js', '']);
  var restartTimer = null

  const serverRestart = function() {
    if (restartTimer != null) {
      console.log('PREPARE TO RESTART')
      clearTimeout(restartTimer)
    }
    restartTimer = setTimeout(function() {
      console.log('SERVER RESTART...')
      server.start()
      restartTimer = null
    }, 2000)
  }

  server.start();
  gulp.watch(['dist/server/**/*.js', 'dist/*.js'], function() {
    serverRestart();
  });
})

gulp.task('css', function() {
  gulp.watch(['src/scss/*.scss'], function() {
    console.log('Compling scss')
    setTimeout(function() {
      gulp.src('src/scss/main.scss')
  //      .pipe(watch('src/scss/main.scss'))
        .pipe(plumber())
        .pipe(sass())
        .pipe(uglifycss({
          "max-line-len": 80
        }))
        .pipe(gulp.dest('dist/public/css'))
      gulp.src('src/scss/signon.scss')
  //      .pipe(watch('src/scss/signon.scss'))
        .pipe(plumber())
        .pipe(sass())
        .pipe(uglifycss({
          "max-line-len": 80
        }))
        .pipe(gulp.dest('dist/public/css'))
    },100)
  });
})

gulp.task('copy', function() {
  let all = []
  all.push(gulp.src('src/public/**/*')
    .pipe(gulp.dest('dist/public')))
  all.push(gulp.src('src/server/views/*')
    .pipe(gulp.dest('dist/server/views')))
  all.push(gulp.src('src/*.js')
    .pipe(gulp.dest('dist')))
  all.push(gulp.src('src/server/**/*.js')
    .pipe(gulp.dest('dist/server')))
  all.push(gulp.src('src/lib/**/*.js')
    .pipe(gulp.dest('dist/lib')))

  gulp.src('src/public/**/*')
    .pipe(watch('src/public/**/*'))
    .pipe(gulp.dest('dist/public'))
  gulp.src('src/server/views/*')
    .pipe(watch('src/server/views/*'))
    .pipe(gulp.dest('dist/server/views'))
  gulp.src('src/*.js')
    .pipe(watch('src/*.js'))
    .pipe(gulp.dest('dist'))
  gulp.src('src/server/**/*.js')
    .pipe(watch('src/server/**/*.js'))
    .pipe(gulp.dest('dist/server')),
  gulp.src('src/lib/**/*.js')
    .pipe(watch('src/lib/**/*.js'))
    .pipe(gulp.dest('dist/lib'))

  return q.all(all)
})

gulp.task('default', ['copy'], function () {
  gulp.start('server');
})
