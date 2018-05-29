
var gulp = require('gulp'),
    fs = require('fs'),
    argv = require('yargs').argv;

require('./gulp/vars').setBasePath(__dirname);



require('./gulp/task/new');
require('./gulp/task/postcss');
require('./gulp/task/bower');
require('./gulp/task/html');
require('./gulp/task/server');
require('./gulp/task/typescript');
require('./gulp/task/build');
require('./gulp/task/inline');