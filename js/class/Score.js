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
            for (let type in ArticleType){
               this[type] = score[type]
            }
         } else {
            // 初始化成绩
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
                     speedMax      : 0  // 速度 - 最大
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
