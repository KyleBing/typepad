const CONFIG_NAME = 'TypePad';

define(['Article', 'ArticleType'],function (Article, ArticleType) {
   /**
    * 配置参数
    */
   class Config {
      constructor() {

         // 移除旧版配置文件 v2.62 之前的配置，配置名： typePad
         if (localStorage.getItem('typePad')){
            localStorage.removeItem('typePad')
         }

         if (this.isHasSavedData()){
            let config = JSON.parse(localStorage.getItem(CONFIG_NAME));
            if (config.version){
               this.chapter              = config.chapter;
               this.chapterTotal         = config.chapterTotal;
               this.isShuffle            = config.isShuffle;
               this.isInEnglishMode      = config.isInEnglishMode;
               this.count                = config.count;
               this.articleIdentifier    = config.articleIdentifier;
               this.articleName          = config.articleName;
               this.article              = config.article;
               this.darkMode             = config.darkMode;
               this.articleType          = config.articleType;
               this.IDBIndex             = config.IDBIndex;
               // v2.1 自动发文
               this.isAutoNext           = config.isAutoNext;
               this.isAutoRepeat         = config.isAutoRepeat;
               this.isShuffleRepeat      = config.isShuffleRepeat;
               this.repeatCountTotal     = config.repeatCountTotal || 1;
               this.repeatCountCurrent   = config.repeatCountCurrent || 1;
               // v2.3 自定义内容
               this.customizedContent    = config.customizedContent || '';
               this.customizedTitle      = config.customizedTitle || '';
               // v2.43 大单字练习模式
               this.isBigCharacter       = config.isBigCharacter;
               // v2.61 新历史记录样式
               this.isHistoryInListMode  = config.isHistoryInListMode;
               // v2.65
               this.version              = config.version;
            } else {
               // 清除配置，刷新页面
               localStorage.removeItem(CONFIG_NAME)
               location.reload()
            }
         } else {
            let initChapterAmount = Math.ceil(500 / 15)      // 计算初始段数，非整数时向上取值

            this.version              = 'v2.65'                 // 配置版本号
            this.chapter              = 1;                      // 当前段号
            this.chapterTotal         = initChapterAmount;      // 总段数
            this.isShuffle            = false;                  // 是否乱序模式
            this.isInEnglishMode      = false;                  // 是否处于英文打字状态
            this.count                = '15';                   // 单条数量
            this.articleName          = Article.top500.name;    // 文章名称
            this.articleIdentifier    = 'top500';               // 文章标识
            this.article              = Article.top500.content; // 文章内容
            this.darkMode             = false;                  // 暗黑模式
            this.articleType          = ArticleType.character;  // 文章类型
            this.IDBIndex             = 1;                      // IndexDB    序号
            // v2.1 自动发文
            this.isAutoNext           = false;                  // 自动发文
            this.isAutoRepeat         = false;                  // 重复发文
            this.isShuffleRepeat      = false;                  // 重复发文时乱序
            this.repeatCountTotal     = 1;                      // 总重复数
            this.repeatCountCurrent   = 1;                      // 当前重复数
            // v2.3 自定义内容
            this.customizedTitle      = '';                     // 自定义文章标题
            this.customizedContent    = '';                     // 自定义文章内容
            // v2.43 大单字练习模式
            this.isBigCharacter       = false;
            // v2.61 新历史记录样式
            this.isHistoryInListMode  = false;
         }
      }
      save(){
         localStorage.setItem(CONFIG_NAME, JSON.stringify(this));
      }
      // 判断是否存储过配置信息
      isHasSavedData(){
         return Boolean(localStorage.getItem(CONFIG_NAME));
      }
   }

   return Config
})
