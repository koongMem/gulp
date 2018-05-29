var path = require('path'),
    chalk = require('chalk'),
    gutil = require("gulp-util"),
    inquirer = require('inquirer'),
    argv = require('yargs').argv;

var __basePath;
var __projectName;

var __environment = 'develop';

var __staticsPath = 'statics';

var config = {
    dest: 'dist',
    tmp: '.tmp',
    source: 'webapp',
    css: path.join(__staticsPath, 'css'),
    pcss: path.join(__staticsPath, 'pcss'),
    images: path.join(__staticsPath, 'images'),
    scritps: path.join(__staticsPath, 'scripts'),
    vendors: path.join(__staticsPath, 'vendors'),
    projects: 'projects'
};

var getBuildPathFn = function(projectPath) {
    if (isProduction()) {
        return path.join(projectPath, config.dest);
    } else {
        return path.join(projectPath, config.tmp);
    }
};

var getProjectNameFn = (function() {
    var P;
    return function() {
        if (!P) {
            P = new Promise(function(res, rej) {
                if (__projectName) {
                    res(__projectName);
                } else if (argv.p || argv.projcet) {
                    __projectName = argv.p || argv.projcet;
                    if (!/^[a-zA-Z][\w_]+$/.test(__projectName)) {
                        console.error(chalk.bgRed('项目名称，只能字母数字_，并且英文字母开头'))
                        rej(new Error('项目名称，只能字母数字_，并且英文字母开头'));
                    }
                    res(__projectName);
                } else {
                    inquirer.prompt([{
                        type: 'input',
                        name: 'projectName',
                        message: chalk.yellow('请输入项目名称：'),
                        validate: function(input) {
                            if (!/^[a-zA-Z][\w_]+$/.test(input)) {
                                return chalk.red('请输入项目名称，只能字母数字_，并且英文字母开头');
                            }
                            return true;
                        }
                    }]).then(function(answers) {
                        __projectName = answers.projectName;
                        res(__projectName);
                    });
                }
            });
        }
        return P;
    }
})();

var getProjectPathFn = function() {
    return getProjectNameFn().then(function(projectName) {
        return path.join(__basePath, config.projects, projectName);
    }, function(err) {
        throw err;
    });
};

exports.PathConfig = config;
exports.getRootPath = function() {
    return __basePath;
}
exports.getProjectsPath = function() {
    return path.join(__basePath, config.projects);
};
exports.getProjectName = getProjectNameFn;
exports.getProjectPath = getProjectPathFn;
exports.getBuildPath = getBuildPathFn;

exports.setBasePath = function(path) {
    __basePath = path;
};

function isProduction() {
    return __environment === 'production';
}

exports.isProduction = isProduction;

exports.setEnvironment = function(environment) {
    __environment = environment;
};

var ProjectConfigCache = {};

exports.getProjectConfig = function(projectPath) {
    return ProjectConfigCache[projectPath] || (ProjectConfigCache[projectPath] = require(path.join(projectPath, 'config.js')));
};