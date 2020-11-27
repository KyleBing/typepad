// 成绩记录
class Record {
   constructor(speed, codeLength, hitRate, backspace, wordCount, articleName,  timeStart, duration) {
      this.speed = speed;
      this.codeLength = codeLength;
      this.hitRate = hitRate;
      this.backspace = backspace;
      this.wordCount = wordCount;
      this.articleName = articleName
      this.timeStart = timeStart;
      this.duration = duration;
   }
   getHtml(){
      let level = Math.floor(this.speed/SPEED_GAP);
      level = level > 6 ? 6 : level; // 速度等级为 6+ 时按 6 处理
      let articleType = ArticleType.getTypeNameWith(config.articleType);
      let textClass = '';
      switch (config.articleType) {
         case ArticleType.character: textClass = 'text-orange';break;
         case ArticleType.english: textClass = 'text-green';break;
         case ArticleType.article: textClass = 'text-blue';break;
         case ArticleType.word: textClass = 'text-red';break;
         default: break;
      }
      return `<tr>  
              <td class="text-center roboto-mono">${this.id}</td> <!--id-->
              <td class="bold roboto-mono lv-${level}">${this.speed}</td> <!--速度-->
              <td>${this.codeLength}</td><!--码长-->
              <td>${this.hitRate}</td><!--击键-->
              <td>${this.backspace}</td><!--回退-->
              <td>${this.wordCount}</td><!--字数-->
              <td class="text-center ${textClass}">${articleType}</td><!--文章类型-->
              <td>${config.articleName}</td><!--文章名称-->
              <td class="hidden-sm">${dateFormatter(new Date(this.timeStart))}</td><!--开始时间-->
              <td class="time">${formatTimeLeft(this.duration)}</td><!--用时-->
              <td><button class="btn btn-danger btn-sm" onclick="database.delete(${this.id}, this)" type="button">删除</button></td>
            </tr>`;
   }
}

define(function () {
   return Record
})