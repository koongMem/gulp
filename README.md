# SANT

一个H5活动项目的大构建环境，所有项目都集中在 `projects` 目下。


## 指令

`gulp new` 

创建新的项目，需要项目名称。

每个项目下都有一个`config.js`用于设置项目运行、打包参数

`gulp server`

开启本地服务器

`gulp build`

打包项目，含 **替换七牛CDN、替换jsuper密文、替换文件版本号、压缩zip文件**

```
|- projects
|-- prjectName
|---dist   [编译文件]
|---build  [压缩包文件]
|---webapp [源文件]
```

## 指令参数

`-p` `--project`

项目名称

## 使用事项

### 样式文件预编译

现在放弃使用 Compass 换用 postcss ，但仍保留 `*.scss` 等一些语法（不全支持 scss 语法，具体支持看：https://github.com/jonathantneal/precss）

利用 postcss-utilities 内置了多种方法，非常省心！！！

高亮可以使用vscode插件 https://marketplace.visualstudio.com/items?itemName=ricard.PostCSS

```css
/*例子*/
@util clearfix; 
```

**支持插件**

* [postcss-utilities](https://github.com/ismamz/postcss-utilities) 囊括了最常用的简写方式和书写帮助。
* [postcss-sprites](https://github.com/2createStudio/postcss-sprites) 能生成雪碧图。

#### 适配移动端

现在仅接入了[amfe-flexible](https://github.com/amfe/lib-flexible)

如果使用flexible，请参考以下代码

```html
    <!-- 引用放在 header位置 -->
    <!-- inline 属性表示打包过程直接打进行内，js、css都可以 -->
    <script src="./statics/vendors/flexible.js" inline></script>
```

#### 雪碧图

不需要再调用任何方法。查看下面例子

图片名字不含`@2x`,`@3x`的默认当`@2x`处理。（因为主流移动端设备已经基本都是2x屏）

**sprite-source** 存放图标的目录，需要分组的话创建一个文件夹即可。如：`sprite-source/user` => `sprite.user.png`

**多个样式文件无法分开引入背景图，因为会存在覆盖前一个雪碧图的情况。如果需要在多个样式文件重复利用雪碧图，应该单独一个雪碧图的样式文件并且`import`方式使用。**

```css
/* Before */
.icon {
    background: url(../sprite-source/like/like-active.png) no-repeat 0 0;
}
/* After */
.icon{
    background-image:url(../images/sprite/sprite.like.png);
    background-position:0px 0px;
    -webkit-background-size:50px 40px;
            background-size:50px 40px;
}
```