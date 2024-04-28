<img width="100" src="img/logo.png"/>

## 玫枫跟打器
Roseo Maple Type Pad


## 界面

<img width="1624" alt="Screen Shot 2022-09-26 at 22 33 44" src="https://user-images.githubusercontent.com/12215982/192304108-002676b1-e6b9-4820-8947-25febc223980.png">

## 下载
### 1. 线上地址
[http://kylebing.cn/tools/typepad/](http://kylebing.cn/tools/typepad/)

### 2. 本地运行
直接下载 [源文件](https://github.com/KyleBing/typepad/archive/refs/heads/master.zip)，双击或用浏览器打开 `index.html` 即可本地运行

如果你想用来练习英文单词，请下载拥有完整`CET4/6`，`托福`等单词的版本： [v2.58](https://github.com/KyleBing/typepad/releases/tag/v2.58)


## 一、由来
自己是个五笔爱好者，也一直在使用五笔，从 `Windows` 转到 `Mac` 之后，没有可用的跟打器，每回想练练打字了都需要打开 `Windows` 模拟器运行添雨跟打器来练字。
一直一直想有个能在 `macOS` 上运行的跟打器。
最初是想自己用 `Swift` 开发一个原生的 app，搭了个框架，准备写的时候发现好多东西不太熟，放弃了。后来突然的一个周末，突然又想用本行开发一个试试，于是就有了这个。

从最初的打字功能，越写越多：

`能打字` 》`能统计按键` 》`能对照显示已打的字的对错` 》`能显示实时的码长、速度、击键速度` 》`能切换常用文章` 》`选择发文字数` 》
`能乱序当前段，乱序整篇文章` 》`能记录用户发文配置` 》`能记录已打的记录，删除` 》`添加暗黑模式` 》`长文本时自动滚动` 》`添加文章` 》
`记录添加文章种类` 》`添加 CET 英文单词输入，并显示释义` 》`汉字时打字时不显示输入的编码` 》
`v2.0 拆分 js 文件到模块，采用 require.js AMD 形式加载` 》`实现自动发文功能` 》`实现重复发文` 》`重复时乱序当前段` 》
`无网络的时候也能使用` 》`自定义发文内容` 》 `添加大单字模式，更好的专注于单字练习` 》 `分组显示所有文章列表` 》 `添加大量英文单词` 》 
`新的成绩展示样式` 》  `统计单一类别的所有跟打数据` 》 `添加汉语词条跟打类型` 》 `显示跟打统计图表` 》 `优化移动端显示`


## 二、使用说明

- **推荐在谷歌浏览器（Chrome）中使用**
- **目前不支持不在编辑区输入编码的输入法**


## 三、开发说明

最初出于个人挑战的目的，想使该项目的体积越小越好，于是选用了 `require.js` 作为分割模块的框架:
> 并不是 `require.js` 优于其它框架，只是此工具生于这个，就没有再变化。
> 还是比较原始的操作方式，想变哪就改哪的 `dom`，要改成 `Vue` 的话估计得耗时不少。

- 使用 `require.js` AMD 形式加载模块文件
- `css` 使用 `scss` 编写。
- 历史记录使用 `indexedDB` 存储
- 配置使用 `localStorage` 存储
- 使用 `service-worker` 处理离线请求

该工具参考了添雨跟打器的一些功能，之前一直在 QQ 群里用添雨跟打器练习五笔打字。
> [添雨跟打器 旧版](https://github.com/taliove/tygdq)


## 四、其它

### 1.线上成绩保存
之所以没有加，是因为 web 页面的成绩肯定是无法控制的，可以作假，那么就不如自己掌握了，本身跟打器就的主要使命就是自己练习，成绩只是反应你练习好坏的，也不是给别人看的，供自己参考的价值比较高些。

### 2.可能会支持云端记录跟打成绩
但应该也只限自己查看，统计等，日后吧~


## 五、历史

`2020.05.17` ~ `2024.04.28`

[各历史版本截图记录 >>](https://github.com/KyleBing/typepad/discussions/18)


## 六、支持
感谢 [JetBrains](https://www.jetbrains.com/?from=typepad@KyleBing) 提供的工具支持

![JetBrains](https://resources.jetbrains.com/storage/products/company/brand/logos/jb_beam.svg?_ga=2.54620846.401568951.1648434626-301403838.1648434626)


