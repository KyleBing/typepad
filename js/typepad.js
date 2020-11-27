/**
 * Author: KyleBing(kylebing@163.com)
 *
 * Count 所有按键记录
 * Config 用户配置，字数、乱序与否
 * Engine 主程序，开始、结束、暂停
 * Record 每段的打字数据记录
 * Database IndexedDB 相关操作
 * CETWord 单词元素
 *
 */

const template = $('.template p'); // 对照区主 element
const templateWrapper = $('.template');   // 对照区 容器
const typingPad = $('#pad');
const DBName = "TypePad";

let engine;
let database;
let config;
let keyCount;

// require config
require.config({
   baseUrl: "./js/class",
   paths: {
      'ArticleType': 'ArticleType',
      'Article': 'Article',
      'Config': 'Config',
      'KeyCount': 'KeyCount',
      'Engine': 'Engine',
      'CETWord': 'CETWord',
      'Reg': 'Reg',
      'Record': 'Record',
      'Database': 'Database',
      'Utility': 'Utility',
   }
});

require(['ArticleType', 'Article', 'KeyCount', 'Engine', 'Config', 'Record', 'CETWord', 'Reg', 'Database', 'Utility'],
   function (ArticleType,
             Article,
             KeyCount,
             Engine,
             Config,
             Record,
             CETWord,
             Reg,
             Database,
             Utility) {

      engine = new Engine();
      record = new Record();
      config = new Config();
      keyCount = new KeyCount();
      database = new Database();

      engine.loadArticleOptions(); // 载入文章选项列表
      config.setWithCurrentConfig();  // 设置 config
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
