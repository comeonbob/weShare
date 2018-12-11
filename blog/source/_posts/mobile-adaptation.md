---
title: 移动端web页面适配小结
categories: Xiaobu
tags: 移动端
date: "2018-08-09"
---

> _适配的目标：在不同尺寸的手机设备上，页面“相对性的达到合理的展示（自适应）”或者“保持统一效果的等比缩放（看起来差不多，但不是完全等比例，对于字体我们并不喜欢等比例的去放缩）”。_

**问题**:手机设备的尺寸不同，让页面在不同的手机设备上显示的效果看起来大致相同或者展示效果比较合理就成了一个问题。 目前移动端比较通用的几个方案

* 媒体查询和rem 适配
* viewport 缩放,， rem 布局，js计算
* vw适配方案（以后可能的方案）

## ⒈关于viewport

​知道了通用方法进入代码的正题，写一个如图简单的HTML页面，在Chrome浏览器iPhone6模拟器下调试发现页面的可视区域宽为980px。

![](/img/h5adaptat/2018-07-25_233254.png)

为啥是980px了？**默认的**。浏览器厂商为了让那些传统的为桌面浏览器设计的网站在小屏幕下也能够很好显示，所以把**布局视口（layout viewport）**宽度设置地很大，一般在768px ~ 1024px之间，最常见的宽度是980px。哪为啥980px布局宽，能在375px屏幕宽的设备下完好显示了？

因为缩小。

