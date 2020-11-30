const CONFIG_NAME = 'typePad';

define(['Article', 'ArticleType'],function (Article, ArticleType) {
   /**
    * 配置参数
    */
   class Config {
      constructor() {
         if (this.hasSavedData()){
            let config = JSON.parse(localStorage.getItem(CONFIG_NAME));
            this.chapter            = config.chapter;
            this.chapterTotal       = config.chapterTotal;
            this.isShuffle          = config.isShuffle;
            this.isInEnglishMode    = config.isInEnglishMode;
            this.isAutoNext         = config.isAutoNext;
            this.count              = config.count;
            this.articleIdentifier  = config.articleIdentifier;
            this.articleName        = config.articleName;
            this.article            = config.article;
            this.darkMode           = config.darkMode;
            this.articleType        = config.articleType;
            this.IDBIndex           = config.IDBIndex;
         } else {
            this.chapter           = 1;                       // 当前段号
            this.chapterTotal      = 1;                       // 总段数
            this.isShuffle         = false;                   // 是否乱序模式
            this.isInEnglishMode   = false;                   // 是否处于英文打字状态
            this.isAutoNext        = false;                   // 自动发文
            this.count             = '15';                    // 单条数量
            this.articleName       = Article.top500.name;     // 文章名称
            this.articleIdentifier = 'top500';                // 文章标识
            this.article           = Article.top500.content;  // 文章内容
            this.darkMode          = false;                   // 暗黑模式
            this.articleType       = ArticleType.character;   // 文章类型
            this.IDBIndex          = 1;                       // IndexDB 序号
         }
      }
      save(){
         localStorage.setItem(CONFIG_NAME, JSON.stringify(this));
      }
      applyIn(engine){
         // 根据当前配置文件设置内容
         $('input[type=checkbox]#shuffleMode').checked = this.isShuffle;
         $('input[type=checkbox]#darkMode').checked = this.darkMode;
         $('input[type=checkbox]#autoNext').checked = this.isAutoNext;
         let radioNodes = document.querySelectorAll('input[name=count][type=radio]');
         let radios = [...radioNodes];
         radios.forEach(item => {
            item.checked = item.value === this.count
         })
         $('select#article').value = this.articleIdentifier;

         // English Mode
         if (this.isInEnglishMode) {
            engine.englishModeEnter()
         }

         // Dark Mode
         let body = $('body');
         if (this.darkMode) {
            body.classList.add('black');
         } else {
            body.classList.remove('black');
         }

         engine.currentOriginWords = this.article.split('');
         if (this.articleType === ArticleType.word) {
            // CET 时
            engine.arrayWordAll = Article.CET4.getWordsArray();
            engine.arrayWordDisplaying = engine.arrayWordAll.slice(Number(this.count) * (this.chapter - 1), Number(this.count) * (this.chapter)); // 截取当前需要显示的数组段
            let arrayCurrentWord = engine.arrayWordDisplaying.map(item => {
               return item.word
            }); // 取到英文，数组
            engine.currentWords = arrayCurrentWord.join(' ');
         } else {
            // 其它时
            if(this.count === 'ALL'){
               engine.currentWords = engine.currentOriginWords.join('');
            } else {
               engine.currentWords = engine.currentOriginWords.slice(Number(this.count) * (this.chapter - 1), Number(this.count) * (this.chapter)).join('');
            }
         }
         template.innerText = engine.currentWords;
      }
      // 判断是否存储过配置信息
      hasSavedData(){
         return Boolean(localStorage.getItem(CONFIG_NAME));
      }
   }
   return Config
})


function $(selector){
   return document.querySelector(selector)
}