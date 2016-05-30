/*
 * @Author:sloong
 * @Date: 2016-05-27
 */
'use strict';

let gulp = require('gulp');
let webpack = require('webpack')

let gutil = require('gulp-util')
//let webpackConf = require('./webpack-dev.config')
let webpackConf = require('./webpack.config')

let src = process.cwd() + '/src'
let assets = process.cwd() + '/assets'

//js check
gulp.task('hint', () => {
    let jshint = require('gulp-jshint')
    let stylish = require('jshint-stylish')

    return gulp.src([
        '!' + src + '/js/lib/**/*.js',
        src + '/js/**/*.js'
    ])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
})

//clean assets
gulp.task('clean', ['hint'], ()=> {
    let clean = require('gulp-clean')

    return gulp.src(assets, {read: true}).pipe(clean())
})

//run webpack page
/*gulp.task('pack',['clean'],(done)=>{
 webpack(webpackConf,(error,stats) =>{
 if(err) throw new gutil.PluginError('webpack',err)
 gutil.log(['webpack'],stas.toString({colors:true}))
 done()
 })
 })

 //default task
 gulp.task('default',['pack'])*/

//gulp-min ºÍ html-loader ³åÍ»
/*gulp.task('default', ['pack'], () => {
 let replace = require('gulp-replace')
 let htmlmin = require('gulp-htmlmin')

 return gulp
 .src(assets + '/!*.html')
 // @see https://github.com/kangax/html-minifier
 .pipe(htmlmin({
 collapseWhitespace: true,
 removeComments: true
 }))
 .pipe(gulp.dest(assets))
 })*/

//deploy assets to remote server
gulp.task('deploy', ()=> {
    let sftp = require('gulp-sftp')

    return gulp.src(assets + '/**')
        .pipe(sftp({
            host: '[remote server ip]',
            remotePath: '/www/app/',
            user: 'foo',
            pass: 'bar'
        }))
})

