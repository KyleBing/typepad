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


      // database
      let DB;
      database = new Database();

      engine.loadArticleOptions(); // 载入文章选项列表

      // 最开始的时候，如果没有检测到存储的数据，初始化
      if (config.hasSavedData()) {
         config.get();
         engine.setWithCurrentConfig();
      } else {
         config.save();
         config.get();
         engine.setWithCurrentConfig();
         engine.changePerCount();
      }

      // init

      if (config.articleType === ArticleType.word) {
         // CET 时
         engine.arrayWordAll = Article.CET4.getWordsArray();
         engine.arrayWordDisplaying = engine.arrayWordAll.slice(Number(config.count) * (config.chapter - 1), Number(config.count) * (config.chapter)); // 截取当前需要显示的数组段
         let arrayCurrentWord = engine.arrayWordDisplaying.map(item => {
            return item.word
         }); // 取到英文，数组
         engine.currentWords = arrayCurrentWord.join(' ');
      } else {
         // 其它时
         engine.currentWords = engine.currentOriginWords.slice(Number(config.count) * (config.chapter - 1), Number(config.count) * (config.chapter)).join('');
         debugger
      }
      template.innerText = engine.currentWords;
      engine.updateInfo();

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

      // INDEX DB
      database.fetchAll();


      // 按键过滤器
      /****
       **** ⌘ + R: 重打当前段
       **** ⌘ + L: 打乱当前段
       **** ⌘ + N: 下一段
       **** ⌘ + P: 上一段
       **** ⌘ + H: 重新开始
       ****/
      typingPad.onkeydown = e => {
         if (e.key === 'Tab' || ((e.metaKey || e.ctrlKey) && (/[nqwefgplt]/.test(e.key)))) {
            e.preventDefault();
         } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
            e.preventDefault();
            engine.reset();
         } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            engine.wordsShuffle();
         } else if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
            engine.prevChapter();
            e.preventDefault();
         } else if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
            engine.nextChapter();
            e.preventDefault();
         } else if (e.key === 'Escape') {
            engine.pause();
            e.preventDefault();
         } else if (Reg.az.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey && !engine.isStarted && !engine.isFinished) {
            engine.start()
         }
      }
      typingPad.onkeyup = e => {
         e.preventDefault();
         if (!engine.isFinished && engine.isStarted) {
            keyCount.countKeys(e);
            engine.compare();
            // 末字时结束的时候
            if (typingPad.value.length >= engine.currentWords.length) {
               if (typingPad.value === engine.currentWords) {
                  engine.finish();
               }
            }
         }
      }
      typingPad.oninput = e => {
         if (!engine.isFinished && engine.isStarted) {
            engine.compare();
            // 末字时结束的时候
            if (typingPad.value.length >= engine.currentWords.length) {
               if (typingPad.value === engine.currentWords) {
                  engine.finish();
               }
            }
         } else if (!engine.isFinished) {
            engine.start()
         }
      }

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

function enterDarkMode(sender) {
   let body = $('body');
   require(['Config'], function (Config) {
      let config = new Config();
      config.get();
      if (config.darkMode) {
         body.classList.remove('black');
         config.darkMode = false;
         sender.innerText = "暗黑"
         config.save();
      } else {
         body.classList.add('black');
         config.darkMode = true;
         sender.innerText = "白色"
         config.save();
      }
   })


}