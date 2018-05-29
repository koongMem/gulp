var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    postcss = require('gulp-postcss'),
    uglify = require('gulp-uglify'),
    postcssOrign = require('postcss'),
    autoprefixer = require('autoprefixer'),
    ts = require("gulp-typescript"),
    pump = require('pump'),
    changed = require('gulp-changed'),
    rename = require("gulp-rename"),
    argv = require('yargs').argv,
    chalk = require('chalk'),
    Vars = require('../vars');

var PathConfig = Vars.PathConfig;



gulp.task('typescript', function(cb) {
    Vars.getProjectPath().then(function(projectPath) {
        try {
            var projectConfig = Vars.getProjectConfig(projectPath);
            var scritpsPath = path.join(projectPath, PathConfig.source, PathConfig.scritps);
            var sourcePath = path.join(scritpsPath, '**/*.ts');
            var destPath = path.join(Vars.getBuildPath(projectPath), PathConfig.scritps);
            var transforms = [
                gulp.src([
                    sourcePath,
                    path.join(Vars.getRootPath(), 'typings', '**/*.ts')
                ]),
                changed(destPath, {
                    extension: '.js'
                }),
                ts.createProject('tsconfig.json')()
            ];

            if(Vars.isProduction()) {
                transforms.push(uglify());
            }
            transforms.push(gulp.dest(destPath));

            pump(transforms, cb);
        } catch(e) {
            console.log(chalk.bgRed(e));
        }
    });
    // var dest = __STPATH() + '/scripts';
    // var pr = gulp.src(['typings/unknow.d.ts', projectSourcePath + '/statics/scripts/**/*.ts'], {
    //     // base: projectSourcePath + '/statics/scripts/'
    // })
    //     .pipe(changed(dest))
    //     .pipe(tsc());
    // if(mode === __BUILD) {
    //     pr.pipe(uglify());
    // }
    // pr.pipe(gulp.dest(dest));
});
