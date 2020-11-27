/**
 * Author: KyleBing(kylebing@163.com)
 *
 * Count 所有按键记录
 * Config 用户配置，字数、乱序与否
 * Engine 主程序，开始、结束、暂停
 * Record 每段的打字数据记录
 * Database IndexedDB 相关操作
 * CETWord 单词元素
 */

const template        = $('.template p'); // 对照区主 element
const templateWrapper = $('.template');   // 对照区 容器
const typingPad       = $('#pad');
const DBName          = "TypePad";


let engine; // 暴露 engine 以用于 html 绑定方法用

// require config
require.config({
   baseUrl: "./js/class",
   paths: {
      'ArticleType' : 'ArticleType',
      'Article'     : 'Article',
      'Config'      : 'Config',
      'Engine'      : 'Engine',
      'CETWord'     : 'CETWord',
      'Reg'         : 'Reg',
      'Database'    : 'Database',
   }
});


require(['ArticleType', 'Article', 'Engine', 'Config', 'CETWord', 'Reg', 'Database' ],
   function ( ArticleType, Article, Engine, Config, CETWord, Reg, Database ) {

      engine = new Engine();
      let config = new Config();
      let database = new Database();

      engine.loadArticleOptions(); // 载入文章选项列表
      config.applyIn(engine);  // 设置 config
      engine.updateInfo(); // 刷新界面

      typingPad.onblur = () => {
         if (engine.isStarted && !engine.isPaused) {
            engine.pause();
         }
      }
      typingPad.onfocus = () => {
         if (engine.isStarted && engine.isPaused) {
            engine.resume();
         }
      }

      // 显示历史记录
      database.fetchAll();

   })

function $(selector) {
   return document.querySelector(selector)
}


// 当全屏模式变化时
document.documentElement.onfullscreenchange = () => {
   let didEnteredFullScreen = Boolean(document.fullscreenElement);
   if (didEnteredFullScreen) {
      $('.full-screen-btn').classList.add('hidden');
      $('.full-screen-tip').classList.remove('hidden');
   } else {
      $('.full-screen-btn').classList.remove('hidden');
      $('.full-screen-tip').classList.add('hidden');
   }
}

function enterFullScreenMode() {
   document.documentElement.requestFullscreen()
}
