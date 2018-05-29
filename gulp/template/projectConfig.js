module.exports = {
    layoutMode: '<%=layoutMode%>', //布局方案，现在只支持 flexible 或 空 , 具体用法 https://github.com/amfe/lib-flexible
    port: 9000,
    proxies: { //请求转发服务
        enable: 1,
        servers: [
            // {
            //     url: 'http://192.168.0.36:8078/Shake',
            //     route: '/Shake',
            //     cookieRewrite: true
            // }
        ]
    },
    develop: {
        cdn: '.'  //静态地址
    },
    production: {//编译
        cdn: '', //静态文件CDN地址
        jsuperCiphertext: '',//jsuper密文
        staticsVersion: ''//静态文件版本号
    }
};