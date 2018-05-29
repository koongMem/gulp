var gulp = require('gulp'),
    _ = require('lodash'),
    fs = require('fs'),
    bower = require('gulp-bower'),
    mainBowerFiles = require('main-bower-files'),
    argv = require('yargs').argv,
    Vars = require('../vars'),
    inquirer = require('inquirer'),
    chalk = require('chalk'),
    exec = require('child_process').exec,
    PathConfig = Vars.PathConfig,
    getProjectName = Vars.getProjectName;


// gulp.task('install-bower', function() {
//     return bower('./bower_components');
// })

// gulp.task('bower', ['install-bower'], function() {
//     // bower('./bower_components');
//     return gulp.src(mainBowerFiles({
//         paths: Vars.getRootPath()
//     })).pipe(gulp.dest('common/statics/vendors'));
// });

gulp.task('bower', function(cb) {
    exec('cd ' + Vars.getRootPath() + ' & node node_modules/bower-installer/bower-installer.js', function(err, stdout, stderr) {
        cb(err);
    });
});