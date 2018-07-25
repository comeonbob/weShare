---
title: Javascript正则表达式--语法篇
categories: Bob
tags: JS
date: "2018-07-25"
---

使用正则的过程中可能对Js正则的语法记得不太牢，顺便也整理了一下，列在这里。
<!--more-->
## 正则对象
（1）构造函数方式
```
var reg = new RegExp('abc', 'gi');
```
第一个参数是正则的内容，第二个参数是修饰符，修饰符通常有三种，i,g,m，i表示的含义是忽略大小写进行匹配，g表示全局匹配即匹配到第一个之后不停止继续匹配，m表示多行匹配，更改^和$的含义，匹配任意一行的行首和行尾。

（2）字面量方式
```
var reg = /abc/gi;
```
两个斜杠之间的是定义的正则内容，最后一个斜杠之后的是修饰符，这种方式比第一种简单高效，所以通常使用第二种方式来定义正则。

（3）方法

方法名|语法|描述
-|-|-
[test](http://www.w3school.com.cn/jsref/jsref_test_regexp.asp) | RegExpObject.test(string) |检测字符串是否与正则匹配
[exec](http://www.w3school.com.cn/jsref/jsref_exec_regexp.asp) | RegExpObject.exec(string) | 检索字符串中的正则表达式的匹配
[compile](http://www.w3school.com.cn/jsref/jsref_regexp_compile.asp) | RegExpObject.compile(regexp,modifier) | 对正则表达式进行编译

（4） 支持正则表达式的String对象的方法

方法名|语法|描述
-|-|-
[search](http://www.w3school.com.cn/jsref/jsref_search.asp) | str.search(regexp)|检索与正则表达式相匹配的值
[match](http://www.w3school.com.cn/jsref/jsref_match.asp) | str.match(regexp)|找到一个或多个正则表达式的匹配
[replace](http://www.w3school.com.cn/jsref/jsref_replace.asp) | str.replace(regexp,replacement) | 替换与正则表达式匹配的子串
[split](http://www.w3school.com.cn/jsref/jsref_split.asp) | str.split(regexp, howmany) | 把字符串分割为字符串数组

## 正则的字符
### 一、元字符
元字符     |    对应说明
--------- | --
.         | 匹配除换行符之外的任意字符
\w         | 匹配字母数字下划线，等同于:[a-zA-Z0-9]
\s         | 匹配任意空白字符
\d         | 匹配数字，等同于[0-9]
\b         | 匹配单词边界
&#124;        | 或匹配，如 /x&#124;y/ 匹配x或y两个字符
^         | 匹配字符串的开始
$         | 匹配字符串的结束

### 二、重复匹配
匹配字符     |    对应说明
--------- | --
*         | 重复出现零次或多次
+         | 重复出现一次或多次
?         | 重复出现零次或一次
{n}         | 重复出现n次
{n,}         | 至少重复出现n次
{m,n}         | 重复重现m到n次，其中，m<n

### 三、修饰符
修饰符     |    对应说明
--------- | --
i         | ignoreCase的缩写，表示忽略字母的大小写
g         | global的缩写，表示全局匹配
m         | multiline的缩写, 更改^和$的含义，匹配任意一行的行首和行尾


### 四、反义字符
反义字符     |    对应说明
--------- | --
[^x]         | 匹配除`x`之外的所有字符， 其中`x`可以为任意字符
[^xyz]         | 同上，匹配除`xyz`之外的任意字符
\W         | 匹配除了字母、数字、下划线之外的任意字符，等同于: `[^\w]`
\S         | 匹配除了空白符之外的任意字符，等同于：`[^\s]`
\D         | 匹配不是数字的所有字符，等同于：`[^\d]`
\B         | 匹配不是单词边界的字符，等同于： `[^\b]`

### 五、转义字符
转义字符     |    对应说明
--------- | --
\xnn         | 匹配十六进制数
\f         | 匹配换页符，等同于： `\x0c`
\n         | 匹配换行符，等同于: `\x0a`
\r         | 匹配回车符，等同于：`\x0d`
\t         | 匹配水平制表符，等同于：`\x09`
\v         | 匹配垂直制表符，等同于：`\x0b`
\unnnn         | 匹配Unicode字符，如：`\u00A0`

### 六、分组/捕获
分组字符     |    对应说明
--------- | --
(exp)        | 用小圆括号进行分组
(?:exp)        | 匹配exp正则，但不产生分组号
exp1(?=exp2)         | 前瞻断言，匹配exp1，但后面必须是exp2
exp1(?!=exp2) | 后瞻断言，匹配exp1，但后面不能是exp2

### 七、贪婪与惰性
匹配字符     |    对应说明
--------- | --
*?         | 重复出现零次或多次，但尽可能少的重复
+?         | 重复出现一次或多次，但尽可能少的重复
??         | 重复出现零次或一次，但尽可能少的重复
{n}?         | 重复出现n次，但尽可能少的重复
{n,}?         | 至少重复出现n次，但尽可能少的重复
{m,n}?         | 重复重现m到n次，其中，m<n，但尽可能少的重复


### 八、常用正则表达式
描述|正则
-|-
电话号码       | /[0-9-()（）]{7,18}/
邮编           | /^[1-9]\d{5}(?!\d)$/
中文字符       | /[\u4e00-\u9fa5]/g
Email地址      | /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/
手机号码       | /0?(13&#124;14&#124;15&#124;17&#124;18&#124;19)[0-9]{9}/
身份证号      | /\d{17}[\d&#124;x]&#124;\d{15}/


### 九、在线工具

- [国外 - 正则在线测试](https://regexr.com/)
- [国内 - 站长在线测试](http://tool.chinaz.com/regex/)
- [插件 - FeHelper](https://www.baidufe.com/fehelper)

## 参考
- [JavaScript RegExp 对象](http://www.w3school.com.cn/jsref/jsref_obj_regexp.asp)
- [javascript正则表达式](https://www.baidufe.com/item/eb10deb92f2c05ca32cf.html)
- [js正则及常用方法函数总结](https://www.cnblogs.com/myzhibie/p/4365142.html)