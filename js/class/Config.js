const CONFIG_NAME = 'typePad';

define(['Article'],function (Article) {
   // 跟打器参数
   class Config {
      constructor() {
         this.chapter           = 1;                       // 当前段号
         this.chapterTotal      = 1;                       // 总段数
         this.isShuffle         = false;                   // 是否乱序模式
         this.isInEnglishMode   = false;                   // 是否处于英文打字状态
         this.count             = '15';                    // 单条数量
         this.articleName       = Article.top500.name;     // 文章名称
         this.articleIdentifier = 'top500';                // 文章标识
         this.article           = Article.top500.content;  // 文章内容
         this.darkMode          = false;                   // 暗黑模式
         this.articleType       = ArticleType.character;   // 文章类型
         this.IDBIndex          = 1;                       // IndexDB 序号
      }
      save(){
         localStorage.setItem(CONFIG_NAME, JSON.stringify(this));
      }
      get(){
         let config = JSON.parse(localStorage.getItem(CONFIG_NAME));
         this.chapter            = config.chapter;
         this.chapterTotal       = config.chapterTotal;
         this.isShuffle          = config.isShuffle  === 'true';
         this.isInEnglishMode    = config.isInEnglishMode  === 'true';
         this.count              = config.count;
         this.articleIdentifier  = config.articleIdentifier;
         this.articleName        = config.articleName;
         this.article            = config.article;
         this.darkMode           = config.darkMode  === 'true';
         this.articleType        = config.articleType;
         this.IDBIndex           = config.IDBIndex;
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