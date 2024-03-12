/**
 * Author: KyleBing(kylebing@163.com)
 * Date: 2020/05/17 - 2021/07/22
 *
 * Article     文章列表
 * ArticleType 文章类型
 * Count       所有按键记录
 * Config      用户配置，字数、乱序与否
 * Engine      主程序，开始、结束、暂停
 * Record      每段的打字数据记录
 * Database    IndexedDB    相关操作
 * CETWord     单词元素
 * Editor      自定义添加文章面板
 */

const template = $('.template-container p'); // 对照区主 element
const templateWrapper = $('.template-container');   // 对照区 容器
const typingPad = $('#pad');
const DBName = "TypePad";


let engine; // 暴露 engine 以用于 html 绑定方法用
let editor;

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

window.onload = resizeContent;
window.onresize = resizeContent;

$('#app').style.overflow = 'hidden'


function resizeContent(){
   $('.editor').style.height = innerHeight + 'px';
}


require(['ArticleType', 'Article', 'Engine', 'Editor'],
   function (ArticleType, Article, Engine, Editor) {
      engine = new Engine();
      editor = new Editor();

      engine.loadArticleOptions(); // 载入文章选项列表
      engine.applyConfig();  // 设置 config
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
      engine.fetchAllLog();

      // Service Worker
      if ('serviceWorker' in navigator){
         navigator.serviceWorker
            .register('/tools/typepad/typepad-sw.js?v=2.67')
            .then(()=>{
               console.log('Server Worker has registered');
            })
      }
   })

document.addEventListener('touchstart', ()=>{}, false); // 取消移动端的 touch 动作

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
