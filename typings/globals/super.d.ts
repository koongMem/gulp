interface Helper {
    /**
        * 浏览器类型
        * @return {Object}    {weixin:true,bb:false}
        */
    browser: {
        /**
         * 微信
         */
        weixin: Boolean,
        /**
         * 微博
         * 
         * @type {Boolean}
         */
        weibo: Boolean,
        /**
         * 表表
         * 
         * @type {Boolean}
         */
        bb: Boolean
    },
    /**
     * 发起post请求
     * 
     * @param {JQueryAjaxSettings} opts 
     * @returns {Promise<Object>} 
     * @memberof Helper
     */
    fetch(opts: JQueryAjaxSettings): Promise<Object>,
    /**
     * 百度统计
     * 
     * @param {String} id 
     * @memberof Helper
     */
    bdTongJi(id: String),
    /**
     * 谷歌统计
     * 
     * @param {String} id 
     * @memberof Helper
     */
    ggTongJi(id: String),
    /**
     * 是否对象
     * 
     * @param {*} _ 
     * @returns {boolean} 
     * @memberof Helper
     */
    isObject(_: any): boolean,
    isString(_: any): boolean,
    isArray(_: any): boolean,
    isFunction(_: any): boolean,
    isInArray(_: any): boolean,
    /**
     * 字符串参数转对象
     * 
     * @param {String} str 
     * @returns {Object} 
     * @memberof Helper
     */
    queryStringParse(str: String): Object,
    /**
     * 查询参数对象转字符串
     * 
     * @param {Object} obj 
     * @returns {String} 
     * @memberof Helper
     */
    queryObjcetStringify(obj: Object): String,
    /**
     * 获取QueryString的对象值
     * 如果不传参数则返回整个对象.
     * 
     * @param {String} [str] 
     * @returns {(Object | String)} 
     * @memberof Helper
     */
    getUrlParams(str?: String): any,
    /**
         * Before ，aop形式，可设置执行fn前执行另外一个function
         * @param  {Function} fn     主要的Function
         * @param  {Function}   before 提前执行的Function
         * @return {Function}          返回处理好的Function
         * @example
         * var fn = function(){
         *     console.log(2)
         * }
         *
         * fn=Super.helper.before(fn,function(){
         *     console.log(1)
         * })
         *
         * fn();
         */
    before(fn: Function, before: Function),
    cookies: any,
    each(datas: Array<any>, cb: Function),
    validData: any,
    throttle: any
}

interface Sunny {
    version: String,
    $: JQueryStatic,
    helper: Helper,
    weixin: any,
    view: {
        template: ArtTemplate
        injectHtml(data: Object)
    },
    ui: {
        toast(msg: String, callback?: Function, holdTime?: Number)
    },
    applink(action, params?)
}

interface ArtTemplate {
    (id: String, data: Object): string,
    defaults: any,
    compile(templateId: String): Function
}

declare var sunny: Sunny;

declare var jsuper: any;
declare var _hmt: {
    push: Function
};