var gulp = require('gulp'),
    Vars = require('../vars'),
    pump = require('pump'),
    path = require('path'),
    inline = require('gulp-inline-source'),
    _ = require('lodash'),
    through2 = require('through2');

gulp.task('inline', function(cb) {

    Vars.getProjectPath().then(function(projectPath) {
        var destPath = Vars.getBuildPath(projectPath);
        pump([
            gulp.src(path.join(destPath, '**/*.html')),
            inline({
                rootpath: path.join(destPath),
            }),
            gulp.dest(destPath)
        ], cb);
    });
});