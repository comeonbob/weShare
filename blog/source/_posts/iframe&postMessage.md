---
title: iframe&postMessage跨源通信
categories: Evel
tags: iframe&postMessage跨源通信
date: "2019-06-18"
---

#### 一）进行页面的加载

使用方式

```
let targetUrl = "http://myProject.com"
<iframe :src="targetUrl" width="100%" height="100%">
```

 width，height：属性可设置被夹加载页面的的视图宽高
配合webkit-overflow-scrolling:touch基本上可以很好的呈现效果
防止视图的左右滑动，可以配合overflow-x: hidden来使用

```
<div class="calculator-box">
    <iframe ref="calactor"  :src="srcUrl" seamless 
    width="100%" height="100%"   scrolling="auto" class="calculator-iframe" ></iframe>
</div>
```

#### 二）使用postmessage进行跨源通信

使用postmessage进行跨源通信的时候需要注意一下几点：

> 1）相同协议（https,http）
> 2）相同的document.domain (localhost, ins.reotest.com, stage.ekeeper.com)

【参考：https://developer.mozilla.org/zh-CN/docs/Web/API/Window/postMessage】

```
otherWindow.postMessage(dataObj, targetOrigin, [transfer]);
// targetOrigin 某一页面进行消息监听
window.addEventListener('message', eventFun, false)
```

@params descriptor

> **otherWindow**: 指的是iframe窗口引用 this.$refs.calactor.contentWindow
> **message**：将要发送到其他窗口的数据，可以是对象形式
> **targetOrigin**: 指定那些窗口能接受到消息；其值可以是字符串"*"（表示无限制）或者一个URI。在发送消息的时候，*如果目标窗口的协议、主机地址或端口这三者的任意一项不匹配targetOrigin提供的值，那么消息就不会被发送；只有三者完全匹配，消息才会被发送。这个机制用来控制消息可以发送到哪些窗口；例如，当用postMessage传送密码时，这个参数就显得尤为重要，必须保证它的值与这条包含密码的信息的预期接受者的origin属性完全一致，来防止密码被恶意的第三方截获。如果你明确的知道消息应该发送到哪个窗口，那么请始终提供一个有确切值的targetOrigin，而不是。不提供确切的目标将导致数据泄露 到任何对数据感兴趣的恶意站点。
> **transfer** 可选,是一串和message 同时传递的 Transferable 对象. 这些对象的所有权将被转移给消息的接收方，而发送一方将不再保有所有权。

------

#### note:

如果targetOrigin值为"*"，则表明在同一个域名下都可以收到消息
如果targetOrigin值为指定的url，则需要域名，协议，端口号相同才行

------

**问题一：**现在问题是如果我指定了targetOrigin为某一明确值，targetOrigin网站下面有很多消息监听事件，那怎么区分这个不同事件做不同的事情？

使用事件name来进行区分；之前说过传递的消息dataObj可以是一个对象的形式，因此可以定义很多属性（eventName）

**完整的实例：**

```
iemit = (otherWindow, eventName, data, config) => {
  let env = config.env === 'LOCAL' ? 'LOCALFTS' : config.env
  let targetOrigin = config.domain[env] // http://10.9.8.157:8080 , http://ins.reotest.com
  otherWindow.postMessage({
    eventName: eventName,
    data: data
  }, targetOrigin)
}
let calIframe = this.$refs.calactor.contentWindow
let eventName = 'event.fnx.calculator.stepChange' // 事件名
iemit(calIframe, eventName, {methods: 'save'}, config) 
```

监听消息窗口：

```
// 监听消息事件
  let ionMsg = () => {
    window.addEventListener('message', eventFun, false)
  }
  ionMsg()

  // 监听事件销毁
  let removeListenerEvent = () => {
    window.removeEventListener("message", eventFun, false)
  }

  let eventFun = function (event) {
    let env = config.env === 'LOCALFTS' ? 'LOCAL' : config.env;
    if (event.origin !== config.domain[env] 
    	|| event.data.eventName !== 'event.fnx.calculator.stepChange') 
    {
      		return;
    }
    let data = event.data.data;
    if (data.methods === 'backStep') {
      backStep()
    } else if (data.methods === 'nextStep') {
      nextStep()
    }
  }
```

  在eventFun回调函数中有一个event对象包含了data(通信传递的数据对象)，origin(派发事件的目标源，一般可用来是否是正确的消息来源，否则不做处理)