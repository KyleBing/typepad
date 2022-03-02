define(function () {
   /**
    * 数组乱序算法
    * @param arr
    * @return {*}
    */
   function shuffle(arr) {
      let length = arr.length,
         r = length,
         rand = 0;

      while (r) {
         rand = Math.floor(Math.random() * r--);
         [arr[r], arr[rand]] = [arr[rand], arr[r]];
      }
      return arr;
   }

   /**
    * 格式化时间，输出字符串
    * @param   date    要格式化的时间
    * @param   formatString    返回时间的格式：
    * @return  格式化后的时间字符串
    * */
   function dateFormatter (date, formatString) {
      formatString = formatString? formatString : 'yyyy-MM-dd hh:mm:ss';
      let dateRegArray = {
         "M+": date.getMonth() + 1,                      // 月份
         "d+": date.getDate(),                           // 日
         "h+": date.getHours(),                          // 小时
         "m+": date.getMinutes(),                        // 分
         "s+": date.getSeconds(),                        // 秒
         "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
         "S": date.getMilliseconds()                     // 毫秒
      };
      if (/(y+)/.test(formatString)) {
         formatString = formatString.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
      }
      for (let section in dateRegArray) {
         if (new RegExp("(" + section + ")").test(formatString)) {
            formatString = formatString.replace(RegExp.$1, (RegExp.$1.length === 1) ? (dateRegArray[section]) : (("00" + dateRegArray[section]).substr(("" + dateRegArray[section]).length)));
         }
      }
      return formatString;
   }
   /**
    * @param：timeLeft 倒计时秒数
    * @return：输出倒计时字符串 时时:分分:秒秒
    **/
   function formatTimeLeft(timeLeft){
      timeLeft = Math.floor(timeLeft / 1000);
      let mins = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;
      return `${mins.toString().padStart(2,'00')}:${seconds.toString().padStart(2,'00')}`;
   }

   // 抖动 dom 元素
   function shakeDom(dom){
      let animateClass = 'shake';
      dom.classList.add('animated');
      dom.classList.add(animateClass);
      setTimeout(()=>{
         dom.classList.remove('animated')
         dom.classList.remove(animateClass)
      }, 250)
   }

   return {
      formatTimeLeft, shuffle, dateFormatter, shakeDom
   }
})