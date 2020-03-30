---
title: Hybrid通信原理--Jockey源码解析
categories: Bob
tags: Hybrid
date: "2020-03-30"
---

## 1. Hybrid通信原理

### 1.1 什么是Hybrid通信

本文讲的Hybrid通信指的是：在Hybrid框架中，H5与Native之间的交互。

交互包括两部分：

- H5访问Native，应用场景有设置导航栏，调用Native组件等；
- Native访问H5，应用场景有H5分享，执行H5回调等；

### 1.2 H5与Native交互实现原理

交互分成两中场景：

**H5访问Native**

1. H5发送`Scheme`请求，如`jockcy://xxx?param=xx`;
2. Native有一个进程监听webview中所有请求,解析url，然后处理事件；

**Native访问H5**

1. H5注册全局方法，挂载window对象上；
2. Native直接调用webview下的window对象上的方法；

想要实现上面功能，Jockey.js 是一个很好的选择，封装了H5与Native之间的交互，精简适用，接下来会逐步解析Jockey源码。

另外，若对前文提到Hybrid，Webview，Scheme等技术想更多了解，移步同事xiaobu的文章：[Hybrid简单了解](https://blog.bobgao.cn/hybrid-jian-dan-liao-jie/)

## 2. Jockey源码解析

### 2.1 Jockey实现了哪些功能

Jockey暴露了一个jockey对象，挂载在window上，主要功能如下：

- 检测当前运行环境是否在webview中；
- H5发送消息给Native，Jockey.send();
- H5注册全局方法，Jockey.on();
- Native响应H5的回调函数，Jockey.triggerCallback();
- Native主动调用H5的全局方法，Jockey.trigger();

### 2.2 初始化变量，检测运行环境

```javascript
// 通过IIFE方式，封装jockey
(function (){
  var host = window.location.host; // 发送消息带的参数，Native用来判断scheme请求的有效性
  var IframeDispatcher = {}; // 实现非native端处理
  var nativeDispatcher = {}; // 实现native端处理
  var Jockey = {}; // 定义jockey对象
  var i = 0,
    iOS = false
    iDevice = ['iPad', 'iPhone', 'iPod'];

    for (; i < iDevice.length; i++) {
        if (navigator.platform.indexOf(iDevice[i]) >= 0) {
            iOS = true;
            break;
        }
    }

    var UIWebView  = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent);
    var isAndroid  = navigator.userAgent.toLowerCase().indexOf("android") > -1;

    if ((iOS && UIWebView) || isAndroid) {
        // 如果是native中运行，则可以通过nativeDispatcher实现交互
        Jockey.dispatchers.push(nativeDispatcher);
    }

    // 如果不是在native运行，默认通过postMessage实现异步回调；
    // 这里的作用，主要为了让Hybrid页面非app环境，调用jockey也能正常返回。
    Jockey.dispatchers.push(IframeDispatcher);
    window.addEventListener("message", $.proxy(Jockey.onMessageRecieved, Jockey), false);

    window.Jockey = Jockey;  
})();

```

这是Jockey的主流程代码，主要做了3件事，

- 通过IIFE方式，封装jockey；
- 初始化Jockey、nativeDispatcher等对象；
- 检测当前运行环境，根据不同环境做对应处理；

### 2.3 H5发送消息给Native

```javascript
var Jockey = {
    listeners: {}, // 监听事件
    dispatchers: [], // 具体处理模式，两种环境
    messageCount: 0, // 消息数量
    on: function () {}, // H5注册全局方法
    trigger: function () {}, // Native主动调用H5的全局方法
    triggerCallback: function () {}, // Native响应H5的回调方法
    send: function(type, payload, complete) { // H5发送消息给Native
        // 参数兼容处理
        if (payload instanceof Function) {
            complete = payload;
            payload = null;
        }
        payload = payload || {};
        complete = complete || function() {};
	    // 创建消息格式对象
        var envelope = this.createEnvelope(this.messageCount, type, payload);
        // 实际处理
        this.dispatchers.forEach(function(dispatcher) {
            dispatcher.send(envelope, complete);
        });
        // 消息数量自增
        this.messageCount += 1;
    },
    createEnvelope: function(id, type, payload) {
        return {
            id: id,
            type: type,
            host: host,
            payload: payload
        };
    }
    // ...
}
```

从上面源码，可以看出Jockey这个对象很简单，实现了四个方法及一些变量定义。

- 其中H5调用Native，Native响应回调函数，这两个方法是一次完整的交互；

- H5注册全局函数，Native主动调用全局方法，这两个方法是一次完整的交互；

我们继续看下dispatcher的实现，如何通过scheme url 发送消息：

```javascript
var nativeDispatcher = {
    callbacks: {}, // 回调对象
    send: function (envelope, complete) {
       this.dispatchMessage("event", envelope, complete);
    },
    dispatchMessage: function(type, envelope, complete) {
        var dispatcher = this;
        // 发送前，先把回调事件存起来
        this.callbacks[envelope.id] = function() {
            complete();
            delete dispatcher.callbacks[envelope.id];
        };
	    // scheme请求
        var src = "jockey://" + type + "/" + envelope.id + "?" + encodeURIComponent(JSON.stringify(envelope));
        // 通过添加iframe，发送消息
        var iframe = document.createElement("iframe");
        iframe.setAttribute("src", src);
        document.documentElement.appendChild(iframe);
        iframe.parentNode.removeChild(iframe);
        iframe = null;
    }
}
```

ok，到了这里，H5已经把scheme请求发出去了，回调函数也存储在内存中了；等待Native监听webview中的请求，解析执行完后，调用H5的triggerCallback，H5就可以执行响应回调函数了。

### 2.4 Native响应回调函数

当Native执行完H5请求事件后，需要告诉H5，调用jockey.triggerCallback

```javascript
var Jockey = {
    triggerCallback: function(id) {
        this.dispatchers.forEach(function(dispatcher) {
            dispatcher.triggerCallback(id);
        });
    },
}

var nativeDispatcher = {
    // 实际执行响应函数
    triggerCallback: function(id) {
        var dispatcher = this;
	   // setTimeout是为了避免App的运行卡顿
        setTimeout(function() {
            dispatcher.callbacks[id]();
        }, 0);
    },
}
```

到这里，就完成了H5调用Native，Native响应回调的完整交互。

### 2.5 H5注册全局事件

```javascript
var Jockey = {
    listeners: {}, // 数组对象存储不同类型监听事件（即H5的全局事件）
    on: function(type, fn) {
        if (!this.listeners.hasOwnProperty(type) || !this.listeners[type] instanceof Array) {
            this.listeners[type] = [];
        }

        this.listeners[type].push(fn);
    },
}
```

### 2.6 Native调用H5全局事件

```javascript
var Jockey = {
    // Native调用H5，通过FIFO队列方式，一个个执行该类型的H5监听事件
    trigger: function(type, messageId, json) {
        var self = this;
        var listenerList = this.listeners[type] || [];
        var executedCount = 0;
        // 完成函数，需告诉native已完成回调
        var complete = function() {
            executedCount += 1;
            if (executedCount >= listenerList.length) {
                self.dispatchers.forEach(function(dispatcher) {
                    dispatcher.sendCallback(messageId);
                });
            }
        };

        for (var index = 0; index < listenerList.length; index++) {
            var listener = listenerList[index];
            // 如果H5方法是异步函数，需要执行完异步函数后手动调用complete方法
            // 当所有事件都执行完后，H5在通知native执行完成
            if (listener.length <= 1) { // 回调函数参数小于两个，是同步
                listener(json);
                complete();
            } else { // 回调函数参数有两个，是异步函数
                listener(json, complete);
            }
        }

    },
}

var nativeDispatcher = {
    sendCallback: function(messageId) {
        var envelope = Jockey.createEnvelope(messageId);
        // 告诉native，回调函数已经完成。应用场景：如H5分享功能
        this.dispatchMessage("callback", envelope, function() {});
    },
}

```

Native调用H5，触发Jockey.trigger 方法。流程如下：

- 通过队列方式FIFO，一个个执行该类型的H5监听事件；
- H5事件分同步与异步，异步事件完成后需手动执行complete;
- 当该类型的所有监听事件都完成后，再通知native；

到这里，我们又完成了H5注册全局函数，Native主动调用全局方法的完整交互。

## 3. 总结

到这里，jockey主要源码都解析完成了。其中，最巧妙的设计是，通过两个对象来存储H5回调事件和H5监听事件。

- 对象存储响应函数，callbacks:{}；每发送一个消息，id自增，对应唯一回调callback[id]；
- 对象存储监听事件，listeners:{}; 每一个类型下的事件，用数组存储，listeners[type];

