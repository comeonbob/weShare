---
title: web 安全入门（一）
categories: Bob
tags: 安全
date: "2018-11-28"
---

## 一、XSS

**1.1 定义**

XSS（Cross Site Scripting），即为跨站脚本攻击，恶意攻击者向web页面中植入恶意js代码，当用户浏览到该页时，植入的代码被执行，达到恶意攻击用户的目的。

**1.2 危害场景**

- 通过document.cookie盗取cookie
- 使用js或css破坏页面正常的结构与样式
- 流量劫持
- 配合csrf攻击完成恶意请求
- ...

**1.3 分类**

（1）反射型 XSS

反射型XSS，也叫非持久型XSS，是指发生请求时，XSS代码出现在请求URL中，作为参数提交到服务器，服务器解析并响应。响应结果中包含XSS代码，最后浏览器解析并执行。

（2）存储型 XSS

存储型XSS，也叫持久型XSS，主要是将XSS代码发送到服务器（不管是数据库、内存还是文件系统等。），然后在下次请求页面的时候就不用带上XSS代码了。

（3）DOM XSS

DOM XSS攻击不同于反射型XSS和存储型XSS，DOM XSS代码不需要服务器端的解析响应的直接参与，而是通过修改浏览器端的DOM。如使用document.location或document.URL或document.referrer获取数据，或者在JS中使用eval语句。

```javascript
test.addEventListener('click', function () {
  var node = window.eval(txt.value)
  window.alert(node)
}, false)

//txt中的代码如下
<img src='null' onerror='alert(123)' />

```

**1.4 根本原因**

客户端渲染Dom时，没有检验数据，导致恶意代码植入；而其中数据来源大部分是后台接口获取，大部分前端框架在渲染DOM时，已经做了数据校验，过滤。而开发者自定义的dom渲染时，才更容易发生XSS攻击，如`document.write()`, 绑定html操作等。

**1.5 攻击示例**
一个输入框，用户填什么，页面显示什么。

html文件
```html
<!-- 测试XSS -->
<div id="xssDiv">
    <h3>测试XSS</h3>
    <textarea ng-model="testXss"></textarea>
    </br>
    <button ng-click="xssClick()">测试</button>
    <div ng-bind-html="testXss"></div>
</div>
```

js文件
```javascript
/** 测试XSS */
$scope.testXss = "";
$scope.xssClick = function () {
    var div = document.getElementById('xssDiv');
    div.insertAdjacentHTML("afterend", $scope.testXss);
    // div.append($scope.testXss);  // 字符串处理
    // div.appendChild($scope.testXss); // 非node形式
    // eval($scope.testXss);  // eslint检测报错
    // document.write($scope.testXss); // eslint报错，eval另外一种形式
};
```

用户在textArea中输入：
```html
<!-- 盗取cookie -->
<img src="null" onerror='alert(document.cookie)' />

<!-- 流量劫持 -->
<script>window.location.href="http://www.baidu.com";</script>

<!-- 不只有script标签才可以插入代码 -->
<div onmouseover="alert(document.cookie)">

```

**1.6 如何防御XSS**

一、将重要的cookie标记为http only,  document.cookie语句就不能获取

二、非框架渲染DOM时，需校验，过滤待渲染的数据。主要分以下几个环节：

（1）数据输入时校验数据类型，长度；

（2）对DOM节点操作的数据，存入时编码，获取后解码（he.js）；

（3）过滤有危害的元素节点，属性节点。如script标签，onerror事件；

（4）避免使用eval, document.write, document.URL等。

**1.7 参考文献**

