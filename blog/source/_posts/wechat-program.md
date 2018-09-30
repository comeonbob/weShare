---
title: 微信小程序--入门篇
categories: Emfan
tags: 微信
date: "2018-04-27"
---


>### 准备工作

-   申请小程序账号 [@申请网址](https://mp.weixin.qq.com/wxopen/waregister?action=step1)

-   下载[开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html?t=2018424) ， 根据自己的操作系统下载对应的安装包进行安装，有关开发者工具更 详细的介绍可以查看[《开发者工具介绍》](https://developers.weixin.qq.com/miniprogram/dev/devtools/devtools.html?t=2018424)

-   新建一个小程序项目，填入申请后得到的小程序AppID、项目名称，选择"普通快速开发模式"，点击确定，而后展示如下(包含左侧编译预览、右侧项目结构)：

    ![初始页面](/img/init.png)



> ### 基本概念

- 初始化的项目结构中，包含了一些简单的代码文件，其中app.js、app.json、app.wxss这三个文件是必不可少，小程序会读取这些文件初始化实例。（**注意：这三个文件名称不可任意修改**）
- 在小程序中，wxml/wxss/js/json对应着我们平时写的html/css/js/json文件。
- app.js是小程序的初始化脚本，可以在这个文件中监听小程序的生命周期，申请全局变量和调用API等等。
- app.json是对小程序的全局配置，其中的pages是设置所有的页面路径（**默认第一条为首页，即启动页**）， window是设置页面的窗口表现等。
- app.wxss是整个小程序的公共样式表。
- 在pages的目录下，每个文件夹目录里面由四种不同类型的文件组成，其中包含.js,.json,wxss,wxml，其中的.json,.wxss文件为非必须，因为不写代码可以默认继承app的全局app.json,app.wxss文件的设置。



>### 具体文件分析

- 全局配置文件：`app.json`主要分为五个部分：pages：页面路径组，window：框架样式（状态栏、导航条、标题、窗口背景色），tabBar：底部菜单，networkTimeout：网络超时设置，debug：开启debug模式。

  **注**：page.json(page目录下，每个页面文件夹中的logs.json/index.json.....的统称)可以对页面进行单独的配置，覆盖app.json的全局配置。

  ```json
  // app.json
  {
    "pages":[
      "pages/index/index",
      "pages/logs/logs"
    ],
    "window":{
      "backgroundTextStyle":"light",
      "navigationBarBackgroundColor": "#000",
      "navigationBarTitleText": "WeChat",
      "navigationBarTextStyle":"white",
      "enablePullDownRefresh":"true"    //导航栏能够下拉刷新
    },
    "tabBar":{       //在“tabBar”中配置底端的标题栏信息
      "color":"#666",     //图片颜色为灰色
      "selectedColor":"#268dcd",  //图片被选中颜色为蓝色
      "borderStyle":"black",   //边框颜色为黑色
      "backgroundColor":"#fafafa",  //子标题栏背景色为白色
      "list":[     //"list"中存放底端的几个子导航栏信息，数量范围2~5
        {
          "pagePath":"pages/index/index",  //该子导航点击后要跳转的页面
          "iconPath":"images/icons/homeD.png",  //该子导航设置的图片，这里用的是图片的相对路径
          "selectedIconPath":"images/icons/homeS.png",  //该子导航被点击后显示的图片
          "text":"首页"   //该子导航显示的文字
        },
        {
          "pagePath":"pages/news/news",
          "iconPath":"images/icons/newsD.png",
          "selectedIconPath":"images/icons/newsS.png",
          "text":"新闻中心"
        }
      ]
    },
    "networkTimeout":{ //网络请求超时设置
      "request": 10000,
      "downloadFile": 10000
    },
    "debug":"true"   //设置是否开启debug模式
  }
  ```

- 使用App()来全局注册一个小程序，必须是在`app.js`文件中注册，并且不能注册多个 。

  ```javascript
  App({ //如下为小程序的生命周期
    onLaunch: function() {},//监听初始化
    onShow: function() {},//监听显示（进入前台）
    onHide: function() {},//监听隐藏（进入后台：按home离开微信）
    onError: function(msg) {},//监听错误
    //如下为自定义的全局方法和全局变量  
    globalFun:function(){},
    globalData: 'Hello World'
  })
  ```

- 使用 Page()注册一个页面，在每个页面的`.js`文件中注册。

  **注**： 在小程序的`.js`文件中，若想对data中的变量进行赋值操作，必须通过`this.setData({变量名:值})`， 类似于`React`中的变量状态修改，`this.data.变量名 = 值 `或`this.变量名=值`都不支持，获取data中的变量值也需要使用`this.data.变量名`。 

  ```javascript
  Page({
    data: {text: "This is page data."},//页面数据，用来维护视图，json格式
    onLoad: function(options) {},//监听加载
    onReady: function() {},//监听初次渲染完成
    onShow: function() {},//监听显示
    onHide: function() {},//监听隐藏
    onUnload: function() {},//监听卸载
    onPullDownRefresh: function() {},//监听下拉
    onReachBottom: function() {},//监听上拉触底
    onShareAppMessage: function () {},//监听右上角分享
    //如下为自定义的事件处理函数（视图中绑定的）
    viewTap: function() {//setData设置data值，同时将更新视图
      this.setData({text: 'Set some data for updating view.'})
    }
  })
  ```

- 小程序的视图与事件绑定：在每个页面的`.wxml`文件中，对页面`js`中的`data`进行 数据绑定 ，以及自定义事件绑定。

  - 从下边的例子可以看到，小程序的 `wxml`用到一些标签是 view, button, text,template 等等，这些标签就是小程序给开发者包装好的基本能力，就是可以直接使用的组件，更多详细组件功能可以参考：[小程序**·** 组件](https://developers.weixin.qq.com/miniprogram/dev/component/) 
  - 还有一些`wx:for`,`wx:if`之类的条件绑定，因为小程序采用的也是`MVVM `的开发模式(例如 React, Vue)，就是把渲染和逻辑分离。

  ```html
  <!--{{}}绑定data中的指定数据并渲染到视图-->
  <view class="title">{{text}}</view>

  <!--wx:for获取数组数据进行循环渲染，item为数组的每项-->
  <view wx:for="{{array}}"> {{item}} </view>

  <!--wx:if条件渲染-->
  <view wx:if="{{view == 'WEBVIEW'}}"> WEBVIEW </view>
  <view wx:elif="{{view == 'APP'}}"> APP </view>
  <view wx:else="{{view == 'MINA'}}"> MINA </view>

  <!--模板-->
  <template name="staffName">
    <view>FirstName: {{firstName}}, LastName: {{lastName}}</view>
  </template>
  <template is="staffName" data="{{...template.staffA}}"></template>
  <template is="staffName" data="{{...template.staffB}}"></template>

  <!--bindtap指定tap事件处理函数为ViewTap-->
  <view bindtap="ViewTap"> 点击此按钮 </view>
  ```

  ```javascript
  Page({
    data: {//data数据主要用于视图绑定
      text:"我是一条测试",
      array:[0,1,2,3,4],
      view:"APP",
      template:{
          staffA: {firstName: 'Bob', lastName: 'Gao'},
          staffB: {firstName: 'Bitch', lastName: 'Little'}
      }
    },
    ViewTap:function(){console.log('成功被点击')}//自定义事件，主要用于事件绑定
  })
  ```

- 每个页面文件夹中的`.wxss` ，顾名思义就是用来编写每个页面各自的样式，不写则默认呈现`app.wxss`文件的全局样式， 此外 `.wxss` 仅支持部分 `CSS 选择器`， 比如类名选择器(.)等..

  **注**： 在小程序中，扩展了`rpx`单位，用来代替`px`单位，编译时小程序底层会自动进行浮点数运算，平时怎么用`px`，就怎么用`rpx`。



> ### 补充说明

- 在各个页面的`.js`中调用`app.js` 的全局属性和方法，需要获取全局app实例，在`.js`顶部定义`const app = getApp()`, 使用时用`app.[方法名/属性名]` , 在`app.js`不需要再次获取实例，可以直接使用`this.[方法名/属性名]`。

- 公用的`js`方法可以放在utils文件夹中，可通过require引入，或者在pages同级目录新建文件夹及文件，个人建议pages目录最好只存放每个页面的`配置/DOM渲染/逻辑/样式`， 这样项目结构比较简单分明。

- 新建页面目录和文件，可以直接在`app.json`中的`pages`参数中，直接输入你需要创建相关目录名和文件名，点击保存，则小程序会自动为你生成对应的目录和文件(**注**：`.js/.json/.wxml/wxss`都会根据设置的文件名自动生成，无需在文件名后加后缀)。 当然，也可以在项目结构中点击右键去新建，`app.json`的`page参数`也会相应同步你新增的文件夹路径。个人推荐用第一种方法，因为第二种方法，经测试使用，感觉目前还存在一些bug，有时候创建文件，全局的`app.json`没有自动生成相对于的路径，导致编译的时候，还是需要手动去写入路径，否则控制台会报错，找不到你新建的文件。

- 跳转并刷新页面：需使用onshow来代替onload执行逻辑，onload只在首次打开页面时执行一次。如：B页面操作全局数据并跳转A页面，A页面onshow中获取全局数据更新视图。

  ​







