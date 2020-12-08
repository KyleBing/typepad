const preFix = 'typepad'
const version = '230';

self.addEventListener('install', event => {
   self.skipWaiting();
   event.waitUntil(
      caches.open(preFix + version).then(cache => {
         return cache.addAll([
            '/tools/typepad',
            '/tools/typepad/',
            '/tools/typepad/index.html',
            '/tools/typepad/css/_copyright.scss',
            '/tools/typepad/css/_variables.scss',
            '/tools/typepad/css/typepad.css.map',
            '/tools/typepad/css/_reset.scss',
            '/tools/typepad/css/_option.scss',
            '/tools/typepad/css/_button.scss',
            '/tools/typepad/css/_editor.scss',
            '/tools/typepad/css/_table.scss',
            '/tools/typepad/css/_info.scss',
            '/tools/typepad/css/typepad.css?v=2.30',
            '/tools/typepad/css/_utility.scss',
            '/tools/typepad/css/_font.scss',
            '/tools/typepad/css/_animate.scss',
            '/tools/typepad/css/typepad.scss',
            '/tools/typepad/css/_black.scss',
            '/tools/typepad/js/class/Database.js',
            '/tools/typepad/js/class/Utility.js',
            '/tools/typepad/js/class/KeyCount.js',
            '/tools/typepad/js/class/Config.js',
            '/tools/typepad/js/class/Editor.js',
            '/tools/typepad/js/class/Article.js',
            '/tools/typepad/js/class/ArticleType.js',
            '/tools/typepad/js/class/Reg.js',
            '/tools/typepad/js/class/Engine.js',
            '/tools/typepad/js/class/Record.js',
            '/tools/typepad/js/class/CETWord.js',
            '/tools/typepad/js/require_v2.3.6.js',
            '/tools/typepad/js/typepad.js?v=2.30',
            '/tools/typepad/img/logo.png',
            '/tools/typepad/font/RobotoMono.ttf',
            '/tools/typepad/font/DSDigital.ttf',
            '/tools/typepad/font/ImpactPureNumber.ttf',
         ])
      })
   )
})

// 清除之前版本的数据
self.addEventListener('activate', event => {
   console.log('sw: activate')
   event.waitUntil(
      caches.keys().then( keyList => {
         return Promise.all(keyList.map(item => {
            if (/typepad/i.test(item)){ // 如果包含 typepad 字符串
               if (item !== preFix + version){
                  return caches.delete(item);
               }
            }
         }));
      })
   )
})

self.addEventListener('fetch', event => {
   event.respondWith(
      caches.match(event.request).then(res => {
         return res || fetch(event.request);
      })
   )
})