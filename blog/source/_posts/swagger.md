---
title: 了解并使用swagger
categories: Ring
tags: swagger
date: "2018-12-28"
---

## 认识Swagger  
> Swagger 是一个规范和完整的框架，用于生成、描述、调用和可视化 RESTful 风格的 Web 服务。
总体目标是使客户端和文件系统作为服务器以同样的速度来更新文件的方法，参数和模型紧密集成到服务器端的代码，允许API来始终保持同步。 https://swagger.io/docs/

作用：
1. 接口的文档在线自动生成。
2. 功能测试。

**现在的网站架构基本都前端渲染、前后端分离的形态，前端和后端通过API接口来联系，swagger就是一款让你更好的书写API文档的框架。**

## Swagger工具  
swagger的生态使用图:
![](/img/swagger/a.png)
其中，红颜色的是swaggger官网方推荐的
1. **swagger-ui**  
是一种 UI 渲染工具，用于渲染 Swagger 文档，以提供美观的 API 界面。
2. **swagger-editor**  
就是一个在线编辑文档说明文件（swagger.json或swagger.yaml文件）的工具，以方便生态中的其他小工具（swagger-ui）等使用。 左边编辑，右边立马就显示出编辑内容来。  
Swagger 文档的类型有两种：yaml 文件和 json 文件。
yaml 文件用的是 YAML 语法风格；json 文件用的是 JSON 语法风格。这两种文件都可以用来描述 API 的信息，且可以相互转换。
3. **swagger-codegen**  
代码生成器，脚手架。一个模板驱动引擎，通过分析用户Swagger资源声明以各种语言生成客户端代码。Java应用的挺多。

## 应用场景  
- 如果你的 RESTful API 接口都开发完成了，你可以用 Swagger-editor 来编写 API 文档（ yaml 文件 或 json 文件），然后通过 Swagger-ui 来渲染该文件，以非常美观的形式将你的 API 文档，展现给你的团队或者客户。
- 如果你的 RESTful API 还未开始，也可以使用 Swagger 生态，来设计和规范你的 API，以 Annotation （注解）的方式给你的源代码添加额外的元数据。这样，Swagger 就可以检测到这些元数据，自动生成对应的 API 描述信息。也就是说，Swagger 支持自动生成 API 文档。

## 实践
1. **demo1：直接使用swagger-ui** 
```javascript
git clone https://github.com/swagger-api/swagger-ui.git
```
下载完成后，单独部署到自己的 Web 服务器即可。
故拷贝 Swagger-ui/dist 目录到自己的项目中，比如express的web项目
![](/img/swagger/b.png)  
http://localhost:3000/v1/api/

2. **demo2：使用swagger-express-mw lib 包来创建Mock Serve**  
我们使用 swagger-express-mw lib 包来创建基于 Node.js 的 Mock Server，swagger-express-mw 提共一个前端基础框架，这个框架完全可以作为前端代码的开发框架，将 controller 部分实现成真正项目的代码逻辑。因为我们的项目是重构，前端代码需在原有代码基础上做开发，重点重构后端代码。所以只用其作为 Mock Server 来测试前后端的通信，controller 部分的实现只是简单的返回 Rest API 需要的固定的数据。

```javascript
npm install -g swagger
swagger -V
swagger project create hello-world
npm instal

//启动工程
swagger project start

//编辑 API 文档
swagger project edit
```
![](/img/swagger/c.png)  
在浏览器中直接修改 API 文档，修改的值会直接保存到 api/swagger/swagger.yaml 文件中。  
swagger.yaml的 Path 定义中加入以下两个关键词，来指定每个 API 的 controller 和 function。  

x-swagger-router-controller：这个值需要设置成响应 API 请求的 controller 文件的名字。
    比如 controller 文件为 hello_world.js，那么关键词的值就是 hello_world。
operationId：这个值需要设置成响应 API 请求的 controller 文件中相应的方法。
```javascript
/hello:
    # binds a127 app logic to a route
    x-swagger-router-controller: hello_world
    get:
      description: Returns 'Hello' to the caller
      # used as the method name of the controller
      operationId: hello
```

3. **demo3：基于注解自动生成swagger文档**   
使用 yaml 的格式书写文档，当项目体积逐渐变大，维护成本依然很高，对于某个接口的细微修改，都需要重新去定位到接口文档中的对应位置进行修改，并且接口文档很有可能被忘记修改。  
https://www.npmjs.com/package/swagger-jsdoc 将swagger融入到基于JsDoc的注释当中去，这确实是一个对代码侵入性较小，同时能够大大方便对项目文档维护的方式。
```javascript
/**
 * @swagger
 * /logger/apps:
 *   get:
 *     summary: 获取有日志记录的应用
 *     description: 获取有日志记录的应用
 *     tags:
 *       - Logger
 *     parameters:
 *       - name: appName
 *         in: query
 *         required: true
 *         description: 应用名称
 *         type: string
 *       - name: userId
 *         in: query
 *         required: true
 *         description: 用户id
 *         type: string
 *     responses:
 *       200:
 *         description: 成功获取
 */
router.get('/apps', async (req, res, next) => {
  try {
    const result = ['自定义字段'];

    return res.send({ result });
  } catch (err) {
    next(err);
  }
});
```
demo地址： https://github.com/mjhea0/node-swagger-api

注释中使用@swagger开头，然后就可以按照 swagger 的语法来进行接口的定义。这样子极大地方便了文档的书写和修改，在程序员对接口进行修改之后，也不至于忘记维护接口文档，同时可以更加方便的实时的调试自己的接口。    
文档不再与代码分离，每个接口的定义都分布在对于的接口路由处，方便修改维护，减轻文档维护的成本，有很多重复的文档书写工作。比如response相关的参数，比如可能很多接口会有相似的query参数，但是我们依然每次都得进行一次复制粘贴来进行新的接口的swagger的定义。对于一个需要接受的参数很多的接口，swagger文档会写的比较长，当在swgger文档中出现语法错误，缩进错误时，错误提示很不清楚，无法直接定位到出错点。


能提供类似swagger-jsdoc的文档书写方式，但是同时能够相比于在注释中书写的方式，提供与代码一定的耦合性。进一步减轻维护文档的负担，提升开发效率？   

3. **demo4：koa-swagger-decorator** 

koa-swagger-decorator库所提供的功能：  
提供路由定义的功能
提供参数验证的功能
基于API生成swagger文档
```javascript
// 定义可复用的schema
const userSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    gender: { type: 'string' }
  }
};


  @request('post', '/users')
  @tag('User')
  @summary('创建用户')
  @body([{
    name: 'data',
    description: '用户信息',
    schema: userSchema,
  }])
  static async postUser(ctx) {
    const body = ctx.request.body;
    ...
    ctx.body = { result: body };
  }

```
查看完整示例请看：https://github.com/Cody2333/koa-swagger-decorator
