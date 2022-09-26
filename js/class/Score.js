const SCORE_NAME = 'TypePadScore';

define(['Article', 'ArticleType'],function (Article, ArticleType) {
   /**
    * 配置参数
    */
   class Score {
      constructor() {
         if (this.isHasSavedScore()){
            // 取出成绩
            let score = JSON.parse(localStorage.getItem(SCORE_NAME))

            if (score.version){ // 是否有版本号
               for (let type in ArticleType){
                  if (typeof(ArticleType[type]) !== 'function') { // 过滤掉方法属性
                     this[type] = score[type]
                  }
               }
               this.version = score.version
            } else {
               // 清除成绩，刷新页面
               console.log('未发现带版本号的程序，清空成绩并刷新：')
               debugger
               localStorage.removeItem(SCORE_NAME)
               location.reload()
            }
         } else {
            // 初始化成绩
            this.version = 'v2.65'; // v2.65 新增字段，对应的 localStorage 存储内容添加对应的版本号。
            for (let type in ArticleType){
               if (typeof(ArticleType[type]) !== 'function'){ // 过滤掉方法属性
                  this[type] = {
                     timeCost      : 0, // 用时：ms
                     wordCount     : 0, // 字母/汉字数量
                     keyCount      : 0, // 总击键总数

                     codeLengthAve : 0, // 码长 - 平均
                     codeLengthMax : 0, // 码长 - 最大
                     codeLengthMin : 0, // 码长 - 最小

                     hitRateAve    : 0, // 击键 - 平均
                     hitRateMax    : 0, // 击键 - 最大
                     hitRateMin    : 0, // 击键 - 最小

                     speedAve      : 0, // 速度 - 平均
                     speedMin      : 0, // 速度 - 最小
                     speedMax      : 0,  // 速度 - 最大

                     recordCount   : 0, // 记录总数

                     hitRate1      : 0, // 击键 1-15
                     hitRate2      : 0,
                     hitRate3      : 0,
                     hitRate4      : 0,
                     hitRate5      : 0,
                     hitRate6      : 0,
                     hitRate7      : 0,
                     hitRate8      : 0,
                     hitRate9      : 0,
                     hitRate10     : 0,
                     hitRate11     : 0,
                     hitRate12     : 0,
                     hitRate13     : 0,
                     hitRate14     : 0,
                     hitRate15     : 0,

                     codeLength1   : 0, // 码长 1-10
                     codeLength2   : 0,
                     codeLength3   : 0,
                     codeLength4   : 0,
                     codeLength5   : 0,
                     codeLength6   : 0,
                     codeLength7   : 0,
                     codeLength8   : 0,
                     codeLength9   : 0,
                     codeLength10  : 0,

                     speed30    : 0, // 1 速度 30 - 410
                     speed60    : 0, // 2
                     speed90    : 0, // 3
                     speed120   : 0, // 4
                     speed150   : 0, // 5
                     speed180   : 0, // 6
                     speed210   : 0, // 7
                     speed240   : 0, // 8
                     speed270   : 0, // 9
                     speed300   : 0, // 10
                     speed330   : 0, // 11
                     speed360   : 0, // 12
                     speed390   : 0, // 13
                     speed420   : 0, // 14
                  }
               }
            }
         }
      }

      save(){
         localStorage.setItem(SCORE_NAME, JSON.stringify(this));
      }
      // 判断是否存储过配置信息
      isHasSavedScore(){
         return Boolean(localStorage.getItem(SCORE_NAME));
      }
   }

   return Score
})
