# 玫枫跟打器
> Roseo Maple Type Pad

<img width="150" src="img/logo.png"/>


![Screen Shot 2020-06-12 at 18 55 11](https://user-images.githubusercontent.com/12215982/84495758-4fd07480-acde-11ea-884b-7da0645fd57b.png)

![Screen Shot 2020-06-12 at 18 54 05](https://user-images.githubusercontent.com/12215982/84495767-52cb6500-acde-11ea-9461-be512178c459.png)

## 线上地址

[https://kylebing.cn/tools/typepad/](https://kylebing.cn/tools/typepad/)

## 前言
自己是个五笔爱好者，也一直在使用五笔，从 `Windows` 转到 `Mac` 之后，也没有有可用的跟打器，每回想练练打字了都需要打开 `Windows` 模拟器来打字。
一直一直想有个能在 `macOS` 上运行的跟打器。
最初是想自己用 `swift` 开发一个原生的 `app`，搭了个框架，准备写的时候发现好多东西不太熟。后来突然的一个周末，突然又想用本行开发一个试试，于是就有了这个。

从最初的打字功能，越写越多：

`能打字` 》 `能统计按键` 》 `能对照显示已打的字的对错` 》 `能显示实时的码长、速度、击键速度` 》 `能切换常用文章` 》 `选择发文字数` 》 
`能乱序当前段，乱序整篇文章` 》 `能记录用户发文配置` 》 `能记录已打的记录，删除` 》 `添加暗黑模式` 》`长文本时自动滚动` 》 `添加文章` 》 
`记录添加文章种类` 》 `添加 CET 英文单词输入，并显示释义` 》 `汉字时打字时不显示输入的编码` 》 `v2.0 拆分 js 文件到模块，采用 require.js AMD 形式加载` 》
`实现自动发文功能` 》 `实现重复发文` 》 `重复时乱序当前段`



## 使用说明

__推荐在 Chrome 谷歌浏览器中使用__

__目前不支持不在编辑区输入编码的输入法__


## 开发说明

出于个人挑战的目的，想使该项目的文件大小越小越好。

 - 使用 `require.js` AMD 形式加载模块文件
 - `css` 使用 `scss` 编写。
 - 历史记录使用 `indexedDB` 存储
 - 配置使用 `localStorage` 存储