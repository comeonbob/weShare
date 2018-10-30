---
title: 如何使用ab做接口压力测试
categories: Bob
tags: JS
date: "2018-10-30"
---
**文章概要**

 - 什么是压力测试
 - 如何实现压力测试
 - 测试案例
 - 测试中可能遇到的错误
 - 参考链接

### 一、什么是压力测试
> 压力测试是通过不断向被测系统施加“压力”，测试系统在压力情况下的性能表现，考察当前软硬件环境下系统所能承受的最大负荷并帮助找出系统瓶颈所在，也就是我们可以模拟巨大的工作负荷以查看应用程序在峰值使用情况下如何执行操作。

**压力/负载/性能测试之间的区别**

压力测试（StressTesting），也称为强度测试，通过模拟实际应用的软硬件环境及用户使用过程的系统负荷，长时间或超大负荷地运行测试软件，来测试被测系统的性能、可靠性、稳定性等。压力测试需要确定一个系统的瓶颈或者不能接收的性能点，来获得系统能提供的最大的服务级别。通俗地讲，压力测试是为了发现在什么条件下您的应用程序的性能会变得不可接受。

负载测试（Load Testing）通常被定义为给被测系统加上它所能操作的最大任务数的过程，负载测试有时也会被称为“容量测试”或者“耐久性测试/持久性测试”，其目标是确定并确保系统在超出最大预期工作量的情况下仍能正常运行。对于WEB应用来讲，负载则是并发用户或者HTTP连接的数量。负载测试通过测试系统在资源超负荷情况下的表现，以发现设计上的错误或验证系统的负载能力。在这种测试中，将使测试对象承担不同的工作量，以评测和评估测试对象在不同工作量条件下的性能行为，以及持续正常运行的能力。

性能测试（PerformanceTesting）的目的不是去找系统Bugs，而是排除系统的性能瓶颈，并为回归测试建立一个基准。而性能测试的操作，实际上就是一个非常小心受控的测量分析过程：“运行负载试验->测度性能->调试系统”。在理想的情况下，被测应用在这个时候已经是足够稳定，所以这个过程得以顺利进行。性能测试还有另一个目标就是建立一组被测系统的基准数据。应用在网络上的性能测试重点是利用成熟先进的自动化技术进行网络应用性能监控、网络应用性能分析和网络预测。

虽然三种测试的目的截然不同，但其测试操作的环节都是基本一致的，因此一次测试过程中完全可以包含性能测试、负载测试、压力测试三个方面的内容，所使用的测试工具往往大同小异。

### 二、如何实现压力测试

压力测试需要对应的工具支持，测试工具有很多，详见链接：
[压力测试工具](https://blog.csdn.net/u012942982/article/details/55251930/)

今天， 我们的主题是用ab工具来完成压力测试。

#### 2.1 安装 ab
(1) Windows 环境安装ab
https://blog.csdn.net/foreverling_ling/article/details/81667857

(2) Linux 环境安装ab

` yum -y install httpd-tools`

(3) 安装成功后，检查版本号

`ab -V`

#### 2.2 使用ab
`ab -n 1000 -c 10 www.baidu.com/`

-n 表示请求总数， -c 表示并发数， 后面跟上需要测试的接口

更多详细参数，请参考：
https://blog.csdn.net/wang404838334/article/details/78458828

### 三、测试案例
实际项目中使用ab，根据场景不同，使用方法有差别，也会碰到各种错误信息。
接下来我们选取了GET, POST分别做压力测试，介绍了如何携带cookie, 如何发送请求体等。

#### （1）测试GET 接口，需要cookie
`ab -n 5000 -c 500 -C uin=7000000；session=99999999 url`

其中 -C代表请求携带的cookie信息；若有多个cookie， windows上用分号分割， linux用逗号分割。

**测试结果**
![需要cookie的GET接口压力测试](/img/ab/get.png)

**分析**

- 3k请求，300并发，总耗时50.93s, 每个耗时16.97ms， qps 58.9， 性能一般。
- 我们可以修改请求数量，并发数量，查看系统运行状况，响应时间来判断接口性能瓶颈。

#### （2）测试POST接口，需要JSON格式请求体

`ab -n 5000 -c 300 -p post.txt -T 'application/json' url`

其中，-p 表示需要携带的请求体，一般是.txt格式文件，文件内容如下：
`{"toBank":"123456"}`; -T 表示请求体格式，一般为'application/json'

**测试结果**

（1） windows 报错，初步判断ab在windows上不支持post 接口。

错误内容如下：
`ab：Counld not stat POST data file (post.txt): Partial results are valid but processing is incomplete`

（2）linux 上运行成功

![POST接口压力测试](/img/ab/post.png)

**分析**

- 5k 请求，300并发，总耗时6.75s，平均每个请求耗时1.35ms，qps 740.7，性能良好。

- 同理，我们可以修改并发数，请求数来测试接口性能 ，需要注意的一般数据库写的操作并发数相对较低。

### 四、测试中可能遇到的错误
(1) Windows 环境测试post接口报错

错误消息： 

`Counld not stat POST data file (post.txt): Partial results are valid but processing is incomplete`

错误原因： windows环境暂不支持用ab来测试post接口

解决方法： 使用linux环境，测试post请求一切正常，请求体支持application/json格式

(2) Linux 环境并发数1500以上，运行报错

错误消息： `socket：Too many open files (24)`

错误原因： 进程打开了超过系统限制的文件数量以及通讯链接数，默认值是1024，使用ulimit -n 就可以查看。

解决方法： 设置较大的系统最大文件数量值，如： ulimit -n 2048

参考链接： [too many open files(打开的文件过多)解决方法](https://blog.csdn.net/roy_70/article/details/78423880)

(3) Linux 环境并发数3000，运行报错

错误消息：  `Connection timed out (110)`

错误原因：  连接超时

解决方法： 接口服务系统支持有限，不支持这么多并发，优化系统

### 五、参考链接
- [ab命令做压测测试](https://blog.csdn.net/wang404838334/article/details/78458828)
- [使用ab 进行并发压力测试](https://www.cnblogs.com/shenshangzz/p/8340640.html)
- [ab,qps,服务器性能压力](https://www.cnblogs.com/zhengah/p/4334314.html)
- [too many open files(打开的文件过多)解决方法](https://blog.csdn.net/roy_70/article/details/78423880)