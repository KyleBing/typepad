# 玫枫跟打器
> Roseo Maple Type Pad

<img width="100" src="img/logo.png"/>

**使用线上地址**
> [https://kylebing.cn/tools/typepad/](https://kylebing.cn/tools/typepad/)

**也可以本地运行**
> 直接下载 [源文件](https://github.com/KyleBing/typepad/archive/refs/heads/master.zip)，双击或用浏览器打开 `index.html` 即可本地运行


### 截图

<img width="1415" alt="Screen Shot 2022-09-16 at 23 33 28" src="https://user-images.githubusercontent.com/12215982/190679390-886d4fc4-d526-494b-a35c-7db3a7fc4331.png">


## 一、由来
自己是个五笔爱好者，也一直在使用五笔，从 `Windows` 转到 `Mac` 之后，也没有有可用的跟打器，每回想练练打字了都需要打开 `Windows` 模拟器来打字。
一直一直想有个能在 `macOS` 上运行的跟打器。
最初是想自己用 `swift` 开发一个原生的 `app`，搭了个框架，准备写的时候发现好多东西不太熟。后来突然的一个周末，突然又想用本行开发一个试试，于是就有了这个。

从最初的打字功能，越写越多：

`能打字` 》`能统计按键` 》`能对照显示已打的字的对错` 》`能显示实时的码长、速度、击键速度` 》`能切换常用文章` 》`选择发文字数` 》
`能乱序当前段，乱序整篇文章` 》`能记录用户发文配置` 》`能记录已打的记录，删除` 》`添加暗黑模式` 》`长文本时自动滚动` 》`添加文章` 》
`记录添加文章种类` 》`添加 CET 英文单词输入，并显示释义` 》`汉字时打字时不显示输入的编码` 》
`v2.0 拆分 js 文件到模块，采用 require.js AMD 形式加载` 》`实现自动发文功能` 》`实现重复发文` 》`重复时乱序当前段` 》
`无网络的时候也能使用` 》`自定义发文内容` 》 `添加大单字模式，更好的专注于单字练习` 》 `分组显示所有文章列表` 》 `添加大量英文单词`

从这里能看到过程中每个阶段的截图：
> [各版本截图记录](https://github.com/KyleBing/typepad/discussions/18)

## 二、使用说明

__推荐在 Chrome 谷歌浏览器中使用__

__目前不支持不在编辑区输入编码的输入法__


## 三、开发说明

出于个人挑战的目的，想使该项目的文件大小越小越好。

 - 使用 `require.js` AMD 形式加载模块文件
 - `css` 使用 `scss` 编写。
 - 历史记录使用 `indexedDB` 存储
 - 配置使用 `localStorage` 存储
 - 使用 `service-worker` 处理离线请求

该工具参考了添雨跟打器的一些功能
> [添雨跟打器 旧版](https://github.com/taliove/tygdq)


## 四、其它
**线上成绩保存**
之所以没有加，是因为 web 页面的成绩肯定是无法控制的，可以作假，那么就不如自己掌握了，本身跟打器就的主要使命就是自己练习，成绩只是反应你练习好坏的，也不是给别人看的，只是用于自己参考。

**可能会支持云端记录跟打成绩**
但应该也只限自己查看，统计等


## 五、支持

感谢 [JetBrains](https://www.jetbrains.com/?from=typepad@KyleBing) 提供的工具支持

![JetBrains](https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.svg?_ga=2.54620846.401568951.1648434626-301403838.1648434626)

