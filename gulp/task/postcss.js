var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    postcss = require('gulp-postcss'),
    postcssOrign = require('postcss'),
    autoprefixer = require('autoprefixer'),
    pump = require('pump'),
    changed = require('gulp-changed'),
    rename = require("gulp-rename"),
    argv = require('yargs').argv,
    Vars = require('../vars'),
    updateRule = require('postcss-sprites/lib/core').updateRule,
    PathConfig = Vars.PathConfig,
    getProjectName = Vars.getProjectName,
    getProjectPath = Vars.getProjectPath,
    getBuildPath = Vars.getBuildPath,
    _projectPath;



/**
 * 处理样式文件
 */

gulp.task('postcss', function(cb) {
    getProjectPath().then(function(projectPath) {
        try {
            _projectPath = projectPath;
            var projectConfig = Vars.getProjectConfig(projectPath);
            var pcssPath = path.join(projectPath, PathConfig.source, PathConfig.pcss);
            var sourcePath = path.join(pcssPath, '**/*.*');
            var ignorePath = path.join(pcssPath, '**/_*');
            var destPath = path.join(Vars.getBuildPath(projectPath), PathConfig.css);
            var transforms = [];
            var postcssPlugins = [
                require('precss')({ //PreCSS lets you use Sass-like markup and staged CSS features in CSS.
                    import: {
                        path: [
                            path.join(Vars.getRootPath(), 'common', 'pcss/'),
                            pcssPath
                        ],
                        extension: '.pcss'
                    }
                }),
                require('postcss-utilities')(),
                autoprefixer({
                    browsers: ['last 4 ios version', 'last 8 android version']
                })
            ];


            postcssPlugins.push(sprites(destPath));

            if (projectConfig.layoutMode === 'flexible') {
                postcssPlugins.push(
                    require('postcss-adaptive')({
                        remUnit: 75,
                        // autoRem: true
                    })
                );
            }


            if (Vars.isProduction) {
                postcssPlugins.push(
                    require('cssnano')({
                        preset: 'default',
                        zindex: false
                    })
                );
                postcssPlugins.push(require('postcss-inline-comment')())
                postcssPlugins.push(
                    require('postcss-discard-comments')({
                        removeAllButFirst: true
                    }));
            }

            // postcssPlugins.push(sprites(destPath));

            pump([
                gulp.src([sourcePath, '!' + ignorePath]),
                // changed(destPath, {
                //     extension: '.css'
                // }),
                postcss(postcssPlugins, {
                    syntax: require('postcss-scss')
                }),
                rename(function(path) {
                    path.extname = '.css';
                }),
                gulp.dest(destPath)
            ], cb);
        } catch (e) {
            console.log(e);
        }

    }, function() {

    });
});


/**
 * 缩略图
 */

function sprites(destPath) {
    return require('postcss-sprites')({
        stylesheetPath: destPath,
        spritePath: path.join(destPath, '..', 'images', 'sprite'),
        retina: true, //支持retina，可以实现合并不同比例图片
        spritesmith: {
            padding: 8
        },
        filterBy: function(image) {
            if (image.url.indexOf('sprite-source') > -1) {
                return Promise.resolve();
            }
            return Promise.reject();
        },
        groupBy: function(image) {
            var paths = image.url.split('/');
            paths = paths.slice(paths.indexOf('sprite-source'));
            if (paths.length > 2) {
                return Promise.resolve(paths[1]);
            }
            return Promise.reject();
        },
        hooks: {
            onUpdateRule: function(rule, token, image) {
                // console.log(rule)
                // console.log(token)
                // console.log(image)
                var projectConfig = Vars.getProjectConfig(_projectPath);


                if (projectConfig.spritesMode == 'flexible') {
                    image.spritesMode = 'flexible';
                    updateRule(rule, token, image);
                } else {
                    updateRule(rule, token, image);
                }
                // if (image.ratio < 2) {
                //     image.ratio = 2;
                //     updateRule(rule, token, image);
                // } else {

                // }
            }
        }
    })
}