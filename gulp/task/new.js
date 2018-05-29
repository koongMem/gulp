var gulp = require('gulp'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    through2 = require('through2'),
    argv = require('yargs').argv,
    Vars = require('../vars'),
    dateformat = require('dateformat'),
    inquirer = require('inquirer'),
    chalk = require('chalk'),
    PathConfig = Vars.PathConfig,
    getProjectName = Vars.getProjectName;

/**
 * 初始化新项目
 */

gulp.task('new', function(cb) {
    Vars.getProjectPath().then(function(basePath) {
        createDirs(basePath);
        copyFiles(basePath).then(function() {
            cb();
        });
    }, function(_) {

    });
});


function createDirs(basePath) {
    var sourcePath = path.join(basePath, 'webapp');
    var staticsPath = path.join(sourcePath, 'statics');
    [Vars.getProjectsPath(),
        basePath,
        sourcePath,
        staticsPath,
    path.join(staticsPath, 'images'),
    path.join(staticsPath, 'sprite-source'),
    path.join(staticsPath, 'scripts'),
    path.join(staticsPath, 'pcss')
    ].forEach(function(e) {
        if(!fs.existsSync(e))
            fs.mkdirSync(e);
    });
}

function copyFiles(basePath) {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'projectCNName',
            message: chalk.yellow('项目中文名：'),
        },
        {
            type: 'input',
            name: 'author',
            message: chalk.yellow('开发负责人：'),
        },
        {
            type: 'input',
            name: 'pm',
            message: chalk.yellow('产品负责人：'),
        },
        {
            type: 'list',
            name: 'layoutMode',
            message: chalk.yellow('布局模式：'),
            choices: [{
                value: '',
                name: '不使用',
                checked: true
            }, {
                value: 'flexible',
                name: 'amfe-flexible （阿里开源库，利用了JS）',
                checked: false
            }]
        }
    ]).then(function(result) {
        result.projectDate = dateformat(new Date(), 'yyyy-mm-dd');
        [
            {
                source: path.join(__dirname, '..', 'template', 'projectConfig.js'),
                target: path.join(basePath, 'config.js'),
            },
            {
                source: path.join(__dirname, '..', 'template', 'projectReadme.md'),
                target: path.join(basePath, 'README.md'),
            }
        ].forEach(function(e) {
            fs.createReadStream(e.source)
                .pipe(through2(function(chunk, enc, callback) {
                    var s = _.template(chunk.toString())(result);
                    this.push(s);
                    callback();
                }))
                .pipe(fs.createWriteStream(e.target));
        });
    });

}