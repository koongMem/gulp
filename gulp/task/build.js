var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    pump = require('pump'),
    watch = require('gulp-watch'),
    clean = require('gulp-clean'),
    _ = require('lodash'),
    chalk = require('chalk'),
    copy = require('gulp-copy'),
    uglify = require('gulp-uglify'),
    through2 = require('through2'),
    inquirer = require('inquirer'),
    htmlmin = require('gulp-html-minifier'),
    imagemin = require('gulp-imagemin'),
    dateformat = require('dateformat'),
    zip = require('gulp-zip'),
    imageminPngquant = require('imagemin-pngquant'),
    sequence = require('gulp-sequence'),
    mkdirp = require('mkdirp'),
    Vars = require('../vars');

var PathConfig = Vars.PathConfig;


var REG_jsuper = /jsuper.config\(.*?ciphertext:['"](.*?)['"]/ig; //判断是否有添加客户端验证
gulp.task('validJSuperCiphertext', function(cb) {
    Vars.getProjectPath().then(function(projectPath) {
        var destPath = path.join(Vars.getBuildPath(projectPath), PathConfig.scritps);
        var projectConfig = Vars.getProjectConfig(projectPath);
        var ciphertext = projectConfig.production.jsuperCiphertext;
        pump(
            [
                gulp.src([destPath + '/**/*.js']),
                through2.obj(function(file, enc, cb) {
                    var content = file.contents.toString(enc);
                    var match = REG_jsuper.exec(content);
                    if (match) {
                        var jsciphertext = match[1];
                        if (!ciphertext && jsciphertext !== '8e1586fcae9fb7a3c0488ca57a8bd611') {
                            inquirer.prompt([{
                                type: 'confirm',
                                name: 'ciphertext',
                                message: chalk.red('发现你调用了jsuper，但项目设置编译密文为空并且密文不是') +
                                    chalk.blue('a.super.cn') +
                                    chalk.red('域名的密文。是否需要更换为该域名的密文？')
                            }]).then(function(result) {
                                if (result.ciphertext) {
                                    content = content.replace(jsciphertext, '8e1586fcae9fb7a3c0488ca57a8bd611');
                                    file.contents = new Buffer(content, enc);
                                }
                                cb(null, file);
                            });
                        } else if (ciphertext !== jsciphertext) {
                            console.log(chalk.blue('替换jsuper密文为：') + chalk.red(ciphertext))
                            content = content.replace(jsciphertext, ciphertext);
                            file.contents = new Buffer(content, enc);
                            cb(null, file);
                        } else {
                            cb(null, file);
                        }
                    } else {
                        cb(null, file);
                    }
                }),
                gulp.dest(destPath)
            ],
            cb
        );
    });
});


gulp.task('copyJSFileToDest', function(cb) {
    Vars.getProjectPath().then(function(projectPath) {
        var sourcePath = path.join(projectPath, PathConfig.source);
        var destPath = path.join(Vars.getBuildPath(projectPath), PathConfig.scritps);
        pump(
            [
                gulp.src([sourcePath + '/statics/scripts/**/*.js']),
                uglify(),
                gulp.dest(destPath)
            ],
            cb
        );
    });
});

gulp.task('miniJS', function(cb) {
    Vars.getProjectPath().then(function(projectPath) {
        var sourcePath = path.join(projectPath, PathConfig.source);
        var destPath = path.join(Vars.getBuildPath(projectPath), PathConfig.scritps);
        pump(
            [
                gulp.src([destPath + '/**/*.js']),
                uglify(),
                gulp.dest(destPath)
            ],
            cb
        );
    });
});

gulp.task('copyOtherFileToDest', function(cb) {
    Vars.getProjectPath().then(function(projectPath) {

        var sourcePath = path.join(projectPath, PathConfig.source);
        var destPath = path.join(Vars.getBuildPath(projectPath));

        pump(
            [
                gulp.src([sourcePath + '/statics/**/*', '!' + sourcePath + '/statics/pcss{,/**}',
                    '!' + sourcePath + '/statics/scripts{,/**}',
                    '!' + sourcePath + '/statics/sprite-source{,/**}',
                    '!' + sourcePath + '/statics/images{,/**}'
                ], {
                    base: sourcePath
                }),
                gulp.dest(destPath)
            ],
            cb
        );
    });
});

gulp.task('minImage', function(cb) {
    Vars.getProjectPath().then(function(projectPath) {

        var sourcePath = path.join(projectPath, PathConfig.source);
        var destPath = path.join(Vars.getBuildPath(projectPath), PathConfig.images);

        pump([
            gulp.src(sourcePath + '/statics/images/**'),
            imagemin([imageminPngquant(), imagemin.gifsicle(), imagemin.jpegtran(), imagemin.optipng(), imagemin.svgo()]),
            gulp.dest(destPath)
        ], cb);
    });
});


var REG_vendor = /\/vendors\/(.*)?\.(js|css)/gi;
var REG_define_vendor = /\/?vendors\/(.*?)["']/gi;
gulp.task('copyVendorFiles', function(cb) {
    Vars.setEnvironment('production');
    Vars.getProjectPath().then(function(projectPath) {

        var vendrosPath = path.join(Vars.getRootPath(), 'common', 'statics', 'vendors');
        var projectDestPath = path.join(Vars.getBuildPath(projectPath));
        var vendorsDest = path.join(projectDestPath, PathConfig.vendors);
        if (!fs.existsSync(vendorsDest))
            mkdirp.sync(vendorsDest);
        pump([
            gulp.src(projectDestPath + '/**/*.{html,js}'),
            through2.obj(function(file, enc, cb) {
                REG_vendor.lastIndex = -1;
                REG_define_vendor.lastIndex = -1;
                var filePath = file.path;
                var fileType = filePath.slice(_.lastIndexOf(filePath, '.') + 1, filePath.length);

                var content = file.contents.toString(enc);

                var match = true;



                while (match) {
                    try {
                        copyVF();
                    } catch (e) {
                        console.error('err:' + e)
                    }
                }

                function copyVF() {
                    switch (fileType) {
                        case 'html':
                            match = REG_vendor.exec(content);
                            break;
                        case 'js':
                            match = REG_define_vendor.exec(content);
                            break;
                    }
                    if (match) {
                        var fileName = match[1] + '.' + (fileType === 'html' ? match[2] : "js");
                        var vendorFilePath = path.join(vendrosPath, fileName);
                        var destfilePath = path.join(vendorsDest, fileName);


                        if (fs.existsSync(vendorFilePath) && !fs.existsSync(destfilePath)) {
                            mkdirp.sync(destfilePath.substring(0, destfilePath.lastIndexOf(path.sep)));
                            fs.createReadStream(vendorFilePath).pipe(fs.createWriteStream(destfilePath));
                        }
                    }
                }

                cb();
            })
        ], cb);
    });
});

gulp.task('cleanBuildDest', function(cb) {
    Vars.getProjectPath().then(function(projectPath) {

        var destPath = path.join(Vars.getBuildPath(projectPath));
        pump([
            gulp.src(destPath, {
                read: false
            }),
            clean()
        ], cb);
    });
});

gulp.task('zip', function(cb) {
    Promise.all([Vars.getProjectName(), Vars.getProjectPath()])
        .then(function(args) {
            var projectName = args[0],
                projectPath = args[1];
            var destPath = path.join(Vars.getBuildPath(projectPath), '**/*');
            pump([
                gulp.src(destPath),
                zip(projectName + '.' + dateformat(new Date(), 'yyyy-mm-dd_HHMM') + '.zip'),
                gulp.dest(path.join(projectPath, 'build/'))
            ], cb);
        });
});

gulp.task('htmlmini', function(cb) {
    Vars.getProjectPath().then(function(projectPath) {
        var destPath = path.join(Vars.getBuildPath(projectPath));
        pump(
            [
                gulp.src([destPath + '/**/*.html']),
                htmlmin({
                    collapseWhitespace: true
                }),
                gulp.dest(destPath)
            ],
            cb
        );
    });
})


gulp.task('build', ['bower'], function(cb) {
    Vars.setEnvironment('production');

    Vars.getProjectPath().then(function(projectPath) {
        var projectConfig = Vars.getProjectConfig(projectPath);
        if (!projectConfig.production.cdn) {
            return inquirer.prompt([{
                type: 'input',
                name: 'cdn',
                message: chalk.bgYellow(chalk.red('项目配置中未找到CDN设置，打包编译务必将静态文件上传七牛。\n')) +
                    chalk.bgRed('请输入静态资源七牛地址：')
            }]).then(function(result) {
                projectConfig.production.cdn = result.cdn || '.';
            });
        }
    }).then(function() {
        return inquirer.prompt([{
            type: 'confirm',
            name: '__tongji',
            message: chalk.bgRed(chalk.yellow('你配置了百度、谷歌统计了吗？没什么就问问而已！提醒一下。\n'))
        }]);
    }).then(function() {
        /*run-sequence gulp 的 task 都是并行(异步)执行，如果遇见需要串行的场景，那么这个插件就是必备了。
        使用场景例如：处理(压缩、合并等等) CSS/JS、再gulp-rev、再上传 CDN；然后使用 CDN的地址替换 HTML 中的 CSS/JS 地址，再压缩 HTML。
        那么替换 HTML 这步须在之前的工作处理完后再执行。 
        ** 最后要说，gulp4.0发布后，不需要RS也可以搞定串行任务了 ***/
        sequence(
            'cleanBuildDest', ['postcss', 'typescript', 'html', 'copyOtherFileToDest', 'copyJSFileToDest'], ['copyVendorFiles', 'htmlmini'],
            'validJSuperCiphertext', ['inline', 'minImage'],
            'zip', cb);
    });
});