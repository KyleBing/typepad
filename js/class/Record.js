define(['Utility', 'ArticleType'], function (Utility,ArticleType) {
   /**
    * 打字记录
    */
   class Record {
      constructor(speed, codeLength, hitRate, backspace, wordCount, articleName,  timeStart, duration) {
         this.speed       = speed;
         this.codeLength  = codeLength;
         this.hitRate     = hitRate;
         this.backspace   = backspace;
         this.wordCount   = wordCount;
         this.articleName = articleName
         this.timeStart   = timeStart;
         this.duration    = duration;
      }
      getHtml(config){
         let level = Math.floor(this.speed/SPEED_GAP);
         level = level > 6 ? 6 : level; // 速度等级为 6+ 时按 6 处理
         let articleType = ArticleType.getTypeNameWith(config.articleType);
         let textClass = '';
         switch (config.articleType) {
            case ArticleType.character : textClass = 'text-orange';break;
            case ArticleType.english   : textClass = 'text-green';break;
            case ArticleType.article   : textClass = 'text-blue';break;
            case ArticleType.word      : textClass = 'text-red';break;
            case ArticleType.customize : textClass = 'text-roseo';break;
            default: break;
         }
         let articleName = config.isAutoRepeat ?  config.articleName + '@' + config.repeatCountCurrent : config.articleName;
         return `<tr>  
              <td class="text-center roboto-mono">${config.IDBIndex}</td> <!--id-->
              <td class="bold roboto-mono lv-${level}">${this.speed}</td> <!--速度-->
              <td class="hidden-sm">${this.codeLength}</td><!--码长-->
              <td class="hidden-sm">${this.hitRate}</td><!--击键-->
              <td class="hidden-sm">${this.backspace}</td><!--回退-->
              <td>${this.wordCount}</td><!--字数-->
              <td class="text-center ${textClass}">${articleType}</td><!--文章类型-->
              <td>${articleName}</td><!--文章名称-->
              <td class="hidden-sm">${Utility.dateFormatter(new Date(this.timeStart))}</td><!--开始时间-->
              <td class="time">${Utility.formatTimeLeft(this.duration)}</td><!--用时-->
              <td><button class="btn btn-danger btn-sm" onclick="engine.delete(${config.IDBIndex}, this)" type="button">删除</button></td>
            </tr>`;
      }
   }

   return Record
})