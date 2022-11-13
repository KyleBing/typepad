const preFix = 'typepad'
const version = '2.66b2';

self.addEventListener('install', event => {
   self.skipWaiting();
   event.waitUntil(
      caches.open(preFix + version).then(cache => {
         return cache.addAll([
            '/tools/typepad',
            '/tools/typepad/index.html?v=2.66b2',
            '/tools/typepad/scss/typepad.css?v=2.66b2',

            // 英文单词
            '/tools/typepad/js/class/english-vocabulary/CET4mini.js?v=2.66b2',

            // 汉语单词
            '/tools/typepad/js/class/phrase/Phrase.js?v=2.66b2',

            '/tools/typepad/js/class/Database.js?v=2.66b2',
            '/tools/typepad/js/class/Utility.js?v=2.66b2',
            '/tools/typepad/js/class/KeyCount.js?v=2.66b2',
            '/tools/typepad/js/class/Config.js?v=2.66b2',
            '/tools/typepad/js/class/Editor.js?v=2.66b2',
            '/tools/typepad/js/class/Article.js?v=2.66b2',
            '/tools/typepad/js/class/ArticleType.js?v=2.66b2',
            '/tools/typepad/js/class/Reg.js?v=2.66b2',
            '/tools/typepad/js/class/Engine.js?v=2.66b2',
            '/tools/typepad/js/class/Record.js?v=2.66b2',
            '/tools/typepad/js/class/CETWord.js?v=2.66b2',
            '/tools/typepad/js/require_v2.3.6.js',
            '/tools/typepad/js/typepad.js?v=2.66b2',
            '/tools/typepad/img/logo.png',
            '/tools/typepad/scss/font/DSDigital.ttf',
            '/tools/typepad/scss/font/Galvji.ttf',
            '/tools/typepad/scss/font/ImpactPureNumber.ttf',
            '/tools/typepad/scss/font/JetBrainsMonoOnlyCharacter.ttf',
            '/tools/typepad/scss/font/RobotoMono.ttf',
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

// 处理页面请求
self.addEventListener('fetch', event => {
   event.respondWith(
      caches.match(event.request).then(res => {
         return res || fetch(event.request);
      })
   )
})
