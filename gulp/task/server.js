var gulp = require('gulp'),
    path = require('path'),
    watch = require('gulp-watch'),
    Vars = require('../vars'),
    url = require('url'),
    sequence = require('gulp-sequence'),
    connect = require('gulp-connect');


gulp.task('server', ['bower'], function(cb) {
    sequence('postcss', 'typescript', function() {
        Vars.getProjectPath().then(function(projectPath) {
            var projectConfig = require(path.join(projectPath, 'config.js'));
            var projectSourcePath = path.join(projectPath, Vars.PathConfig.source);

            //服务开启
            connect.server({
                port: projectConfig.port || 9000,
                host: '0.0.0.0',
                root: [projectSourcePath, path.join(projectPath, '/.tmp'), path.join(Vars.getRootPath(), 'common')],
                livereload: {
                    port: projectConfig.port ? +(20000 + projectConfig.port) : 35729
                },
                middleware: function(connect, o) {
                    var result = [];
                    if (projectConfig.proxies.enable) {

                        var proxy = require('proxy-middleware');

                        //注入服务
                        for (var i = 0; i < projectConfig.proxies.servers.length; i++) {
                            var proxyServer = projectConfig.proxies.servers[i];
                            var options = url.parse(proxyServer.url);
                            options.route = proxyServer.route;
                            result.push(proxy(options));
                        }

                        //改头跨域
                        result.push(function(req, res, next) {
                            res.setHeader('Access-Control-Allow-Origin', '*');
                            return next();
                        });
                    }

                    // result.push(function(req, res, next) {
                    //     var pathname = url.parse(req.url).pathname;
                    //     if(pathname === '/wxlogin') {
                    //         if(!req.headers.cookie || req.headers.cookie.indexOf('wxid=') === -1) {
                    //             res.writeHead(302, {
                    //                 'Location': 'http://wx.super.cn/oauth2/api/wx/oauth_redirect.action?uri=' +
                    //                 'http://192.168.10.233:9001&v=e78e9c06b788a6f3c62c1e7f24eb3806&scope=2'
                    //             });
                    //             res.end();
                    //         } else {
                    //             res.writeHead(302, {
                    //                 'Location': 'http://192.168.10.233:9001',
                    //                 'Set-Cookie': 'myCookie=234;path="/"'
                    //             });
                    //             res.end();
                    //         }
                    //     } else {
                    //         return next();
                    //     }
                    // });
                    return result;
                }
            });

            //检测文件变动
            watch([projectSourcePath + '/**/*.{html,js,png,gif,jpg}',
                projectPath + '/.tmp/**/*.{css,png,js}'
            ], function(event) {
                gulp.src(event.path).pipe(connect.reload());
            });

            //检测scss变化
            watch([projectSourcePath + '/**/*.scss'], function() {
                gulp.run(['postcss'])
            });

            //检测pcss变化
            watch([projectSourcePath + '/**/*.pcss'], function() {
                gulp.run(['postcss'])
            });

            

            //检测typescript变化
            watch([projectSourcePath + '/**/*.ts'], function() {
                gulp.run(['typescript']);
            });

            cb()
        });
    })
});