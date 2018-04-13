---
title: git命令入门
categories: Bob
tags: 前端自动化
comments: true
date: "2017-04-03"
---
### 基础命令介绍

- 从服务器上拉取代码
git clone https://github.com/comeonbob/weShare.git

- 创建本地分支并且关联远程分支develop
git checkout develop

- 更新本地分支develop
git pull --ff


- 创建本地分支，并切换到feature
git checkout -b feature

- 提交代码
git commit -a -m "xxx"

- 切换开发分支拉取最新代码, 并返回feature分支(避免在develop分支上冲突)
git checkout develop
git pull --ff
git checkout feature

- 合并分支 rebase （可能产生冲突）
git rebase develop

- 切换至develop分支, 并合并分支
git checkout develop
git merge --no-ff feature

- 提交代码
git push

---
### 其他参考学习

- 配置git, 保存户名、密码等
``` bash
(1) git config --list                    //查看当前git配置
(2) git config credential.helper=store   //配置存储模式
(3) git config user.name='xxx.xx'        //设置用户名
(4) git config user.email='xxx.xx'       //设置email
```

- 分支管理
``` bash
(1) git branch -a                        //查看所有分支
(2) git branch dev                       //创建本地分支
(3) git branch -d dev                    //删除本地分支
(3) git push origin dev                  //创建远程分支
(4) git push origin --delete dev         //删除远程分支
(5) git checkout -b dev origin/dev       //创建并切换本地dev分支，并关联远程dev分支
(6) git branch --set-upstream-to=origin dev       //本地分支关联远程dev分支
```


- 提交分支、冲突解决
``` bash
(1) git status                           //查看当前代码状态
(2) git checkout a.js                    //复原a.js文件
(3) git add .                            //添加所有文件
(4) git clean -df                        //清除未添加文件
(5) git commit -a -m "xx"                //提交所有文件
(6) git rebase develop                   //合并develop分支到当前分支
(7) git rebase develop --continue        //解决冲突后继续合并
(8) git rebase develop --skip            //跳过冲突
(9) git merge --no-ff feature -m ""      //合并feature分支到当前主分支
(10) git pull --ff                       //更新最新代码
(11) git push                            //推送本地代码
(12) git clone xxx                       //克隆远程分支到本地
```
---

*Bob*


