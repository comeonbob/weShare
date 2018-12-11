---
title: weex入门篇(一)
categories: Evel
tags: weex
date: "2018-12-11"
---

Weex 致力于使开发者能基于当代先进的 Web 开发技术，使用同一套代码来构建 Android、iOS 和 Web 应用。

weex SDK 集成了vueJS，Rax,不需要额外引入。



#### 一）环境的搭建

1）搭建android环境：首先安装搭建好AndroidStudio，参照react-native 官网环境搭建（比较清楚），适用于weex。

2）安装weex环境

```
$ npm install -g weex-toolkit
$ weex -v //查看当前weex版本
```

3）初始化一个项目

```
$ weex create 项目名字
```

4）我们先通过 `npm install` 安装项目依赖。之后运行根目录下的 `npm run dev & npm run serve`开启 watch 模式和静态服务器。然后我们打开浏览器，进入 `http://localhost:8080/index.html` 即可看到 weex h5 页面。

5）默认情况下并不初始化ios和android项目，可以通过以下命令添加特定平台项目

```
weex platform add ios
weex platform add android
```

运行下面的命令，可以在模拟器或真实设备上启动应用

> weex run ios
> weex run android
> weex run web



#### 二）真机调试

weex拥有自己的调试功能 weex-toolkit

```
$ npm install -g weex-toolkit
```

> weex debug 

这条命令会启动一个调试服务，并且在 Chrome （目前只支持基于 V8 引擎的桌面浏览器） 中打开调试页面。

当然也可选择进行真机调试

首先安装一个adb,下载地址： http://adbshell.com/downloads ，
正确安装adb：https://jingyan.baidu.com/article/22fe7cedf67e353002617f25.html ,

通过usb链接手机，电脑，执行命令 weex run android



#### 三）开发注意

1）关于全局对象：

在开发h5项目的时候会经常性的使用到document，history，location，navigator，window，screen等一些全局变量，但是在开发三端兼容的项目的时候不能使用。

window、screen -----> WXEnvironment或者weex.config.env.platform

document ----->  weex.requireModule("dom")

2）关于导航：

weex集成了vueRouter，但是使用vueRouter只是单页面，在浏览器中的vue应用，通过浏览器的“前进”，”后退“仍然会处于同一个页签，但是在原生应用中的”前进“，”后退“则会跳出这个页签到其他页面。因此建议使用weex的提供的navigator进行页面跳转。

3）关于css样式：

4）静态资源图片的加载web，android，ios三个平台的加载方式有不同，要做代码处理

https://www.sunzhongwei.com/weex-android-ios-loaded-local-pictures

5）关于在weex中使用vue

不支持v-html 、v-show、transition、transition-group、keep-alive、v-cloak