[浅谈XSS攻击的那些事（附常用绕过姿势）](https://zhuanlan.zhihu.com/p/26177815)
[前端安全之XSS攻击](https://www.cnblogs.com/unclekeith/p/7750681.html)


## 二、CSRF

**2.1 定义**

CSRF （Cross-site request forgery）, 跨站请求伪造。CSRF攻击者在用户已经登录目标网站之后，诱使用户访问一个攻击页面，利用目标网站对用户的信任，以用户身份在攻击页面对目标网站发起伪造用户操作的请求，达到攻击目的。

**2.2 危害场景**

- 攻击者盗用你的身份，以你的名义发送恶意请求, 如修改密码
- 自动关注
- ...

**2.3 过程**

（1）登录受信任网站A，并在本地生成Cookie

（2）在不登出A的情况下，访问危险网站B

![csfr攻击过程](/img/webSecurity/csrf.png)


由上图分析我们可以知道构成CSRF攻击是有条件的：

1、客户端必须一个网站并生成cookie凭证存储在浏览器中

2、该cookie没有清除，客户端又tab一个页面进行访问别的网站


**2.4 根本原因**

CSRF攻击是源于Web的隐式身份验证机制！Web的身份验证机制虽然可以保证一个请求是来自于某个用户的浏览器，但却无法保证该请求是用户批准发送的。CSRF攻击的一般是由服务端解决。

**2.5 攻击示例**

我们就以游戏虚拟币转账为例子进行分析，简单级别CSRF攻击

假设某游戏网站的虚拟币转账是采用GET方式进行操作的，样式如：

`http://www.game.com/Transfer?toUserId=11&vMoney=1000`


此时`恶意攻击者`的网站也构建一个相似的链接：

1、可以是采用图片隐藏，页面一打开就自动进行访问第三方文章：`<img src='攻击链接'>`

2、也可以采用js进行相应的操作
`http://www.game.com/Transfer?toUserId=20&vMoney=1000`

假如客户端已经登录了www.game.com 游戏网站， 此时客户端存储了验证cookie；再登录恶意攻击者网站，一进入改恶意网站，1000虚拟游戏币就没了。

如果接口改成POST，防御效果会增强不少，但是依然可以伪造form表单提交。

**2.6 如何防御CSRF**

一、重要接口，尽量使用POST，限制GET

二、加验证码

验证码，强制用户必须与应用进行交互，才能完成最终请求。在通常情况下，验证码能很好遏制CSRF攻击。但是出于用户体验考虑，网站不能给所有的操作都加上验证码。因此验证码只能作为一种辅助手段，不能作为主要解决方案。

三、Referer Check

Referer Check在Web最常见的应用就是“防止图片盗链”。同理，Referer Check也可以被用于检查请求是否来自合法的“源”（Referer值是否是指定页面，或者网站的域），如果都不是，那么就极可能是CSRF攻击。


四、Anti CSRF Token

现在业界对CSRF的防御，一致的做法是使用一个Token（Anti CSRF Token）。

（1）用户访问某个表单页面。

（2）服务端生成一个Token，放在用户的Session中，或者浏览器的Cookie中。【这里已经不考虑XSS攻击】

（3）在页面表单附带上Token参数。

（4）用户提交请求后， 服务端验证表单中的Token是否与用户Session（或Cookies）中的Token一致，一致为合法请求，不是则非法请求。

**2.7 参考文献**

[CSRF攻击与防御](https://cloud.tencent.com/developer/article/1192668)
[Web安全之CSRF攻击](http://www.cnblogs.com/lovesong/p/5233195.html)


## 三、SQL注入

**3.1 定义**

所谓SQL注入，就是通过把SQL命令插入到Web表单递交或页面请求的查询字符串，最终达到欺骗服务器执行恶意的SQL命令。

**3.2 危害场景**

- 数据库信息泄露
- 网页篡改
- 网站被挂马
- 数据库被恶意操作
- ...

**3.3 注入过程**

（1）寻找SQl注入点，类似于`www.abc.com/user?id=1`

（2）识别数据库，SQL Server， Oracle，MySql等

（3）手工注入猜解，工具注入


**3.4 根本原因**

对用户数据作为SQL参数没有效验，导致恶意sql注入。

**3.5 攻击示例**

API，`www.xx.com/news.php?id=1`

SQL，`select * from user where id=${id}`

此时，若把API参数改成恶意攻击sql，`www.xx.com/news.php?id=1 or 1 = 1`;


若id是字符串类型`'${id}'`,只需要构造对应的单引号，加上注释即可：
`www.xx.com/news.php?id=1' or 1 = 1 -- `;
sql语句变成：
`select * from user where id='1' or 1 = 1 -- '`;

这样都可以查询出全部数据


**3.6 如何防御SQL注入**

一、使用参数化查询（使用？），不要拼接SQL参数

二、参数校验，合法性检查（数据类型，数据长度，敏感字符）

三、转义敏感字符及字符串

四、屏蔽出错信息：避免攻击者知道攻击结果


**3.7 参考文献**

[SQL注入详解](https://cloud.tencent.com/developer/article/1200019)
[SQL注入](https://cloud.tencent.com/developer/article/1042868)