---
title: 正则表达式（基础篇）
categories: Little
tags: JS
date: "2018-04-28"
---

```
// 创建正则的两种方法
// /正则表达式/
const re = /ABC\-abc/igmy
// new RegExp('正则表达式') 注：特殊字符需转义
const ex = new RegExp('ABC\\-abc', 'igmy') 

// 常见匹配字符
// \d任意数字，\s空格,\w任意数字或字母,.任意字符,*任意个字符,+至少一个字符,?一个或多个字符,{n}n个字符,{n,m}n到m个字符,[]精确匹配,()分组,^行的开头,$行的结束
// i表示忽略大小写,g表示全局匹配,m表示多行匹配，y表示粘连修饰符
// \1表示的是匹配到第一个()的引用,\2表示匹配到的第二个()的引用
```

```
// 正则的常见方法
// test()测试
var re = /^\d{3}\-\d{3,8}$/
re.test('010-12345') // true 
re.test('010-1234x') // false
re.test('010 12345') // false

// exec()分组
var s = 'JavaScript, VBScript, JScript and ECMAScript';
var re=/[a-zA-Z]+Script/g;

// 使用全局匹配:
re.exec(s); // ['JavaScript']
re.lastIndex; // 10
re.exec(s); // ['VBScript']
re.lastIndex; // 20
re.exec(s); // ['JScript']
re.lastIndex; // 29
re.exec(s); // ['ECMAScript']
re.lastIndex; // 44
re.exec(s); // null，直到结束仍没有匹配到

// 字符串的正则方法

// search()返回字符串的索引

// match()返回匹配数组,返回匹配的第一个。加上全局匹配则全部返回
const str = "独坐常忽忽，情怀何悠悠。山腰云缦缦，谷口风飕飕。猿来树袅袅，鸟入林啾啾。时催鬓飒飒，岁尽老惆惆。"
const exc = /(.)\1/g
const result = str.match(exc)
// ["忽忽", "悠悠", "缦缦", "飕飕", "袅袅", "啾啾", "飒飒", "惆惆"]

// split()字符串切分，返回数组

// replace()将匹配到的字符串替换
```