> Narrow screen devices \(e.g. mobiles\) render pages in a virtual window or viewport, which is usually wider than the screen, and then shrink the rendered result down so it can all be seen at once. Users can then pan and zoom to see different areas of the page. For example, if a mobile screen has a width of 640px, pages might be rendered with a virtual viewport of 980px, and then it will be shrunk down to fit into the 640px space. This is done because many pages are not mobile optimized, and break \(or at least look bad\) when rendered at a small viewport width. This **virtual viewport** is a way to make non-mobile-optimized sites in general look better on narrow screen devices. \([Using the viewport meta tag to control layout on mobile browsers](https://developer.mozilla.org/en-US/docs/Mozilla/Mobile/Viewport_meta_tag)\)

窄屏幕设备（例如移动设备）在**虚拟窗口**或视口中渲染页面，该窗口或视口通常比屏幕宽，然后缩小渲染结果，以便可以立即看到它们。例如，如果移动屏幕的宽度为640px，则可能使用980px的虚拟视口渲染页面，然后缩小页面以适应640px空间。 这样做是因为许多页面不是移动优化的，**并且在以小视口宽度渲染时会中断（或者至少看起来很糟糕）**。 此虚拟视口是一种使非移动优化网站在窄屏设备上看起来更好的方法。虽然已经很人性化的设计了，但如下图不通过用户缩放和横向滚动滚动条，还是很难看清楚页面内容的。

![](/img/h5adaptat/2018-08-02_024849.png)

### 1.1ppk的 关于三个viewport的理论

除了上文中大概提到的 **layout viewport**， **virtual viewport**，还有**ideal viewport。**

* **layout viewport**：布局视口，在呈现页面之前，浏览器需要知道布局视口的宽度,**如没有任何进一步的说明（如设置&lt;meta name="viewport" content="width=800"&gt;），浏览器自己选择宽度**。浏览器选择了布局视口的尺寸，使其在完全缩小模式下完全覆盖屏幕。
* **virtual viewport**：可见视口，可视视口是当前在屏幕上显示的页面的部分。用户可以缩放以更改可视视口的大小。
* **ideal viewport**：理想的视口，它提供了设备上理想的网页大小。因此，理想视口的尺寸因设备而异。（ideal viewport 的意义在于，无论在何种分辨率的屏幕下，针对ideal viewport 而设计的网站，不需要手动缩放和横向滚动条都可以完美地呈现给用户）

![&#x56FE;&#x7247;&#x6765;&#x6E90;&#x4E8E;&#x7F51;&#x7EDC;Enter a caption for this image \(optional\)](/img/h5adaptat/viewport.jpg)

**layout viewport 和 virtual viewport**的关系用下文的话来描述再好不过了

> 想象一下，布局视口是一个不会改变大小或形状的大图像。现在你有一个较小的框架，通过它你可以看到大图像。小框架周围被不透明材料包围，这些材料遮挡了除大部分图像之外的所有部分的视图。您可以通过框架看到的大图像部分是可视视口。您可以在保持框架的同时远离大图像（缩小）以一次查看整个图像，或者您可以靠近（放大）以仅查看一部分。您也可以更改框架的方向，但大图像（布局视口）的大小和形状永远不会更改。

这样看来layout viewport， virtual viewport，对移动端浏览器的显示帮助还是不够的\(浏览器厂商设置的一个宽度，通过一定的“自由“放缩显示在手机设备上\)。现在需要一个基础的宽度设定，然后放缩比例是可控的，然后页面刚好完全显示在屏幕上（是指宽度上）。ppk第三个视口**ideal viewport**,就出现了。

三篇值得一看的文章

①[A tale of two viewports — part one](https://www.quirksmode.org/mobile/viewports.html)（Concept: device pixels and CSS pixels，这个例子灰常好）

②[A tale of two viewports — part two](https://www.quirksmode.org/mobile/viewports2.html),

③[Meta viewport](https://www.quirksmode.org/mobile/metaviewport/)

**ideal viewport 和 virtual viewport 的关系**

 ```text
 可视视口宽度=理想视口宽度/缩放系数
 缩放系数 =理想视口宽度/可视视口宽度

 简单理解一下，如果理想视口宽度=设备宽度=375px，然后后缩放系数为0.5,计算出可视视口宽度为750px;
 如果此时的布局视口刚好等于750px;页面的显示是不是非常完美了（页面再也不是“自由“放缩显示了）
 ```

### 1.2 viewport meta tag 的引入

为了更好的控制视口的大小比例，苹果公司在其safari浏览器中引入meta viewport（[UsingtheViewport](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/UsingtheViewport/UsingtheViewport.html)），安卓以及各大浏览器厂商也都纷纷引入。下面这个标签是很多人接触移动端页面都会看到的。那么这个标签做了什么了①将布局视口宽度设置为理想的视口宽度width=device-width，**②根据初始缩放系数和理想视口宽度计算出可是视口，③将布局视口宽度设置为刚刚计算的可视视口宽度（布局视口宽度取②，③计算中值大的）**。 （现在看来，页面的初始布局宽度，以及放缩系数是可控靠谱的了，不容易啊，虽然这个标记被流行的移动浏览器支持，但目前还是草案）

```javascript
<meta name="viewport" content="width=device-width,initial-scale=1">
```

## 2.DPR,设备像素,备独立像素

用如下的标签欢快的按着设计稿，以px为单位写着代码，然后设计师看了效果图就跑来了，这个边框怎么这么粗呀？图标，这个图标怎么看起来这么模糊啊？还有怎么这个图标在这个小屏幕手机上面这么大......

```javascript
<meta name="viewport" content="width=device-width,initial-scale=1">
```

### 2.1一些需要的概念

**物理像素\(physical pixel\)** :一个物理像素是显示器\(手机屏幕\)上最小的物理显示单元，在操作系统的调度下，每一个物理像素都有自己的颜色值和亮度值。从屏幕在工厂生产出的那天起，它上面物理像素点就固定不变了，单位 pt\(同设备像素\)。

 **设备独立像素:**（又称设备无关像素 Device Independent Pixels 、密度独立性 Density Independent或设备独立像素，简称DIP或DP）是一种物理测量单位，基于计算机控制的坐标系统和抽象像素（虚拟像素），由底层系统的程序使用，转换为物理像素的应用。

**css像素**：   CSS像素是一个抽像的单位 ，1个 CSS 像素的大小在不同物理设备上看上去大小总是差不多。（为了保证浏览的一致性）[关于一些长度单位的介绍](https://www.w3.org/TR/CSS2/syndata.html#length-units)（有关于css像素描，图片来源于此）

设备分辨率对像素单元的影响：1px乘1px的区域被低分辨率设备（例如典型的计算机显示器）中的单个点覆盖，而同一区域被16个点覆盖 在更高分辨率的设备（如打印机）中。**在不同的设备之间，1个CSS像素所代表的物理像素是可以变化的。**

![](/img/h5adaptat/pixel2.png)

**DPR:**设备像素比简称为dpr，其定义了物理像素和设备独立像素的对应关系。它的值可以按下面的公式计算得到：

```text
设备像素比 ＝ 物理像素 / 设备独立像素

问题：iphone5 的dpr 是 2 屏幕宽度320px 那么它的设备物理像素宽是多少？（640）
```

来看看图儿（内容来源[A tale of two viewports — part one](https://www.quirksmode.org/mobile/viewports.html)）

①CSS像素与设备像素完全重叠。②CSS像素拉伸，现在一个CSS像素与几个设备像素重叠。③CSS像素开始缩小,一个设备像素现在与几个CSS像素重叠。

![](/img/h5adaptat/csspixels_100.gif)

**在同样一个设备上，1个CSS像素所代表的物理像素是可以变化的;** 

### 2.2图像模糊的由来，1px边框问题

**位图**：是由像素（Pixel）组成的，像素是位图最小的信息单元，存储在图像栅格中。

**图像问题**：理论上，1个位图像素对应于1个物理像素，图片可以完美清晰的展示。一个位图像素是栅格图像\(如：png, jpg, gif等\)的最小数据单元。在Retina屏幕下（此时dpr假设为2）200 ×200大小的图片，样式大小也设置为width:200px;,heigth:200px;此时1px像素被4个物理像素点填充。1个位图像素对应了4个物理像素，由于单个位图像素不可以再进一步分割，所以只能就近取色，从而导致图片模糊。\([ ](http://html-js.com/article/MobileWeb)[ 移动端高清、多屏适配方案](http://www.html-js.com/article/Mobile-terminal-H5-mobile-terminal-HD-multi-screen-adaptation-scheme%203041),此段内容观点和图片来源于此\)

![&#x79FB;&#x52A8;&#x7AEF;&#x9AD8;&#x6E05;&#x3001;&#x591A;&#x5C4F;&#x9002;&#x914D;&#x65B9;&#x6848;](/img/h5adaptat/color.jpg)

同理反过来在普通屏幕下（此时dpr假设为1），400 ×400大小的图片，样式大小也设置为width:200px;,heigth:200px;（我们习惯说此时用的2倍图）_。_一个物理像素点对应4个位图像素点，所以它的取色也只能通过一定的算法得到，显示结果就是一张只有原图像素总数四分之一的图，（我们称这个过程叫做downsampling）肉眼看上去图片不会模糊，但是会觉得图片缺少一些锐利度，或者是有点色差。

**1px 物理像素边框问题：**在页面不设置放缩的情况下是很难实现的。

```javascript
<meta name="viewport" content="width=device-width,initial-scale=1">
```

![](/img/h5adaptat/2018-08-03_013838.png)

如图1倍屏，2倍屏，3倍屏，需要实现1px 物理像素边框border: 1px;，border: 0.5px；border: 0.33px; 然而有的浏览器并不能识别0.5px，0.33px。

## 3.移动端页面适配的简单解决

一些Relative lengths，rem,em vw,vh......此处用到了 rem ，rem的官方定义来一下~~（[https://www.w3.org/TR/css3-values/\#rem](https://www.w3.org/TR/css3-values/#rem)）**相对于根元素\(即html元素\)font-size计算值的倍数**。

![](/img/h5adaptat/2018-08-03_153716.png)

举个例子，如果页面的html的**font-size** 设置 为 20px,那么 1rem= 20px;

再举个例子：以iPhone6的设计稿为为基础来计算（因为我家设计师喜欢出iPhone6的稿子）

| 设 备 | 设备宽度 | 根元素font-size/px | 屏幕宽 |
| :--- | :--- | :--- | :--- |
| iPhone5 | 320 |  17.066（约等于） | 18.75rem |
| \(baseWidth\)iPhone6 | 375 | 20 | 18.75rem |
| iPhone6 Plus | 414 |  22.080（约等于） | 18.75rem |

```text
//假设屏幕屏幕宽度 等于布局宽度 等于可视窗口宽度。
// iPhone6 (18.75份是随便取的)
以iPhone6为基础，屏幕宽度为375px，将屏幕宽度分成18.75份，每一份宽度为20px;
设置html的font-size 为20px; 1rem = 20px;
// iPhone5
iPhon5，屏幕宽度为320px，将屏幕宽度分成18.75份，每一份宽度为17.066;
设置html的font-size 为17.066; 1rem 约等于 17.066;

以iphonp6的设计稿某div的高为20xp 宽为20px 写了一个样式
.haha {
    width: 1rem;  /* iphonp6 下显示为20px */;
    height: 1rem; /* iphonp6 下显示为20px */
}
//上述那段css在iPhone5下 表达的宽高是多少了
.haha {
    width: 1rem;  /* (320/18.75)px*/;
    height: 1rem; /* (320/18.75)px*/
}
// 看一组数字 320/375 = (320/18.75)/20 屏幕宽度比，等于设计稿图片放缩比。
// 这样设计稿就成比例在不同宽度手机屏幕上面显示了
```

**根元素fontSize公式：width/fontSize = baseWidth/baseFontSize** 

### **3.1媒体查询和rem 适配**

先参考一下 比如微博和京东，咦~~ 用的是媒体查询设置。

![](/img/h5adaptat/2018-08-03_163731.png)

```css
@media only screen and (max-width: 640px) and (min-width: 414px) { 
    html {
        font-size: 22.08px;   
    }
}
@media only screen and (max-width: 414px) and (min-width: 375px) {
    html {
        font-size: 18.75px;    
    }
}
@media only screen and (max-width: 375px) {    
    html {
        font-size: 17.066px;
    }
}
// 这样不是完全的运用了width/fontSize = baseWidth/baseFontSize 这个公式，只是选了几个宽度区间
// 来设置
```

相对于根元素\(即html元素\)的font-size值设置好了，然后就是按照设计稿写代码了，问题来了px单位转换成rem人工计算头有点大（在iPhone6 下面每一个都要除以20 换算出rem单位）。

比推荐的方法有两种一种

* [px2rem](https://www.npmjs.com/package/px2rem) （npm安装）
* Sass函数、混合宏功能来实现

```css
// 方法一  例子从文档上面抄下来的
.selector {
    width: 150px;
    border: 1px solid #ddd; /*no*/
}
//转换过后
.selector {
    width: 7.5rem;
    border: 1px solid #ddd;
}
//方法二
$rem-base: 20px !default; // baseFontSize 
@function rem($value, $base-value: $rem-base) {
  $value: strip-unit($value) / strip-unit($base-value) * 1rem;
  @if ($value == 0rem) { $value: 0; } // Turn 0rem into 0
  @return $value;
}

@function strip-unit($num) {
  @return $num / ($num * 0 + 1);
}
.haha {
    width: rem(150); //通过 rem($value, $base-value: $rem-base) 计算出来 7.5rem。
}
```

个人更喜欢方法一，因为别人写的UI组件通常用的是px。然后就是字体，字体大小建议不要转rem。

用媒体查询查询的方法就比较要关注手机屏幕宽度了（如果做得细致，还是要针对每个屏幕宽划分区间），且对于图片的问题还是没有解决。

### **3.2viewport 缩放,rem 布局，js计算**

动态的设置根元素\(即html元素\)font-size的值，也有两种方式\(通常代码在head加载，避免页面重绘\)

```javascript
// 方法一 （iPhone 6尺寸作为设计稿基准）
//document.documentElement.clientWidth /18.75
var e = (document.documentElement.clientWidth / 375) *20 ;
document.documentElement.style.fontSize = e + "px"
添加标签到HTML
<meta name="viewport" content="width=device-width,initial-scale=1">
这样做就使得所有屏幕都是基于iphone6的设计稿等比例显示了

// 方法二 （iPhone 6尺寸作为设计稿基准）动态写入 viewport 放缩

var e = (document.documentElement.clientWidth / 375) *20 ;
document.documentElement.style.fontSize = e + "px"
var initScale = 1 / window.devicePixelRatio; // initScale  = 1/2;
viewPortMeta = window.document.createElement("meta");
viewPortMeta.setAttribute("name", "viewport");
viewPortMeta.setAttribute("content", "width=device-width, initial-scale=" +
      initScale + ", user-scalable=no");
//iphone6 的物理像素是 750pt*1334pt
// initScale  = 1/2
// device-width = 375
// 页面可是视口大小 = 750px; 布局视口大小也就等于750px
// 此时一个物理像素 对应 一个css像素  （此时图片模糊问题就解决了）
```

方法一：有1px物理像素问题，和图片问题（网上有众多解决方法可以看看），

```javascript
// JS判断是否支持0 .5 px的边框， 是的话， 则加上hairlines的类名。（以iphone6为例）

if (window.devicePixelRatio && devicePixelRatio >= 2) {
	var testElem = document.createElement('div');
	testElem.style.border = '.5px solid #000';
	document.body.appendChild(testElem);

	//当div存在
	if (testElem.offsetHeight == 1) {
		document.querySelector('html').classList.add('hairlines');
	}

	//添加完hairlines类名后，则删除div
	document.body.removeChild(testElem);
}
// 图片的可以考虑实际位置，加载不同倍数的图片（个人觉得没有必要都用2倍图）
// 很多网站 采用的都是这个方法
```

方法二： **安卓机的dpr神奇**，且部分机型放缩情况怪异，所以通常会在iphone下考虑放缩，安卓选择放弃，安卓机的做法就跟方法一 一样了。

```text
//计算 initScale 的修改
dpr = win.devicePixelRatio;
dpr = isIphone ? (dpr >= 3 ? 3 : (dpr >= 2 ? 2 : 1)) : 1;
initScale = 1 / dpr;
```

方法二：需要注意字体的问题，不建议字体跟着屏幕大小变化。通常用js的方法还会给根元素多加一个类或属性来控制字体显示。

```css
//给<html>元素添加data-dpr属性，并且动态改写data-dpr的值，或者动态写一个dpr的class到根元素上
//eg. <html data-dpr="1" class="dpr1">
// 动态写dpr的class 
@mixin font-dpr ($font-size) {
  font-size: $font-size;
  .dpr1 & {
    font-size: $font-size * 1;
  }
  .dpr2 & {
    font-size: $font-size * 2;
  }
  .dpr3 & {
    font-size:  $font-size * 3;
  }
}
//动态改写data-dpr的值
@mixin font-dpr($font-size){
  font-size: $font-size;
  [data-dpr="2"] & {
      font-size: $font-size * 2;
  }
  [data-dpr="3"] & {
      font-size: $font-size * 3;
  }
}
```

### 3.3vw适配方案（以后可能的方案）

> vw unit： Equal to 1% of the width of the initial containing block.
>
> vh unit：Equal to 1% of the height of the initial containing block.

 1vw = 1%视口宽度，看到这个表达是不是心里面一惊喜，3.2的方法就是将屏幕分成多少份，然后根元素\(即html元素\)的font-size值，每一份用rem来表示。现在vw的出现就更符合技术需要了因为它自动将视口宽度分成了100份。

```text
//假设屏幕屏幕宽度 等于布局宽度 等于可视窗口宽度。
//iPhone 6尺寸作为设计稿基准
//<meta name="viewport" content="width=device-width,initial-scale=1">
// 此时 1vw = 375/100 =3.75px;
// 此时就差将px 转换为 vw了（此处Sass函数举个例子）

$base_width: 375;
@function pxToVW($px) {
    @return ($px / $base_width) * 100vw;
}
// iPhone 6 设计稿中 某 div 宽度为 75 px 高度 75px 表达如下
.haha {
    width： pxToVW(75); // 20vw
    height: pxToVW(75); // 20vw
}
//上述那段css在iPhone5下 表达的宽高是多少了
.haha {
    width： pxToVW(75); // 20vw   320/100*20 = 64px
    height: pxToVW(75); // 20vw   320/100*20 = 64px
}
// 看下数字题 64/75 = 320/375  设计稿在屏幕上的显示等比放缩了
```

vw好用,但它还存在兼容性问题，可以通过这个网站查阅 [Can I use](https://caniuse.com/#search=vw)。不过也有大神写了文章介绍怎么在实际项目去使用vw。

## 4.小结

文中例子比较粗糙，理解不准确之处，还请教正。关于移动端适配部分方法，本文也是描述基础思想原理，还有很多细节，兼容问题没有提及，要真的去理解它，还需多看文档，代码实践。

终于写完了，没写之前和写了之后认知看法又不一样了。

