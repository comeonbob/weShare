---
title: AngularJS directive详解
categories: Bob
tags: Angular
date: "2018-03-28"
---

最近，维护一个Angular 1项目，在用过vue中element-ui后， 想自己也写一些类似组件；同时对比下angular的指令，与vue的单文件组件的用法。
今天的主题就是编写一个消息框 messageBox.
<!--more-->

![消息框](/img/angular_msgbox.png)

## 如何开始构思组件
(1) 组件的结构（html）

分析消息框组件的结构，首先想到的是，头部（标题+关闭按钮）， 主体（提示内容），底部（取消，确认按钮）;
后来考虑到遮罩问题， 所以还需要增加一个遮罩层。

``` html
<div class="cmp-message-box-wrap" ng-show="isShow">
  <div class="cmp-message-box">
    <header>
      <p class="mb-title" ng-bind="mbtitle"></p>
      <span class="mb-close-icon" ng-click="closeClick()">&#8855</span>
    </header>
    <div class="mb-content" ng-bind="mbcontent"></div>
    <div class="mb-btn-wrap">
      <span class="mb-cancel" ng-bind="cancelBtnText" ng-click="cancelClick()"></span>
      <span class="mb-confirm" ng-bind="confirmBtnText" ng-click="confirmClick()"></span>
    </div>
  </div>
  <div class="mb-mask">
  </div>
</div>
```

(2) 组件的样式

可能遇到难点，遮罩样式层级问题。整个外层是fixed，层级最低； 遮罩也是fixed， 层级高一点；消息框居中，层级最高。


``` css
/* MessageBox 消息框 */
.cmp-message-box-wrap {position: fixed; top: 0; left: 0; z-index: 9997; width: 100%; height: 100%; text-align: center; overflow: hidden; font-weight: normal; }
.cmp-message-box-wrap .mb-mask{ position: fixed; z-index: 9998; width: 100%; height: 100%; opacity: 0.7; background-color: #303133; }
.cmp-message-box-wrap .cmp-message-box{ position: fixed; z-index: 9999; width: 420px; top: 40%; background-color: #fff; display: inline-block; margin-left: -210px; text-align: left; border-radius: 4px; padding: 15px; }
.cmp-message-box-wrap .cmp-message-box header{ font-size: 18px; color: #303133; position: relative; }
.cmp-message-box-wrap .cmp-message-box header .mb-close-title{ font-size: 18px; color: #303133; }
.cmp-message-box-wrap .cmp-message-box header .mb-close-icon{ position: absolute; right: 0; top: -1px; color: #abadb2; cursor: pointer;}
.cmp-message-box-wrap .cmp-message-box header .mb-close-icon:hover{ color: #909399; }
.cmp-message-box-wrap .cmp-message-box .mb-content{ margin-top: 15px; color: #606266; font-size: 14px; line-height: 24px; }
.cmp-message-box-wrap .cmp-message-box .mb-btn-wrap{ margin-top: 15px; color: #606266; text-align: right; user-select: none; }
.cmp-message-box-wrap .cmp-message-box .mb-btn-wrap span{ padding: 9px 15px; font-size: 12px; border-radius: 3px; cursor: pointer; text-align: center; color: #606266; border: 1px solid #dcdfe6; display: inline-block; }
.cmp-message-box-wrap .cmp-message-box .mb-btn-wrap .mb-cancel{ margin-right: 10px; }
.cmp-message-box-wrap .cmp-message-box .mb-btn-wrap .mb-cancel:hover{ background: #e9e9e9; }
.cmp-message-box-wrap .cmp-message-box .mb-btn-wrap .mb-cancel:active{ background: #d6d3d3; }
.cmp-message-box-wrap .cmp-message-box .mb-btn-wrap .mb-confirm{ background: #7a7777; color: #fff; }
.cmp-message-box-wrap .cmp-message-box .mb-btn-wrap .mb-confirm:hover{ background: #8f8c8c; }
.cmp-message-box-wrap .cmp-message-box .mb-btn-wrap .mb-confirm:active{ background: #6b6868; }

```

(3) 组件的功能

组件功能包括
1. 取消，关闭按钮， 消息框消失；
2. 确认按钮，执行一件待定事情后， 消息框消失;
3. 点击遮罩层，可以配置是否消失消息框

(4) 逻辑编码
``` js
.directive('messageBox', function () {
    return {
        // 声明形式
        restrict: 'AE',
        // 参数传递
        scope: {
            // 标题
            mbtitle: '@',
            // 内容
            mbcontent: '@',
            // 取消按钮文字
            cancelBtnText: '@',
            // 确认按钮文字
            confirmBtnText: '@',
            // 是否显示消息框
            isShow: '=',
            // 关闭回调
            close: '&',
            // 取消回调
            cancel: '&',
            // 确认回调
            confirm: '&'
        },
        // 嵌入
        transclude: false,
        // 模板
        templateUrl:'/templates/messageBox.html',
        // 是否替换原有元素
        replace: true,
        // 指令优先级
        priority: 100,
        // 指令优先级终止
        terminal: false,
        // 编译前执行，外部交互的api，指令间复用，数据初始化
        controller: function($scope, $element, $attrs, $transclude) {
        },
        // 引用
        require: '',
        // 作用域与dom进行链接
        link: function ($scope, ele, attr) {
            // 点击关闭
            $scope.closeClick = function () {
                $scope.close();
                $scope.isShow = false;
            };
            // 点击取消
            $scope.cancelClick = function () {
                $scope.cancel();
                $scope.isShow = false;
            };
            // 点击确认
            $scope.confirmClick = function () {
                $scope.confirm();
                $scope.isShow = false;
            };
        }
    };
})
```
## 消息框注册成全局

Vue 中可以引入element-ui中的消息框， 然后挂载在vue的根实例上；
Angular 1中可以挂载到根作用域上$rootScope，html放在index.html中， 在.run()方法中初始化；

``` js
.run(function ($rootScope) {
    /* 初始化全局变量 */
    // 消息框
    $rootScope.$messageBoxData = {};
    /**
     * 
     * @param {*} mbTitle 标题
     * @param {*} mbContent 内容
     * @param {*} mbCancelBtnText 取消按钮文字
     * @param {*} mbConfirmBtnText 确认按钮文字
     * @param {*} closeCb 关闭图标事件
     * @param {*} cancelCb 取消按钮事件
     * @param {*} confirmCb 确认按钮事件
     */
    $rootScope.$messageBox = function (mbTitle, mbContent, mbCancelBtnText, mbConfirmBtnText, closeCb, cancelCb, confirmCb) {
        $rootScope.$messageBoxData.isMessageBoxShow = true;
        $rootScope.$messageBoxData.mbTitle = mbTitle;
        $rootScope.$messageBoxData.mbContent = mbContent;
        $rootScope.$messageBoxData.mbCancelBtnText = mbCancelBtnText;
        $rootScope.$messageBoxData.mbConfirmBtnText = mbConfirmBtnText;
        $rootScope.$messageBoxData.closeCb = closeCb;
        $rootScope.$messageBoxData.cancelCb = cancelCb;
        $rootScope.$messageBoxData.confirmCb = confirmCb;
    };
})
```

在任何controller中简单调用：

``` js
/**
    * 删除对话框
    */
function showDelDialog() {
    $rootScope.$messageBox('删除', '确定删除吗？', '取消', '确定', null, null, delConfirm);
}
```


## Angular 指令学习

参考：

https://segmentfault.com/a/1190000005851663

https://www.cnblogs.com/ermu-learn/p/5913760.html


---
*Bob*
