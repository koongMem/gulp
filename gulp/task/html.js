var gulp = require('gulp'),
    Vars = require('../vars'),
    pump = require('pump'),
    path = require('path'),
    htmlmin = require('gulp-html-minifier'),
    _ = require('lodash'),
    through2 = require('through2'),
    // hash = crypto.createHash('sha256'),
    cheerio = require('cheerio');

var PathConfig = Vars.PathConfig;


var hasPrototype = Object.prototype.hasOwnProperty;

gulp.task('html', function(cb) {
    Vars.getProjectPath().then(function(projectPath) {
        try {
            var projectConfig = Vars.getProjectConfig(projectPath);
            var htmlPath = path.join(projectPath, PathConfig.source, '**/*.html');
            var destPath = Vars.getBuildPath(projectPath);

            var cdnUrl = Vars.isProduction() ? projectConfig.production.cdn : projectConfig.develop.cdn;

            var version = projectConfig.production.staticsVersion || (Date.now() / 1000);
            var transforms = [
                gulp.src(htmlPath),
                through2.obj(function(file, enc, cb) {
                    var $ = cheerio.load(file.contents.toString(enc), {
                        decodeEntities: false
                    });
                    $('link,a').each(function(e) {
                        if (this.attribs.href && !hasPrototype.call(this.attribs, 'inline'))
                            this.attribs.href = appendVersion(replaceCDNSRC(this.attribs.href, cdnUrl), version);
                    });
                    $('script').each(function(e) {
                        if (this.attribs.src && !hasPrototype.call(this.attribs, 'inline'))
                            this.attribs.src = appendVersion(replaceCDNSRC(this.attribs.src, cdnUrl), version);
                    });
                    $('script[type="text/html"]').each(function(e) {
                        $(this).html(replaceHtmlCDNSRC($(this).html(), cdnUrl));
                    })
                    $('img').each(function(e) {
                        if (this.attribs.src && !this.attribs.inline)
                            this.attribs.src = replaceCDNSRC(this.attribs.src, cdnUrl);
                    });
                    file.contents = new Buffer($.html().replace(/inline=""/g, 'inline'), enc);
                    cb(null, file);
                })
            ];
            if (Vars.isProduction()) {
                // transforms.push(htmlmin());
            }
            transforms.push(gulp.dest(destPath));

            pump(transforms, cb);
        } catch (e) {
            console.error(e);
        }
    });
});


function replaceHtmlCDNSRC(html, cdn) {
    var html = html.replace(/('|")([^=\s]*?\.?\/?)statics\/(.*?)('|")/g, '$1' + (cdn ? cdn : '$2') + 'statics/$3$4');
    return html;
}

function replaceCDNSRC(originSrc, cdn) {
    if (_.startsWith(originSrc, '//')) return originSrc;

    var result = cdn;
    if (_.endsWith(result, '/'))
        result = result.slice(0, result.length - 1);

    var paths = originSrc.split('/');
    var staticsIndex = paths.indexOf('statics');


    if (staticsIndex < 0) return originSrc;
    paths = paths.slice(staticsIndex);

    _.forEach(paths, function(v) {
        if (v !== '.' && v !== '..') {
            result += '/' + v;
        }
    });
    return result;
}

function appendVersion(link, version) {
    var appendSplit = link.indexOf('?') > -1 ? '&' : '?';
    return link + appendSplit + '_v=' + version;
}