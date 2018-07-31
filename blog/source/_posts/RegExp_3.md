---
title: Javascript正则表达式--应用篇
categories: Bob
tags: JS
date: "2018-07-27"
---
在学习了上一篇正则语法篇，是不是迫不及待想知道正则如何在工作中应用呢？
<!--more-->

### 应用1
```
难度：**
题目描述
判断输入是否是正确的邮箱格式

```
```javascript
function isAvailableEmail(sEmail) {

}
```

给自己5分钟，尝试一下...

---

**解题思路：**
1. 把一个正常的邮箱格式拆成4部分，分别定义正则

**难点：**
1. 如何拆分邮箱格式


**答案:**
```javascript
function isAvailableEmail(sEmail) {
    return /^[\w\.]+\@[\w\.]+[\w]+$/.test(sEmail);
}
```

### 应用2
```
难度：***
题目描述
css 中经常有类似 background-image 这种通过 - 连接的字符，
通过 javascript 设置样式的时候需要将这种样式转换成 backgroundImage 驼峰格式，
请完成此转换功能
1. 以 - 为分隔符，将第二个起的非空单词首字母转为大写
2. -webkit-border-image 转换后的结果为 webkitBorderImage

```
```javascript
function css2Dom(sName) {

}
```

给自己5分钟，尝试一下...

---

**解题思路：**
1. 处理第一个字母为分隔符
2. 分隔符后，第二个起的非空字母转为大写

**难点：**
1. 如何用正则定义，第二个起的非空字母


**答案:**
```javascript
// 不分组
function css2Dom(sName) {
  return sName.replace(/\-[a-z]/g , function(a, b){
      return b == 0 ? a.replace('-','') : a.replace('-','').toUpperCase();
  });
}
```

```javascript
// 分组
function css2Dom(sName) {
    return sName.replace(/^\-/, '')
      .replace(/(\-\w)/g, function(a) {
        return a[1].toUpperCase();
    });
}
```


### 应用3
```
难度：***
题目描述
按所给的时间格式输出指定的时间
yyyy: 年份，2014
yy: 年份，14
MM: 月份，09
M: 月份, 9
dd: 日期，05
d: 日期, 5

输入
formatDate(new Date(), 'yyyy-M-dd')

输出
2018-7-30
```
```javascript
function formatDate(t, f) {

}
```

给自己5分钟，尝试一下...

---

**解题思路：**
1. 解析日期格式种类
2. 调用日期函数，返回对应的日期格式

**难点：**
1. 如何解析日期格式


**答案:**
```javascript
function formatDate(t, f) {
    var obj = {
        yyyy: t.getFullYear(),
        yy: (""+ t.getFullYear()).slice(-2),
        M: t.getMonth()+1,
        MM: ("0"+ (t.getMonth()+1)).slice(-2),
        d: t.getDate(),
        dd: ("0" + t.getDate()).slice(-2)
    };
    return f.replace(/([a-z]+)/ig, function(r) {
            return obj[r];
        });
}
```

### 应用4
```
难度：****
题目描述
将 rgb 颜色字符串转换为十六进制的形式，如 rgb(255, 255, 255) 转为 #ffffff
1. rgb 中每个,后面的空格数量不固定
2. 十六进制表达式使用六位小写字母
3. 如果输入不符合 rgb 格式，返回原始输入

示例1
输入： 'rgb(255, 255, 255)'
输出： #ffffff
```
```javascript
// rgb转十六进制
function rgb2hex(sRGB) {
    
}
```

给自己5分钟，尝试一下...

---

**解题思路：**
1. 定义正则：rgb颜色字符串格式
2. 取出rgb对应的10进制数字
3. 10进制转16进制小写字符并返回

**难点：**
1. 用正则定义rgb格式，考验基本功了
2. rgb中每个逗号后面的空格数量不固定，提升了取rgb 10 进制数字难度

**答案:**
```javascript
// 将 rgb 颜色字符串转换为十六进制的形式，如 rgb(255, 255, 255) 转为 #ffffff
function rgb2hex(sRGB) {
    var reg = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
    return sRGB.replace(reg, function(a, r, g, b) {
        // 10进制转16进制
        r = parseInt(r).toString(16);
        g = parseInt(g).toString(16);
        b = parseInt(b).toString(16);
        
        // 16进制不足两位补0
        r = r.length > 1 ? r : '0' + r;
        g = g.length > 1 ? g : '0' + g;
        b = b.length > 1 ? b : '0' + b;
        
        return '#' + r + g +b;
    });
}
```

```javascript
// 精简版
function rgb2hex(sRGB) {
    var reg = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
    return sRGB.replace(reg, function(a, r, g, b) {
        return '#' + ('0'+(+r).toString(16)).slice(-2) + ('0'+(+g).toString(16)).slice(-2) + ('0'+(+b).toString(16)).slice(-2);
    });
}
```





### 结语
- 正则可以精简代码，锻炼基础逻辑
- 便于阅读优秀框架源码，理解核心正则语句
- 对正则了解的越多，使用场景就越多

### 在线工具

- [国外 - 正则在线测试](https://regexr.com/)
- [国内 - 站长在线测试](http://tool.chinaz.com/regex/)
- [插件 - FeHelper](https://www.baidufe.com/fehelper)

## 参考
- [JavaScript RegExp 对象](http://www.w3school.com.cn/jsref/jsref_obj_regexp.asp)
- [javascript正则表达式](https://www.baidufe.com/item/eb10deb92f2c05ca32cf.html)
- [js正则及常用方法函数总结](https://www.cnblogs.com/myzhibie/p/4365142.html)