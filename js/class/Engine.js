define(['Reg','ArticleType','Article', 'Config', 'Record', 'Database', 'KeyCount', 'Utility', 'Editor', 'Result', 'ResultType'], function (
   Reg,
   ArticleType,
   Article,
   Config,
   Record,
   Database,
   KeyCount,
   Utility,
   Editor,
   Result,
   ResultType
) {
   const untypedStringClassName = 'untyped-part';
   const HEIGHT_TEMPLATE = 150; // 对照区高度

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
         this.currentWords = '';       // 显示的当前分段对照文字
         this.currentOriginWords = [];       // 原始对照文字拆分的全部数组
         this.arrayWordAll = [];       // 全部单词
         this.arrayWordDisplaying = [];       // 展示的单词
         this.config = new Config();
         this.record = new Record();
         this.keyCount = new KeyCount();
         this.database = new Database();


         // 按键过滤器
         /****
          **** ⌘ + Y F3: 重打当前段
          **** ⌘ + K F4: 打乱当前段
          **** ⌘ + U F1: 上一段
          **** ⌘ + J F2: 下一段
          ****/
         typingPad.onkeydown = e => {
            if (e.key === 'Tab' || ((e.metaKey || e.ctrlKey) && (/[nqwefgplt]/.test(e.key)))) {
               // 消除一些默认浏览器快捷键的效果
               e.preventDefault();
            } else if (((e.metaKey || e.ctrlKey) && e.key === 'y') || e.key === 'F3') {
               e.preventDefault();
               this.reset();
            } else if (((e.metaKey || e.ctrlKey) && e.key === 'k') || e.key === 'F4') {
               e.preventDefault();
               this.shuffleCurrent();
            } else if (((e.metaKey || e.ctrlKey) && e.key === 'u') || e.key === 'F1') {
               this.prevChapter();
               e.preventDefault();
            } else if (((e.metaKey || e.ctrlKey) && e.key === 'j') || e.key === 'F2') {
               this.nextChapter();
               e.preventDefault();
            } else if (e.key === 'Escape') {
               this.pause();
               e.preventDefault();
            } else if (Reg.KEYS.az.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey && !this.isStarted && !this.isFinished) {
               this.start()
            }
         }
         typingPad.onkeyup = e => {
            e.preventDefault();
            if (!this.isFinished && this.isStarted) {
               this.keyCount.countKeys(e);
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
         $('input[type=checkbox]#shuffleMode').checked = this.config.isShuffle;
         $('input[type=checkbox]#darkMode').checked = this.config.darkMode;
         $('input[type=checkbox]#autoNext').checked = this.config.isAutoNext;
         $('input[type=checkbox]#autoRepeat').checked = this.config.isAutoRepeat;
         $('input[type=checkbox]#shuffleRepeat').checked = this.config.isShuffleRepeat;
         $('input[type=checkbox]#bigCharacter').checked = this.config.isBigCharacter;
         let radioNodes = document.querySelectorAll('input[name=count][type=radio]');
         let radios = [...radioNodes];
         radios.forEach(item => {
            item.checked = item.value === this.config.count
         })
         $('select#article').value = this.config.articleIdentifier;

         // English Mode
         if (this.config.isInEnglishMode) {
            this.englishModeEnter()
         }

         // Repeat Status
         this.setRepeatStatus(this.config);

         // Dark Mode
         let body = $('body');
         if (this.config.darkMode) {
            body.classList.add('black');
         } else {
            body.classList.remove('black');
         }

         // Big Character Mode
         this.config.isBigCharacter ? enterBigCharacterMode() : leaveBigCharacterMode();

         // Repeat Monitor
         $('#repeatCountTotal').innerText = this.config.repeatCountTotal
         $('#repeatCountCurrent').innerText = this.config.repeatCountCurrent

         this.currentOriginWords = this.config.article.split('');
         if (this.config.articleType === ArticleType.word) {
            // CET 时
            this.arrayWordAll = Article.CET4.getWordsArray();
            this.arrayWordDisplaying = this.arrayWordAll.slice(Number(this.config.count) * (this.config.chapter - 1), Number(this.config.count) * (this.config.chapter)); // 截取当前需要显示的数组段
            let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
               return item.word
            }); // 取到英文，数组
            this.currentWords = arrayCurrentWord.join(' ');
         } else {
            // 其它时
            if(this.config.count === 'ALL'){
               this.currentWords = this.currentOriginWords.join('');
            } else {
               this.currentWords = this.currentOriginWords.slice(Number(this.config.count) * (this.config.chapter - 1), Number(this.config.count) * (this.config.chapter)).join('');
            }
         }
         template.innerText = this.currentWords;
      }

      fetchAllLog(){
         this.database.fetchAll();
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
         if (this.config.chapter !== 1) {
            if (this.config.articleType === ArticleType.word) {
               this.arrayWordDisplaying = this.arrayWordAll.slice(this.config.count * (this.config.chapter - 2), this.config.count * (this.config.chapter - 1)); // 截取当前需要显示的数组段
               let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
                  return item.word
               }); // 取到英文，数组
               this.currentWords = arrayCurrentWord.join(' ');
            } else {
               this.currentWords = this.currentOriginWords.slice(this.config.count * (this.config.chapter - 2), this.config.count * (this.config.chapter - 1)).join('');
            }
            this.config.repeatCountCurrent = 1;
            this.config.chapter--;
            this.reset();
            this.config.save();
         } else {
            console.log('retch chapter top')
            let chapterBtn = $('#totalChapter');
            Utility.shakeDom(chapterBtn)
         }
      }

      // 下一段
      nextChapter() {
         if (this.config.chapter !== this.config.chapterTotal) {
            if (this.config.articleType === ArticleType.word) {
               this.arrayWordDisplaying = this.arrayWordAll.slice(this.config.count * this.config.chapter, this.config.count * (this.config.chapter + 1)); // 截取当前需要显示的数组段
               let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
                  return item.word
               }); // 取到英文，数组
               this.currentWords = arrayCurrentWord.join(' ');
            } else {
               this.currentWords = this.currentOriginWords.slice(this.config.count * this.config.chapter, this.config.count * (this.config.chapter + 1)).join('');
            }
            this.config.repeatCountCurrent = 1;
            this.config.chapter++;
            this.reset();
            this.config.save();
         } else {
            console.log('retch chapter bottom')
            let chapterBtn = $('#totalChapter');
            Utility.shakeDom(chapterBtn)
         }
      }

      // 自定义文章
      customizeArticle(){
         $('#app').style.overflow = 'hidden'

      }

      // 载入文章列表选项
      loadArticleOptions() {
         let optionHtml = '';
         for (let itemName in Article) {
            let article = Article[itemName];
            let tempHtml = '';
            if (article.type === ArticleType.customize){
               tempHtml = `<option value="${itemName}">${ArticleType.getTypeNameWith(article.type)} - ${this.config.customizedTitle}</option>`
            } else {
               tempHtml = `<option value="${itemName}">${ArticleType.getTypeNameWith(article.type)} - ${article.name}</option>`
            }
            optionHtml += tempHtml;
         }
         $('#article').innerHTML = optionHtml;
      }


      // 改变文章内容
      changeArticle(editor) {
         let articleName = $('select#article').value;
         let article = Article[articleName];
         let lastConfig = { // 当编辑自定义文章，取消时使用
            articleIdentifier: this.config.articleIdentifier,
            articleName: this.config.articleName,
            articleType: this.config.articleType,
         }
         this.config.articleIdentifier = articleName;
         this.config.articleName = article.name;
         this.config.articleType = article.type;
         switch (this.config.articleType) {
            case ArticleType.character:
               this.currentOriginWords = this.config.isShuffle ? Utility.shuffle(article.content.split('')) : article.content.split('');
               this.config.article = this.currentOriginWords.join('');
               this.englishModeLeave();
               break;
            case ArticleType.article:
               this.config.article = article.content;
               this.currentOriginWords = this.config.article.split('');
               this.englishModeLeave();
               break;
            case ArticleType.english:
               this.config.article = article.content;
               this.englishModeEnter();
               this.currentOriginWords = this.config.article.split('');
               break;
            case ArticleType.word:
               this.config.article = article.content;
               this.englishModeEnter();
               this.arrayWordAll = Article.CET4.getWordsArray();
               this.currentOriginWords = this.config.article.split('');
               break;
            case ArticleType.customize:
               if (!this.config.customizedContent){
                  this.config.articleIdentifier = lastConfig.articleIdentifier;
                  this.config.articleName = lastConfig.articleName;
                  this.config.articleType = lastConfig.articleType;
                  editor.show(this.config);
               } else {
                  this.config.article = this.config.customizedContent;
                  this.currentOriginWords = this.config.article.split('');
                  this.config.articleName = this.config.customizedTitle;
                  this.englishModeLeave();
               }
               break;
            default:
               break;
         }
         this.config.save();
         this.applyConfig();
         this.changePerCount();
      }

      // 改变重复次数
      changeRepeatCount(){

      }

      // 改变数字时
      changePerCount() {
         let originTol = 0;
         this.config.count = $('input[type=radio]:checked').value;
         if (this.config.articleType === ArticleType.word) { // CET 单词模式时，count 为单词数
            let count = this.config.count === 'ALL' ? this.arrayWordAll.length : this.config.count;
            this.arrayWordDisplaying = this.arrayWordAll.slice(0, count); // 截取当前需要显示的数组段
            let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
               return item.word
            }); // 取到英文，数组
            this.currentWords = arrayCurrentWord.join(' ');
            originTol = this.arrayWordAll.length / Number(this.config.count);
         } else {
            if (this.config.count === 'ALL') {
               this.currentWords = this.currentOriginWords.join('');
            } else {
               this.currentWords = this.currentOriginWords.slice(0, Number(this.config.count)).join('');
            }
            originTol = this.currentOriginWords.length / Number(this.config.count);
         }
         this.config.chapter = 1;
         let tempTol = Math.floor(originTol);
         if (this.config.count === 'ALL') {
            this.config.chapterTotal = 1
         } else {
            this.config.chapterTotal = originTol > tempTol ? tempTol + 1 : tempTol;
         }

         this.config.save(); // save this.config
         this.reset();
         this.updateInfo();
      }

      // 进入暗黑模式
      enterDarkMode() {
         let body = $('body');
         if (this.config.darkMode) {
            body.classList.remove('black');
            this.config.darkMode = false;
            this.config.save();
         } else {
            body.classList.add('black');
            this.config.darkMode = true;
            this.config.save();
         }
      }

      // 自动发文
      autoNext(){
         this.config.isAutoNext = $('#autoNext').checked;
         this.config.save();
      }

      // 重复发文
      autoRepeat(){
         this.config.isAutoRepeat = $('#autoRepeat').checked;
         this.config.save();
         this.setRepeatStatus(this.config);
      }

      // 重复发文时乱序
      shuffleRepeat(){
         this.config.isShuffleRepeat = $('#shuffleRepeat').checked;
         this.config.save();
      }

      // 大单字练习时
      bigCharacter(){
         this.config.isBigCharacter = $('#bigCharacter').checked;
         this.config.isBigCharacter ? enterBigCharacterMode() : leaveBigCharacterMode();
         this.config.save();
      }

      // 更新重复状态
      setRepeatStatus(config){
         if (config.isAutoRepeat){
            $('#panelRepeatController').classList.remove('hidden');
            $('#panelRepeatShuffle').classList.remove('hidden');
         } else {
            $('#panelRepeatController').classList.add('hidden');
            $('#panelRepeatShuffle').classList.add('hidden');
         }
      }

      // 重复次数 +
      repeatCountAdd(){
         this.config.repeatCountTotal++;
         $('#repeatCountTotal').innerText = this.config.repeatCountTotal;
         this.config.save()
      }
      // 重复次数 -
      repeatCountMinus(){
         if (this.config.repeatCountTotal > 1){
            this.config.repeatCountTotal--;
            $('#repeatCountTotal').innerText = this.config.repeatCountTotal;
            this.config.save()
         } else {
            console.log('can not lower than 1')
            let btn = $('#repeatMonitor')
            Utility.shakeDom(btn)
         }
      }

      // 切换乱序模式
      shuffleCurrentArticle() {
         this.config.isShuffle = $('#shuffleMode').checked;
         if (this.config.articleType === ArticleType.word) {
            if (this.config.isShuffle) {
               this.arrayWordAll = Utility.shuffle(this.arrayWordAll);
            } else {
               this.arrayWordAll = Article.CET4.getWordsArray()
            }
            let tempArrayWordAll = this.arrayWordAll.map(item => {
               return item.word + '\t' + item.translation
            });
            this.config.article = tempArrayWordAll.join('\t\t');
            let count = this.config.count === 'ALL' ? this.arrayWordAll.length : this.config.count;
            this.arrayWordDisplaying = this.arrayWordAll.slice(0, count); // 截取当前需要显示的数组段
            let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
               return item.word
            }); // 取到英文，数组
            this.currentWords = arrayCurrentWord.join(' ');
         } else if (this.config.articleType === ArticleType.character) {
            this.currentOriginWords = this.config.isShuffle ? Utility.shuffle(Article[this.config.articleIdentifier].content.split('')) : Article[this.config.articleIdentifier].content.split('');
            this.config.article = this.currentOriginWords.join('');
            this.currentWords = this.currentOriginWords.slice(0, Number(this.config.count)).join('');
         }

         this.config.chapter = 1;
         this.config.save(); // save this.config
         this.reset();
         this.updateInfo();
      }

      // 对比上屏字，主要对比算法 IMPORTANT!
      compare() {
         this.correctWordsCount = 0;
         let typedWords = typingPad.value;
         let arrayOrigin = this.currentWords.split('');
         let arrayTyped = typedWords.split('');
         let html = '';
         let wordsCorrect = '';
         let wordsWrong = '';
         let tempCharacterLength = 0; // 单字或汉字文章时，未上屏结尾英文的长度

         let result = []
         result.push({type: ResultType.correct, words: '', start: 0})
         /**
          * 对与错的词成块化，
          * 如果上一个字跟当前字的对错一致，追加该字到对应字符串，
          * 如果不是，输出相反字符串
          */
         for(let index=0; index<arrayTyped.length; index++){
            const currentCharacter = arrayTyped[index]
            let originCharacter = arrayOrigin[index]
            originCharacter = originCharacter ? originCharacter : ' '; // 当输入编码多于原字符串时，可能会出现 undefined 字符，这个用于消除它
            let currentCharacterIsCorrect = currentCharacter === originCharacter;
            let currentCharacterIsEnglish = /[a-zA-Z]/i.test(currentCharacter);
            // 筛选每个字
            if (this.config.articleType === ArticleType.word || this.config.articleType === ArticleType.english) {  // 英文或单词时
               if (currentCharacterIsCorrect) {
                  this.correctWordsCount++;
                  wordsCorrect = wordsCorrect + originCharacter
               } else {
                  wordsWrong = wordsWrong + originCharacter
               }
            } else { // 汉字内容时
               let lastResult = result[result.length - 1]
               if (currentCharacterIsCorrect) {
                  this.correctWordsCount++;
                  // 如果最后一个结果是正确的，添加当前字符，如果不是新增一个结果集
                  if (lastResult.type === ResultType.correct){
                     lastResult.words = lastResult.words + currentCharacter
                  } else {
                     result.push({
                        type: ResultType.correct,
                        words: currentCharacter,
                        start: index
                     })
                  }
                  tempCharacterLength = 0 // 清零前方记录的临时英文编码
               } else if (currentCharacterIsEnglish) { // 错误且是英文时，隐藏不显示
                  tempCharacterLength++
                  if (lastResult.type === ResultType.pending){
                     lastResult.words = lastResult.words + currentCharacter
                  } else {
                     result.push({
                        type: ResultType.pending,
                        words: currentCharacter,
                        start: index
                     })
                  }
               } else { // 错字时显示红色
                  if (lastResult.type === ResultType.wrong){
                     lastResult.words = lastResult.words + currentCharacter
                  } else {
                     result.push({
                        type: ResultType.wrong,
                        words: currentCharacter,
                        start: index
                     })
                  }
                  tempCharacterLength = 0
               }
            }
         }

         // show result
         result.forEach((item, index) => {
            switch (item.type){
               case ResultType.correct:
                  html = html + `<span class="correct">${item.words}</span>`
                  break;
               case ResultType.wrong:
                  let originWords = arrayOrigin.slice(item.start, item.words.length + item.start).join('')
                  html = html + `<span class="wrong">${originWords}</span>`
                  break;
               case ResultType.pending:
                  if(index < result.length - 1){ // pending 不在最后一个，中间的 pending 都是错误的
                     // 根据 startIndex 来定位在原始文章中的位置
                     let originWords = arrayOrigin.slice(item.start, item.words.length + item.start).join('')
                     html = html + `<span class="wrong">${originWords}</span>`
                  }
                  break;
            }
         })

         let theLastResult = result[result.length - 1]
         let logLength = theLastResult.start + theLastResult.words.length // 已上屏记录的长度

         let untypedString = this.currentWords.substring(logLength - tempCharacterLength)
         let untypedHtml = `<span class='${untypedStringClassName}'>${untypedString}</span>`;
         html = html + untypedHtml
         template.innerHTML = html;

         // 滚动对照区到当前所输入的位置
         let offsetTop = $('.' + untypedStringClassName).offsetTop;
         templateWrapper.scrollTo(0, offsetTop - HEIGHT_TEMPLATE / 2);


         if (this.config.articleType === ArticleType.word) {
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
         this.config.isInEnglishMode = true;
         this.config.save();
      }

      englishModeLeave() {
         typingPad.classList.remove('english');
         template.classList.remove('english');
         this.config.isInEnglishMode = false;
         this.config.save();
      }

      delete(id, sender) {
         this.database.delete(id, sender)
      }

      // 清除记录
      clear(sender) {
         if (sender.innerText !== '确定清除') {
            sender.innerText = '确定清除';
            sender.classList.add('danger');
         } else {
            this.database.clear(this.config)
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
            $('.minute').innerText     = '00';
            $('.btn-minute').innerText = '00';
            $('.second').innerText     = '00';
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
         switch (this.config.articleType){
            case ArticleType.character:
            case ArticleType.article:
            case ArticleType.customize:
               let array = this.currentWords.split('');
               this.currentWords = Utility.shuffle(array).join('');
               template.innerText = this.currentWords;
               this.reset();
               break
            case ArticleType.english:
               this.reset();
               break
            case ArticleType.word: // 英文单词时，乱序当前词组
               this.arrayWordDisplaying =Utility.shuffle(this.arrayWordDisplaying);
               let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
                  return item.word
               });
               this.currentWords = arrayCurrentWord.join(' ');
               this.reset();
               this.config.save();
               break
            default: break;
         }
      }

      // 重置计数器
      reset() {
         this.record = new Record();
         template.innerHTML = this.currentWords;
         this.isPaused = false;
         this.isStarted = false;
         this.isFinished = false;
         typingPad.value = '';
         this.keyCount.reset();
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
         this.record.backspace = this.keyCount.backspace;
         this.record.timeStart = this.timeStart;
         this.record.duration = this.duration;
         this.record.wordCount = this.currentWords.length;
         this.record.speed = (this.correctWordsCount / this.duration * 1000 * 60).toFixed(2);
         this.database.insert(this.record, this.config);
         if (this.config.isAutoNext){ // 自动发文
            if (this.config.isAutoRepeat){ // 重复发文
               if (this.config.repeatCountTotal > this.config.repeatCountCurrent){ // 还有重复次数
                  if (this.config.isShuffleRepeat){ // 需要重复时乱序
                     this.shuffleCurrent();
                  } else {
                     this.reset()
                  }
                  this.config.repeatCountCurrent++;
               } else {
                  this.config.repeatCountCurrent = 1;
                  this.nextChapter()
               }
            } else {
               this.config.repeatCountCurrent = 1;
               this.nextChapter();
            }
         }
         this.updateInfo();
      }

      // 更新界面信息
      updateInfo() {
         // COLOR 计时器颜色
         if (this.isStarted && !this.isPaused) {
            $('.time').classList.add('text-black');
         } else {
            $('.time').classList.remove('text-black');
         }

         // KEY COUNT
         for (let type in this.keyCount) {
            $(`.word-${type} p`).innerText = this.keyCount[type];
         }
         $('.count-total').innerText = this.currentWords.length;
         $('.count-current').innerText = typingPad.value.length;

         // 更新当前重复次数
         $('#repeatCountCurrent').innerText = this.config.repeatCountCurrent

         // SPEED
         if (!this.isStarted && !this.isFinished) {
            $('.speed').innerText               = '--';
            $('.btn-speed').innerText           = '--';
            $('.count-key-rate').innerText      = '--';
            $('.count-key-length').innerText    = '--';
            $('.count-key-backspace').innerText = '--';
         } else {
            this.record.speed = (this.correctWordsCount / this.duration * 1000 * 60).toFixed(2);
            $('.speed').innerText = this.record.speed;
            $('.btn-speed').innerText = this.record.speed;

            // key count
            let allKeyCount = this.keyCount.all - this.keyCount.function;
            this.record.hitRate = (allKeyCount / this.duration * 1000).toFixed(2);
            $('.count-key-rate').innerText = this.record.hitRate;

            // code length
            if (this.correctWordsCount) {
               this.record.codeLength = (allKeyCount / this.correctWordsCount).toFixed(2);
            } else {
               this.record.codeLength = 0;
            }
            $('.count-key-length').innerText = this.record.codeLength;

            // backspace count
            $('.count-key-backspace').innerText = this.keyCount.backspace;
         }

         // OPTION
         $('.chapter-current').innerText = this.config.chapter;
         $('.chapter-total').innerText = this.config.chapterTotal;
      }
   }

   function enterBigCharacterMode(){
      $('.text').classList.add('big')
      $('.template').classList.add('big')
      $('#pad').classList.add('big')
   }

   function leaveBigCharacterMode(){
      $('.text').classList.remove('big')
      $('.template').classList.remove('big')
      $('#pad').classList.remove('big')
   }

   return Engine
})
