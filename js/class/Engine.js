define(['Reg','ArticleType','Article', 'Config', 'Record', 'Database', 'KeyCount', 'Utility'], function (
   Reg,
   ArticleType,
   Article,
   Config,
   Record,
   Database,
   KeyCount,
   Utility) {
   const untypedStringClassName = 'untyped-part';
   const HEIGHT_TEMPLATE = 150; // 对照区高度

   let keyCount = new KeyCount();
   let config = new Config();
   let record = new Record();
   let database = new Database()

   /**
    * 跟打器内核
    */
   class Engine {
      constructor() {
         this.isFinished = false;
         this.isStarted = false;
         this.isPaused = false;
         this.timeStart; //ms
         this.timeEnd; // ms
         this.duration = 0; // ms
         this.handleRefresh;
         this.refreshRate = 500; // ms

         this.correctWordsCount = 0;
         this.currentWords = '';       // 当前显示的文字
         this.currentOriginWords = [];       // 字体拆分的全部数组
         this.arrayWordAll = [];       // 全部单词
         this.arrayWordDisplaying = [];       // 展示的单词


         // 按键过滤器
         /****
          **** ⌘ + R: 重打当前段
          **** ⌘ + L: 打乱当前段
          **** ⌘ + N: 下一段
          **** ⌘ + P: 上一段
          **** ⌘ + H: 重新开始
          ****/
         typingPad.onkeydown = e => {
            if (e.key === 'Tab' || ((e.metaKey || e.ctrlKey) && (/[nqwefgplt]/.test(e.key)))) {
               // 消除一些默认浏览器快捷键的效果
               e.preventDefault();
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
               e.preventDefault();
               this.reset();
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
               e.preventDefault();
               this.shuffleCurrent();
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
               this.prevChapter();
               e.preventDefault();
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
               this.nextChapter();
               e.preventDefault();
            } else if (e.key === 'Escape') {
               this.pause();
               e.preventDefault();
            } else if (Reg.az.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey && !this.isStarted && !this.isFinished) {
               this.start()
            }
         }
         typingPad.onkeyup = e => {
            e.preventDefault();
            if (!this.isFinished && this.isStarted) {
               keyCount.countKeys(e);
               this.compare();
               // 末字时结束的时候
               if (typingPad.value.length >= this.currentWords.length) {
                  if (typingPad.value === this.currentWords) {
                     this.finish();
                  }
               }
            }
         }
         typingPad.oninput = e => {
            if (!this.isFinished && this.isStarted) {
               this.compare();
               // 末字时结束的时候
               if (typingPad.value.length >= this.currentWords.length) {
                  if (typingPad.value === this.currentWords) {
                     this.finish();
                  }
               }
            } else if (!this.isFinished) {
               this.start()
            }
         }
      }

      applyConfig(){
         // 根据当前配置文件设置内容
         $('input[type=checkbox]#shuffleMode').checked = config.isShuffle;
         $('input[type=checkbox]#darkMode').checked = config.darkMode;
         $('input[type=checkbox]#autoNext').checked = config.isAutoNext;
         $('input[type=checkbox]#autoRepeat').checked = config.isAutoRepeat;
         $('input[type=checkbox]#shuffleRepeat').checked = config.isShuffleRepeat;
         let radioNodes = document.querySelectorAll('input[name=count][type=radio]');
         let radios = [...radioNodes];
         radios.forEach(item => {
            item.checked = item.value === config.count
         })
         $('select#article').value = config.articleIdentifier;

         // English Mode
         if (config.isInEnglishMode) {
            this.englishModeEnter()
         }

         // Dark Mode
         let body = $('body');
         if (config.darkMode) {
            body.classList.add('black');
         } else {
            body.classList.remove('black');
         }

         // Repeat Monitor
         $('#repeatCountTotal').innerText = config.repeatCountTotal
         $('#repeatCountCurrent').innerText = config.repeatCountCurrent


         this.currentOriginWords = config.article.split('');
         if (config.articleType === ArticleType.word) {
            // CET 时
            this.arrayWordAll = Article.CET4.getWordsArray();
            this.arrayWordDisplaying = this.arrayWordAll.slice(Number(config.count) * (config.chapter - 1), Number(config.count) * (config.chapter)); // 截取当前需要显示的数组段
            let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
               return item.word
            }); // 取到英文，数组
            this.currentWords = arrayCurrentWord.join(' ');
         } else {
            // 其它时
            if(config.count === 'ALL'){
               this.currentWords = this.currentOriginWords.join('');
            } else {
               this.currentWords = this.currentOriginWords.slice(Number(config.count) * (config.chapter - 1), Number(config.count) * (config.chapter)).join('');
            }
         }
         template.innerText = this.currentWords;
      }

      fetchAllLog(){
         database.fetchAll();
      }

      start() {
         this.isStarted = true;
         this.timeStart = (new Date()).getTime();
         this.startRefresh();
      }

      startRefresh() {
         this.handleRefresh = setInterval(() => {
            let timeNow = (new Date()).getTime();
            this.duration = timeNow - this.timeStart;
            this.updateInfo();
            this.showTime();
         }, this.refreshRate)
      }

      stopRefresh() {
         clearInterval(this.handleRefresh);
      }


      // 上一段
      prevChapter() {
         if (config.chapter !== 1) {
            if (config.articleType === ArticleType.word) {
               this.arrayWordDisplaying = this.arrayWordAll.slice(config.count * (config.chapter - 2), config.count * (config.chapter - 1)); // 截取当前需要显示的数组段
               let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
                  return item.word
               }); // 取到英文，数组
               this.currentWords = arrayCurrentWord.join(' ');
            } else {
               this.currentWords = this.currentOriginWords.slice(config.count * (config.chapter - 2), config.count * (config.chapter - 1)).join('');
            }
            config.chapter--;
            this.reset();
            config.save();
         } else {
            console.log('retch bottom')
            let chapterBtn = $('#totalChapter');
            shakeBtn(chapterBtn)
         }
      }

      // 下一段
      nextChapter() {
         if (config.chapter !== config.chapterTotal) {
            if (config.articleType === ArticleType.word) {
               this.arrayWordDisplaying = this.arrayWordAll.slice(config.count * config.chapter, config.count * (config.chapter + 1)); // 截取当前需要显示的数组段
               let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
                  return item.word
               }); // 取到英文，数组
               this.currentWords = arrayCurrentWord.join(' ');
            } else {
               this.currentWords = this.currentOriginWords.slice(config.count * config.chapter, config.count * (config.chapter + 1)).join('');
            }

            config.chapter++;
            this.reset();
            config.save();
         } else {
            console.log('retch bottom')
            let animateClass = 'shake';
            let chapterBtn = $('#totalChapter');
            chapterBtn.classList.add(animateClass);
            setTimeout(()=>{
               chapterBtn.classList.remove(animateClass)
            }, 250)
         }
      }

      // 载入文章列表选项
      loadArticleOptions() {
         let optionHtml = '';
         for (let itemName in Article) {
            let article = Article[itemName];
            let tempHtml = `<option value="${itemName}">${ArticleType.getTypeNameWith(article.type)} - ${article.name}</option>`;
            optionHtml += tempHtml;
         }
         $('#article').innerHTML = optionHtml;
      }


      // 改变文章内容
      changeArticle() {
         let articleName = $('select#article').value;
         let article = Article[articleName];
         config.articleIdentifier = articleName;
         config.articleName = article.name;
         config.articleType = article.type;
         switch (config.articleType) {
            case ArticleType.character:
               this.currentOriginWords = config.isShuffle ? Utility.shuffle(article.content.split('')) : article.content.split('');
               config.article = this.currentOriginWords.join('');
               this.englishModeLeave();
               break;
            case ArticleType.article:
               config.article = article.content;
               this.currentOriginWords = config.article.split('');
               this.englishModeLeave();
               break;
            case ArticleType.english:
               config.article = article.content;
               this.englishModeEnter();
               this.currentOriginWords = config.article.split('');
               break;
            case ArticleType.word:
               config.article = article.content;
               this.englishModeEnter();
               this.arrayWordAll = Article.CET4.getWordsArray();
               this.currentOriginWords = config.article.split('');
               break;
            default:
               break;
         }
         config.save();
         this.changePerCount();
      }

      // 改变重复次数
      changeRepeatCount(){

      }

      // 改变数字时
      changePerCount() {
         let originTol = 0;
         config.count = $('input[type=radio]:checked').value;;
         if (config.articleType === ArticleType.word) { // CET 单词模式时，count 为单词数
            let count = config.count === 'ALL' ? this.arrayWordAll.length : config.count;
            this.arrayWordDisplaying = this.arrayWordAll.slice(0, count); // 截取当前需要显示的数组段
            let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
               return item.word
            }); // 取到英文，数组
            this.currentWords = arrayCurrentWord.join(' ');
            originTol = this.arrayWordAll.length / Number(config.count);
         } else {
            if (config.count === 'ALL') {
               this.currentWords = this.currentOriginWords.join('');
            } else {
               this.currentWords = this.currentOriginWords.slice(0, Number(config.count)).join('');
            }
            originTol = this.currentOriginWords.length / Number(config.count);
         }
         config.chapter = 1;
         let tempTol = Math.floor(originTol);
         if (config.count === 'ALL') {
            config.chapterTotal = 1
         } else {
            config.chapterTotal = originTol > tempTol ? tempTol + 1 : tempTol;
         }

         config.save(); // save config
         this.reset();
         this.updateInfo();
      }

      // 进入暗黑模式
      enterDarkMode() {
         let body = $('body');
         if (config.darkMode) {
            body.classList.remove('black');
            config.darkMode = false;
            config.save();
         } else {
            body.classList.add('black');
            config.darkMode = true;
            config.save();
         }
      }

      // 自动发文
      autoNext(){
         config.isAutoNext = $('#autoNext').checked;
         config.save();
      }

      // 重复发文
      autoRepeat(){
         config.isAutoRepeat = $('#autoRepeat').checked;
         config.save();
      }

      // 重复发文时乱序
      shuffleRepeat(){
         config.isShuffleRepeat = $('#shuffleRepeat').checked;
         config.save();
      }

      // 重复次数 +
      repeatCountAdd(){
         config.repeatCountTotal++;
         $('#repeatCountTotal').innerText = config.repeatCountTotal;
         config.save()
      }
      // 重复次数 -
      repeatCountMinus(){
         if (config.repeatCountTotal > 1){
            config.repeatCountTotal--;
            $('#repeatCountTotal').innerText = config.repeatCountTotal;
            config.save()
         } else {
            console.log('can not lower than 1')
            let btn = $('#repeatMonitor')
            shakeBtn(btn)
         }
      }

      // 切换乱序模式
      shuffleCurrentArticle() {
         config.isShuffle = $('#shuffleMode').checked;
         if (config.articleType === ArticleType.word) {
            if (config.isShuffle) {
               this.arrayWordAll = Utility.shuffle(this.arrayWordAll);
            } else {
               this.arrayWordAll = Article.CET4.getWordsArray()
            }
            let tempArrayWordAll = this.arrayWordAll.map(item => {
               return item.word + '\t' + item.translation
            });
            config.article = tempArrayWordAll.join('\t\t');
            let count = config.count === 'ALL' ? this.arrayWordAll.length : config.count;
            this.arrayWordDisplaying = this.arrayWordAll.slice(0, count); // 截取当前需要显示的数组段
            let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
               return item.word
            }); // 取到英文，数组
            this.currentWords = arrayCurrentWord.join(' ');
         } else if (config.articleType === ArticleType.character) {
            this.currentOriginWords = config.isShuffle ? Utility.shuffle(Article[config.articleIdentifier].content.split('')) : Article[config.articleIdentifier].content.split('');
            config.article = this.currentOriginWords.join('');
            this.currentWords = this.currentOriginWords.slice(0, Number(config.count)).join('');
         }

         config.chapter = 1;
         config.save(); // save config
         this.reset();
         this.updateInfo();
      }

      // 对比上屏字
      compare() {
         this.correctWordsCount = 0;
         let typedWords = typingPad.value;
         let arrayOrigin = this.currentWords.split('');
         let arrayTyped = typedWords.split('');
         let html = '';
         let lastCharacterIsCorrect = false; // 上一个字符是正确的
         let wordsCorrect = '';
         let wordsWrong = '';
         let tempCharacterLength = 0; // 单字或汉字文章时，未上屏结尾英文的长度
         /**
          * 对与错的词成块化，
          * 如果上一个字跟当前字的对错一致，追加该字到对应字符串，
          * 如果不是，输出相反字符串
          */
         arrayTyped.forEach((current, index) => {
            let origin = arrayOrigin[index];
            origin = origin ? origin : ' '; // 当输入编码多于原字符串时，可能会出现 undefined 字符，这个用于消除它
            let currentCharacterIsCorrect = current === origin;
            let currentCharacterIsEnglish = /[a-zA-Z]/i.test(current);

            // 英文或单词时
            if (config.articleType === ArticleType.word || config.articleType === ArticleType.english) {
               if (currentCharacterIsCorrect) {
                  this.correctWordsCount++;
                  wordsCorrect = wordsCorrect.concat(origin);
               } else {
                  wordsWrong = wordsWrong.concat(origin);
               }
            } else {
               // 汉字内容时
               if (currentCharacterIsCorrect) {
                  this.correctWordsCount++;
                  wordsCorrect = wordsCorrect.concat(origin);
               } else if (currentCharacterIsEnglish) { // 错误且是英文时，隐藏不显示
                  tempCharacterLength++
               } else { // 错字时显示红色
                  wordsWrong = wordsWrong.concat(origin);
               }
            }

            if (wordsCorrect && !lastCharacterIsCorrect && index) {
               html = html.concat(`<span class="wrong">${wordsWrong}</span>`);
               wordsWrong = '';
            } else if (wordsWrong && lastCharacterIsCorrect && index) {
               html = html.concat(`<span class="correct">${wordsCorrect}</span>`);
               wordsCorrect = '';
            }
            if ((index + 1) === typedWords.length) {
               if (wordsCorrect) {
                  html = html.concat(`<span class="correct">${wordsCorrect}</span>`);
               } else {
                  html = html.concat(`<span class="wrong">${wordsWrong}</span>`);
               }
            }
            lastCharacterIsCorrect = current === origin;
         });
         let untypedString = this.currentWords.substring(arrayTyped.length - tempCharacterLength)
         let untypedHtml = `<span class='${untypedStringClassName}'>${untypedString}</span>`;
         html = html.concat(untypedHtml)
         template.innerHTML = html;

         // 滚动对照区到当前所输入的位置
         let offsetTop = $('.' + untypedStringClassName).offsetTop;
         templateWrapper.scrollTo(0, offsetTop - HEIGHT_TEMPLATE / 2);


         if (config.articleType === ArticleType.word) {
            // 获取单词释义
            this.getCurrentCETWordTranslation(arrayTyped.length);
         }
      }

      getCurrentCETWordTranslation(length) {
         let tempString = '';
         this.arrayWordDisplaying.forEach(item => {
            let afterString = tempString + item.word + ' ';
            if (length < afterString.length && length > tempString.length) {
               let after = $('.untyped-part');
               let translationPanel = document.createElement('div');
               translationPanel.innerText = item.translation
               translationPanel.classList.add('translation-panel');
               after.appendChild(translationPanel);
            }
            tempString = afterString;
         })
      }

      englishModeEnter() {
         typingPad.classList.add('english');
         template.classList.add('english');
         config.isInEnglishMode = true;
         config.save();
      }

      englishModeLeave() {
         typingPad.classList.remove('english');
         template.classList.remove('english');
         config.isInEnglishMode = false;
         config.save();
      }

      delete(id, sender) {
         database.delete(id, sender)
      }

      // 清除记录
      clear(sender) {
         if (sender.innerText !== '确定清除') {
            sender.innerText = '确定清除';
            sender.classList.add('danger');
         } else {
            database.clear(config)
         }
      }


      // 更新时间
      showTime() {
         if (this.isStarted) {
            let secondAll = this.duration / 1000;
            let minute = Math.floor(secondAll / 60);
            let second = Math.floor(secondAll % 60);
            $('.minute').innerText = minute >= 10 ? minute : `0${minute}`;
            $('.btn-minute').innerText = minute >= 10 ? minute : `0${minute}`;
            $('.second').innerText = second >= 10 ? second : `0${second}`;
            $('.btn-second').innerText = second >= 10 ? second : `0${second}`;
         } else {
            $('.minute').innerText = '00';
            $('.btn-minute').innerText = '00';
            $('.second').innerText = '00';
            $('.btn-second').innerText = '00';
         }
      }

      // 暂停
      pause() {
         this.isPaused = true;
         typingPad.blur();
         this.stopRefresh()
      }

      // 继续
      resume() {
         this.timeStart = (new Date()).getTime() - this.duration;
         this.isPaused = false;
         this.startRefresh();
      }

      // 乱序当前段
      shuffleCurrent() {
         // TODO: 英文单词时，乱序当前词组
         if (config.articleType !== ArticleType.english && config.articleType !== ArticleType.word) {
            let array = this.currentWords.split('');
            this.currentWords = Utility.shuffle(array).join('');
            template.innerText = this.currentWords;
            this.reset();
            // TODO: 优化处理界面数据刷新的功能
            this.isFinished = false;
            this.updateInfo();
         }
      }

      // 重置计数器
      reset() {
         record = new Record();
         template.innerHTML = this.currentWords;
         this.isPaused = false;
         this.isStarted = false;
         this.isFinished = false;
         typingPad.value = '';
         keyCount.reset();
         this.updateInfo();
         this.stopRefresh();
         this.showTime();
         templateWrapper.scrollTo(0, 0);
      }

      // 当前段打完
      finish() {
         this.isStarted = false;
         this.isFinished = true;
         this.stopRefresh();
         this.timeEnd = (new Date()).getTime();
         this.duration = this.timeEnd - this.timeStart;
         // update record
         record.backspace = keyCount.backspace;
         record.timeStart = this.timeStart;
         record.duration = this.duration;
         record.wordCount = this.currentWords.length;
         database.insert(record, config);
         if (config.isAutoNext){ // 自动发文
            if (config.isAutoRepeat){ // 重复发文
               if (config.repeatCountTotal > config.repeatCountCurrent){ // 还有重复次数
                  if (config.isShuffleRepeat){ // 需要重复时乱序
                     this.shuffleCurrent();
                  } else {
                     this.reset()
                  }
                  config.repeatCountCurrent++;
               } else {
                  config.repeatCountCurrent = 1;
                  this.nextChapter()
               }
            } else {
               config.repeatCountCurrent = 1;
               this.nextChapter();
            }
         }
         this.updateInfo();
      }

      // 更新界面信息
      updateInfo() {
         // COLOR
         if (this.isStarted && !this.isPaused) {
            $('.time').classList.add('text-green');
         } else {
            $('.time').classList.remove('text-green');
         }

         // KEY COUNT
         for (let type in keyCount) {
            $(`.word-${type} p`).innerText = keyCount[type];
         }
         $('.count-total').innerText = this.currentWords.length;
         $('.count-current').innerText = typingPad.value.length;

         // 更新当前重复次数
         $('#repeatCountCurrent').innerText = config.repeatCountCurrent

         // SPEED
         if (!this.isStarted && !this.isFinished) {
            $('.speed').innerText = '--';
            $('.btn-speed').innerText = '--';
            $('.count-key-rate').innerText = '--';
            $('.count-key-length').innerText = '--';
            $('.count-key-backspace').innerText = '--';

         } else {
            // speed
            record.speed = (this.correctWordsCount / this.duration * 1000 * 60).toFixed(2);
            $('.speed').innerText = record.speed;
            $('.btn-speed').innerText = record.speed;

            // key count
            let allKeyCount = keyCount.all - keyCount.function;
            record.hitRate = (allKeyCount / this.duration * 1000).toFixed(2);
            $('.count-key-rate').innerText = record.hitRate;

            // code length
            if (this.correctWordsCount) {
               record.codeLength = (allKeyCount / this.correctWordsCount).toFixed(2);
            } else {
               record.codeLength = 0;
            }
            $('.count-key-length').innerText = record.codeLength;

            // backspace count
            $('.count-key-backspace').innerText = keyCount.backspace;
         }

         // OPTION
         $('.chapter-current').innerText = config.chapter;
         $('.chapter-total').innerText = config.chapterTotal;
      }
   }

   function shakeBtn(btn){
      let animateClass = 'shake';
      btn.classList.add(animateClass);
      setTimeout(()=>{
         btn.classList.remove(animateClass)
      }, 250)
   }

   return Engine
})