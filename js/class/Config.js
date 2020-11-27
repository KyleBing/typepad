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
         this.localStorageLabel = {
            chapter             : 'type_pad_config_chapter',
            chapterTotal        : 'type_pad_config_chapter_total',
            isShuffle           : 'type_pad_config_is_shuffle',
            isInEnglishMode     : 'type_pad_config_is_in_english_mode',
            count               : 'type_pad_config_count',
            articleIdentifier   : 'type_pad_config_article_identifier',
            articleName         : 'type_pad_config_article_name',
            article             : 'type_pad_config_article',
            darkMode            : 'type_pad_config_dark_mode',
            articleType         : 'type_pad_config_article_type',
         }
      }
      save(){
         localStorage[this.localStorageLabel.chapter]              = this.chapter;
         localStorage[this.localStorageLabel.chapterTotal]         = this.chapterTotal;
         localStorage[this.localStorageLabel.isShuffle]            = this.isShuffle;
         localStorage[this.localStorageLabel.isInEnglishMode]      = this.isInEnglishMode;
         localStorage[this.localStorageLabel.count]                = this.count;
         localStorage[this.localStorageLabel.articleIdentifier]    = this.articleIdentifier;
         localStorage[this.localStorageLabel.articleName]          = this.articleName;
         localStorage[this.localStorageLabel.article]              = this.article;
         localStorage[this.localStorageLabel.darkMode]             = this.darkMode
         localStorage[this.localStorageLabel.articleType]          = this.articleType
      }
      get(){
         this.chapter            = Number(localStorage[this.localStorageLabel.chapter]);
         this.chapterTotal       = Number(localStorage[this.localStorageLabel.chapterTotal]);
         this.isShuffle          = Boolean(localStorage[this.localStorageLabel.isShuffle]  === 'true');
         this.isInEnglishMode    = Boolean(localStorage[this.localStorageLabel.isInEnglishMode]  === 'true');
         this.count              = localStorage[this.localStorageLabel.count];
         this.articleIdentifier  = localStorage[this.localStorageLabel.articleIdentifier];
         this.articleName        = localStorage[this.localStorageLabel.articleName];
         this.article            = localStorage[this.localStorageLabel.article];
         this.darkMode           = Boolean(localStorage[this.localStorageLabel.darkMode]  === 'true');
         this.articleType        = localStorage[this.localStorageLabel.articleType];
      }
      // 判断是否存储过配置信息
      hasSavedData(){
         return Boolean(localStorage[this.localStorageLabel.articleIdentifier]);
      }
   }
   return Config
})


function $(selector){
   return document.querySelector(selector)
}