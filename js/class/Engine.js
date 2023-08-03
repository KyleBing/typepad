define(
    [
       'Reg',
       'ArticleType',
       'Article',
       'Config',
       'Record',
       'Database',
       'KeyCount',
       'Utility',
       'Editor',
       'Result',
       'ResultType',
       'Score'
    ],
    function (
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
        ResultType,
        Score
    ) {
       const untypedStringClassName = 'untyped-part';
       const HEIGHT_TEMPLATE = 150; // 对照区高度
       const HEIGHT_BAR = 50; // 成绩图表的柱状图高度

   /**
    * 跟打器内核
    */
   class Engine {
      constructor() {
         this.isFinished = false; // 是否结束
         this.isStarted = false;  // 是否已开始
         this.isPaused = false;   // 是否暂停
         this.timeStart;          // ms
         this.timeEnd;            // ms
         this.duration = 0;       // ms
         this.handleRefresh;
         this.refreshRate = 500;  // ms


         this.correctWordsCount = 0;

         this.currentWords = '';        // 显示的当前分段对照文字
         this.currentOriginWords = [];  // 原始对照文字拆分的全部数组
         this.arrayWordAll = [];        // 全部单词
         this.arrayWordDisplaying = []; // 展示的单词

         this.config   = new Config();
         this.record   = new Record();
         this.keyCount = new KeyCount();
         this.database = new Database();
         this.score    = new Score();


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
                     this.keyCount.plusOne() // 最终结束的时候，上屏的那个按钮是无法被记录到 keyCount 中的，所以需要手动 +1
                     this.finish();
                  }
               }
            } else if (!this.isFinished) {
               this.start()
            }
         }
      }

      // 进入极简模式
      enterStandAloneMode(){
         let screenHeight = innerHeight
         $('.type-pad').classList.add('type-pad-standalone')
         // document.documentElement.requestFullscreen()
      }
      leaveStandAloneMode(){
         $('.type-pad-standalone').classList.remove('type-pad-standalone')
      }

      applyConfig(){
         // 根据当前配置文件设置内容
         $('input[type=checkbox]#shuffleMode').checked = this.config.isShuffle;
         $('input[type=checkbox]#darkMode').checked = this.config.darkMode;
         $('input[type=checkbox]#autoNext').checked = this.config.isAutoNext;
         $('input[type=checkbox]#autoRepeat').checked = this.config.isAutoRepeat;
         $('input[type=checkbox]#shuffleRepeat').checked = this.config.isShuffleRepeat;
         $('input[type=checkbox]#bigCharacter').checked = this.config.isBigCharacter;
         $('input[type=checkbox]#historyListMode').checked = this.config.isHistoryInListMode;
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

         // History Mode: LIST | TABLE
         if (this.config.isHistoryInListMode){
            $('.record-container').classList.remove('hidden')
            $('.table-container').classList.add('hidden')
         } else {
            $('.table-container').classList.remove('hidden')
            $('.record-container').classList.add('hidden')
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
         $('#repeatCountTotal').innerText = this.config.repeatCountTotal == Number.MAX_VALUE ? '∞' : this.config.repeatCountTotal
         $('#repeatCountCurrent').innerText = this.config.repeatCountCurrent

         this.currentOriginWords = this.config.article.split('');


         if  // 1. ArticleType.word 时
         (this.config.articleType === ArticleType.word) {
            this.arrayWordAll = Article[this.config.articleIdentifier || 'CET4'].getWordsArray();
            if(this.config.count === 'ALL'){
               this.arrayWordDisplaying = this.arrayWordAll
            } else {
               this.arrayWordDisplaying = this.arrayWordAll.slice(Number(this.config.count) * (this.config.chapter - 1), Number(this.config.count) * (this.config.chapter)); // 截取当前需要显示的数组段
            }
            let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
               return item.word
            }); // 取到英文，数组
            this.currentWords = arrayCurrentWord.join(' ');
         } else // 2. ArticleType.phrase 时
            if (this.config.articleType === ArticleType.phrase) {
               this.arrayWordAll = Article[this.config.articleIdentifier].getPhraseArray();
               if(this.config.count === 'ALL'){
                  this.arrayWordDisplaying = this.arrayWordAll
               } else {
                  this.arrayWordDisplaying = this.arrayWordAll.slice(Number(this.config.count) * (this.config.chapter - 1), Number(this.config.count) * (this.config.chapter)); // 截取当前需要显示的数组段
               }
               this.currentWords = this.arrayWordDisplaying.join(' ');
         } else // 3.其它时
         {
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
            if (this.config.articleType === ArticleType.word)  // 1. ArticleType.word
            {
               this.arrayWordDisplaying = this.arrayWordAll.slice(this.config.count * (this.config.chapter - 2), this.config.count * (this.config.chapter - 1)); // 截取当前需要显示的数组段
               let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
                  return item.word
               }); // 取到英文，数组
               this.currentWords = arrayCurrentWord.join(' ');
            } else if (this.config.articleType === ArticleType.phrase) // 2. ArticleType.phrase
            {
               this.arrayWordDisplaying = this.arrayWordAll.slice(this.config.count * (this.config.chapter - 2), this.config.count * (this.config.chapter - 1)); // 截取当前需要显示的数组段
               this.currentWords = this.arrayWordDisplaying.join(' ');
            } else  // 3. ArticleType.others
            {
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
            if (this.config.articleType === ArticleType.word) // 1. ArticleType.word
            {
               this.arrayWordDisplaying = this.arrayWordAll.slice(this.config.count * this.config.chapter, this.config.count * (this.config.chapter + 1)); // 截取当前需要显示的数组段
               let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
                  return item.word
               }); // 取到英文，数组
               this.currentWords = arrayCurrentWord.join(' ');
            }  else if (this.config.articleType === ArticleType.phrase) // 2. ArticleType.phrase
            {
               this.arrayWordDisplaying = this.arrayWordAll.slice(this.config.count * this.config.chapter, this.config.count * (this.config.chapter + 1)); // 截取当前需要显示的数组段
               this.currentWords = this.arrayWordDisplaying.join(' ');
            } else // 3. ArticleType.word
            {
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
         let optionHtml = ''; // 插入的 option dom html []

         // 根据 ArticleType 中的分类，细分 Article 到 {word:[Article], english:[Article], article:[Article]...}
         let sortedArticles = {}
         let articleArray = Object.entries(Article).map(item => item[1])  // 从 [... [ArticleType: Article]] 筛选出 [Article, Article]

         for(const [key, entity]  of Object.entries(ArticleType)){
            if (typeof entity !== 'function'){ // 除去 function 对象
               sortedArticles[key] = articleArray.filter(item => item.type === key)
            }
         }
         // console.log(sortedArticles)

         for(const [articleTypeName, articleArray]  of Object.entries(sortedArticles)){
            let tempOptionHtml = ''
            let groupName = ArticleType.getTypeNameWith(articleTypeName)
            articleArray.forEach(item => {
               switch (articleTypeName) {
                  case ArticleType.customize:
                     tempOptionHtml += `<option value="${item.value}">${this.config.customizedTitle || '未定义'}</option>`
                       break
                  case ArticleType.word:
                     tempOptionHtml += `<option value="${item.value}">${item.name} - ${item.getWordsArray().length}词</option>`
                       break
                  default:
                     tempOptionHtml += `<option value="${item.value}">${item.name}</option>`
                       break
               }
            })
            optionHtml += `<optgroup label="${groupName}">${tempOptionHtml}</optgroup>`
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
            case ArticleType.phrase:
               this.config.article = article.content;
               this.arrayWordAll = article.getPhraseArray();
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
               this.arrayWordAll = article.getWordsArray();
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

      // 改变每段跟打数量
      changePerCount() {
         let originTol = 0;
         this.config.count = $('input[type=radio]:checked').value;

         // CET 单词模式时，count 为单词数
         if (this.config.articleType === ArticleType.word) {
            let count = this.config.count === 'ALL' ? this.arrayWordAll.length : this.config.count;
            this.arrayWordDisplaying = this.arrayWordAll.slice(0, count); // 截取当前需要显示的数组段
            let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
               return item.word
            }); // 取到英文，数组
            this.currentWords = arrayCurrentWord.join(' ');
            originTol = this.arrayWordAll.length / Number(this.config.count);
         } else  // 为中文词条时， count 为单词数
            if (this.config.articleType === ArticleType.phrase){
               let count = this.config.count === 'ALL' ? this.arrayWordAll.length : this.config.count;
               this.arrayWordDisplaying = this.arrayWordAll.slice(0, count); // 截取当前需要显示的数组段
               this.currentWords = this.arrayWordDisplaying.join(' ');
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

      // 历史记录显示样式： list | table
      historyListMode(){
         this.config.isHistoryInListMode = $('#historyListMode').checked;
         if (this.config.isHistoryInListMode){
            $('.record-container').classList.remove('hidden')
            $('.table-container').classList.add('hidden')
         } else {
            $('.record-container').classList.add('hidden')
            $('.table-container').classList.remove('hidden')
         }
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
         if (this.config.repeatCountTotal != Number.MAX_VALUE) {
            this.config.repeatCountTotal++;
            $('#repeatCountTotal').innerText = this.config.repeatCountTotal;
            this.config.save()
         } else {
            console.log('cannot be greater than infinity')
            let btn = $('#repeatMonitor')
            Utility.shakeDom(btn)
         }
      }
      // 重复次数 -
      repeatCountMinus(){
         if (this.config.repeatCountTotal > 1 && this.config.repeatCountTotal != Number.MAX_VALUE){
            this.config.repeatCountTotal--;
            $('#repeatCountTotal').innerText = this.config.repeatCountTotal;
            this.config.save()
         } else {
            console.log('can not lower than 1 or infinite')
            let btn = $('#repeatMonitor')
            Utility.shakeDom(btn)
         }
      }
      // 不限重复次数
      repeatCountInfinity() {
         if (this.config.repeatCountTotal != Number.MAX_VALUE) {
            this.config.repeatCountTotal = Number.MAX_VALUE
            $('#repeatCountTotal').innerText = '∞';
         } else {
            this.config.repeatCountTotal = 1
            $('#repeatCountTotal').innerText = this.config.repeatCountTotal;
         }
         this.config.save()
      }

      // 切换全局内容乱序模式
      shuffleCurrentArticle() {
         this.config.isShuffle = $('#shuffleMode').checked;
         // 1. 单词模式时
         if (this.config.articleType === ArticleType.word)
         {
            if (this.config.isShuffle) {
               this.arrayWordAll = Utility.shuffle(this.arrayWordAll);
            } else {
               this.arrayWordAll = Article.CET4.getWordsArray()
            }
            let tempArrayWordAll = this.arrayWordAll.map(item => {
               return item.word + '\t' + item.translation
            });
            this.config.article = tempArrayWordAll.join('\t\t');

            // 当为全文时，this.config.count 非数字，而是 'All'，就需要处理一下
            let count = this.config.count === 'ALL' ? this.arrayWordAll.length : Number(this.config.count);
            this.arrayWordDisplaying = this.arrayWordAll.slice(0, count); // 截取当前需要显示的数组段
            let arrayCurrentWord = this.arrayWordDisplaying.map(item => {
               return item.word
            }); // 取到英文，数组
            this.currentWords = arrayCurrentWord.join(' ');
         }
         // 2. 汉字词组模式时
         else if (this.config.articleType === ArticleType.phrase)
         {
            if (this.config.isShuffle) {
               this.arrayWordAll = Utility.shuffle(this.arrayWordAll);
            } else {
               this.arrayWordAll = Article.phrase.getPhraseArray()
            }
            this.config.article = this.arrayWordAll.join(' ');

            // 当为全文时，this.config.count 非数字，而是 'All'，就需要处理一下
            let count = this.config.count === 'ALL' ? this.arrayWordAll.length : Number(this.config.count);
            this.arrayWordDisplaying = this.arrayWordAll.slice(0, count); // 截取当前需要显示的数组段
            this.currentWords = this.arrayWordDisplaying.join(' ');
         }
         // 3. 单字模式时
         else if (this.config.articleType === ArticleType.character)
         {
            this.currentOriginWords = this.config.isShuffle ?
                Utility.shuffle(Article[this.config.articleIdentifier].content.split('')) :
                Article[this.config.articleIdentifier].content.split('');
            this.config.article = this.currentOriginWords.join('');

            // 当为全文时，this.config.count 非数字，而是 'All'，就需要处理一下
            let count = this.config.count === 'ALL' ? this.currentOriginWords.length : Number(this.config.count);
            this.currentWords = this.currentOriginWords.slice(0, count).join('');
         }

         // 4. 文章模式没有全文乱序功能

         this.config.chapter = 1;
         this.config.save(); // save this.config
         this.reset();
         this.updateInfo();
      }

      // 对比上屏字，主要对比算法 IMPORTANT!
      compare() {
         this.correctWordsCount = 0;
         let typedWords = typingPad.value;
         let arrayOrigin = this.currentWords.split(''); // 对照区的字、字母
         let arrayTyped = typedWords.split('');         // 已打的字、字母
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
            let lastResult = result[result.length - 1]
            if (this.config.articleType === ArticleType.word || this.config.articleType === ArticleType.english) {  // 英文或单词时
               if (currentCharacterIsCorrect) {
                  this.correctWordsCount++;
                  if (lastResult.type === ResultType.correct){
                     lastResult.words = lastResult.words + currentCharacter
                  } else {
                     result.push({
                        type: ResultType.correct,
                        words: currentCharacter,
                        start: index
                     })
                  }
               } else {
                  if (lastResult.type === ResultType.wrong){
                     lastResult.words = lastResult.words + currentCharacter
                  } else {
                     result.push({
                        type: ResultType.wrong,
                        words: currentCharacter,
                        start: index
                     })
                  }               }
            } else { // 汉字内容时
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

      // 显示当前单词的释义
      getCurrentCETWordTranslation(length) {
         let tempString = '';
         this.arrayWordDisplaying.forEach(item => {
            let afterString = tempString + item.word + ' ';
            if (length < afterString.length && length > tempString.length) {
               let after = $('.untyped-part');
               let translationPanel = document.createElement('a');
               translationPanel.setAttribute('href', `https://www.youdao.com/result?word=${item.word}&lang=en`)
               translationPanel.setAttribute('target', '_blank')
               translationPanel.innerText = item.translation
               translationPanel.classList.add('translation-panel');
               after.appendChild(translationPanel);
            }
            tempString = afterString;
         })
      }

      // 英文模式：进入
      englishModeEnter() {
         typingPad.classList.add('english');
         template.classList.add('english');
         this.config.isInEnglishMode = true;
         this.config.save();
      }

      // 英文模式：离开
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
            // 前三个类型的重复时动作一致
            case ArticleType.character:
            case ArticleType.article:
            case ArticleType.customize:
               let array = this.currentWords.split('');
               this.currentWords = Utility.shuffle(array).join('');
               template.innerText = this.currentWords;
               this.reset();
               break
            case ArticleType.phrase:
               this.arrayWordDisplaying =Utility.shuffle(this.arrayWordDisplaying);
               this.currentWords = this.arrayWordDisplaying.join(' ');
               this.config.save();
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
               this.config.save();
               this.reset();
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
         this.record.codeLength = Number((this.keyCount.all / this.correctWordsCount).toFixed(2));
         this.record.speed = Number((this.correctWordsCount / this.duration * 1000 * 60).toFixed(2));

         // 保存记录
         // console.log(this.record, this.config)
         this.database.insert(this.record, this.config);

         //
         // 保存记录到 SCORE
         //

         this.score[this.config.articleType].wordCount += this.record.wordCount;
         this.score[this.config.articleType].keyCount += this.keyCount.all;
         this.score[this.config.articleType].timeCost += this.record.duration;
         // 击键 - 平均
         this.score[this.config.articleType].hitRateAve
             = this.score[this.config.articleType].keyCount / this.score[this.config.articleType].timeCost * 1000;
         // 击键 - 最小值
         if (this.score[this.config.articleType].hitRateMin === 0){
            this.score[this.config.articleType].hitRateMin = this.record.hitRate
         }
         if (this.score[this.config.articleType].hitRateMin > this.record.hitRate){
            this.score[this.config.articleType].hitRateMin = this.record.hitRate
         }
         if (this.score[this.config.articleType].hitRateMax < this.record.hitRate){
            this.score[this.config.articleType].hitRateMax = this.record.hitRate
         }
         // 码长 - 平均
         this.score[this.config.articleType].codeLengthAve
             = this.score[this.config.articleType].keyCount / this.score[this.config.articleType].wordCount;
         // 码长 - 最小值
         if (this.score[this.config.articleType].codeLengthMin === 0){
            this.score[this.config.articleType].codeLengthMin = this.record.codeLength
         }
         if (this.score[this.config.articleType].codeLengthMin > this.record.codeLength){
            this.score[this.config.articleType].codeLengthMin = this.record.codeLength
         }
         if (this.score[this.config.articleType].codeLengthMax < this.record.codeLength){
            this.score[this.config.articleType].codeLengthMax = this.record.codeLength
         }

         // 速度 - 平均
         this.score[this.config.articleType].speedAve
             = this.score[this.config.articleType].wordCount / this.score[this.config.articleType].timeCost * 1000 * 60;
         // 速度 - 最小值
         if (this.score[this.config.articleType].speedMin === 0){
            this.score[this.config.articleType].speedMin = this.record.speed
         }
         if (this.score[this.config.articleType].speedMin > this.record.speed){
            this.score[this.config.articleType].speedMin = this.record.speed
         }
         if (this.score[this.config.articleType].speedMax < this.record.speed){
            this.score[this.config.articleType].speedMax = this.record.speed
         }

         // HIT RATE FILTER
         if       (this.record.hitRate >= 0    && this.record.hitRate < 2    )  { this.score[this.config.articleType].hitRate1++}
         else if  (this.record.hitRate >= 2    && this.record.hitRate < 3    )  { this.score[this.config.articleType].hitRate2++}
         else if  (this.record.hitRate >= 3    && this.record.hitRate < 4    )  { this.score[this.config.articleType].hitRate3++}
         else if  (this.record.hitRate >= 4    && this.record.hitRate < 5    )  { this.score[this.config.articleType].hitRate4++}
         else if  (this.record.hitRate >= 5    && this.record.hitRate < 6    )  { this.score[this.config.articleType].hitRate5++}
         else if  (this.record.hitRate >= 6    && this.record.hitRate < 7    )  { this.score[this.config.articleType].hitRate6++}
         else if  (this.record.hitRate >= 7    && this.record.hitRate < 8    )  { this.score[this.config.articleType].hitRate7++}
         else if  (this.record.hitRate >= 8    && this.record.hitRate < 9    )  { this.score[this.config.articleType].hitRate8++}
         else if  (this.record.hitRate >= 9    && this.record.hitRate < 10   )  { this.score[this.config.articleType].hitRate9++}
         else if  (this.record.hitRate >= 10   && this.record.hitRate < 11   )  { this.score[this.config.articleType].hitRate10++}
         else if  (this.record.hitRate >= 11   && this.record.hitRate < 12   )  { this.score[this.config.articleType].hitRate11++}
         else if  (this.record.hitRate >= 12   && this.record.hitRate < 13   )  { this.score[this.config.articleType].hitRate12++}
         else if  (this.record.hitRate >= 13   && this.record.hitRate < 14   )  { this.score[this.config.articleType].hitRate13++}
         else if  (this.record.hitRate >= 14   && this.record.hitRate < 15   )  { this.score[this.config.articleType].hitRate14++}
         else if  (this.record.hitRate >= 15   && this.record.hitRate < 16   )  { this.score[this.config.articleType].hitRate15++}

         // CODE LENGTH FILTER
         if       (this.record.codeLength >= 0  && this.record.codeLength < 2  )  { this.score[this.config.articleType].codeLength1++}
         else if  (this.record.codeLength >= 2  && this.record.codeLength < 3  )  { this.score[this.config.articleType].codeLength2++}
         else if  (this.record.codeLength >= 3  && this.record.codeLength < 4  )  { this.score[this.config.articleType].codeLength3++}
         else if  (this.record.codeLength >= 4  && this.record.codeLength < 5  )  { this.score[this.config.articleType].codeLength4++}
         else if  (this.record.codeLength >= 5  && this.record.codeLength < 6  )  { this.score[this.config.articleType].codeLength5++}
         else if  (this.record.codeLength >= 6  && this.record.codeLength < 7  )  { this.score[this.config.articleType].codeLength6++}
         else if  (this.record.codeLength >= 7  && this.record.codeLength < 8  )  { this.score[this.config.articleType].codeLength7++}
         else if  (this.record.codeLength >= 8  && this.record.codeLength < 9  )  { this.score[this.config.articleType].codeLength8++}
         else if  (this.record.codeLength >= 9  && this.record.codeLength < 10 )  { this.score[this.config.articleType].codeLength9++}
         else if  (this.record.codeLength >= 10 && this.record.codeLength < 11 )  { this.score[this.config.articleType].codeLength10++}

         // SPEED FILTER
         if      ( this.record.speed >= 0   && this.record.speed < 60  )  { this.score[this.config.articleType].speed30++}
         else if ( this.record.speed >= 60  && this.record.speed < 90  )  { this.score[this.config.articleType].speed60++}
         else if ( this.record.speed >= 90  && this.record.speed < 120 )  { this.score[this.config.articleType].speed90++}
         else if ( this.record.speed >= 120 && this.record.speed < 150 )  { this.score[this.config.articleType].speed120++}
         else if ( this.record.speed >= 150 && this.record.speed < 180 )  { this.score[this.config.articleType].speed150++}
         else if ( this.record.speed >= 180 && this.record.speed < 210 )  { this.score[this.config.articleType].speed180++}
         else if ( this.record.speed >= 210 && this.record.speed < 240 )  { this.score[this.config.articleType].speed210++}
         else if ( this.record.speed >= 240 && this.record.speed < 270 )  { this.score[this.config.articleType].speed240++}
         else if ( this.record.speed >= 270 && this.record.speed < 300 )  { this.score[this.config.articleType].speed270++}
         else if ( this.record.speed >= 300 && this.record.speed < 330 )  { this.score[this.config.articleType].speed300++}
         else if ( this.record.speed >= 330 && this.record.speed < 360 )  { this.score[this.config.articleType].speed330++}
         else if ( this.record.speed >= 360 && this.record.speed < 390 )  { this.score[this.config.articleType].speed360++}
         else if ( this.record.speed >= 390 && this.record.speed < 420 )  { this.score[this.config.articleType].speed390++}

         // RECORD COUNT
         this.score[this.config.articleType].recordCount++

         // SAVE SCORE
         this.score.save() // 保存成绩

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
            this.record.speed = Number((this.correctWordsCount / this.duration * 1000 * 60).toFixed(2));
            $('.speed').innerText = this.record.speed;
            $('.btn-speed').innerText = this.record.speed;

            // key count
            let allKeyCount = this.keyCount.all - this.keyCount.function;
            this.record.hitRate = Number((allKeyCount / this.duration * 1000).toFixed(2));
            $('.count-key-rate').innerText = this.record.hitRate;

            // code length
            if (this.correctWordsCount) {
               this.record.codeLength = Number((allKeyCount / this.correctWordsCount).toFixed(2));
            } else {
               this.record.codeLength = 0;
            }
            $('.count-key-length').innerText = this.record.codeLength;

            // backspace count
            $('.count-key-backspace').innerText = this.keyCount.backspace;

            // StandAlone Mode Speed Info
            $('.standalone-speed-info .speed').innerText = this.record.speed;
            $('.standalone-speed-info .count-key-length').innerText = this.record.codeLength;
            $('.standalone-speed-info .count-key-rate').innerText = this.record.hitRate;
            $('.standalone-speed-info .count-key-backspace').innerText = this.keyCount.backspace;

         }

         // OPTION
         $('.chapter-current').innerText = this.config.chapter;
         $('.chapter-total').innerText = this.config.chapterTotal;


         // SCORE
         $('.score-info .title').innerText = ArticleType.getTypeNameWith(this.config.articleType);

         let currentArticleTypeScore = this.score[this.config.articleType]
         $('.score-info-item.sum-words .score').innerText = currentArticleTypeScore.wordCount.toFixed(0);
         $('.score-info-item.sum-key .score').innerText = currentArticleTypeScore.keyCount.toFixed(0);
         $('.score-info-item.sum-time .score').innerText = (currentArticleTypeScore.timeCost / 1000).toFixed(0) + 's';

         $('.score-info-item.speed-min .score').innerText = currentArticleTypeScore.speedMin.toFixed(1);
         $('.score-info-item.speed-max .score').innerText = currentArticleTypeScore.speedMax.toFixed(1);
         $('.score-info-item.speed-ave .score').innerText = currentArticleTypeScore.speedAve.toFixed(1);

         $('.score-info-item.hitrate-min .score').innerText = currentArticleTypeScore.hitRateMin.toFixed(1);
         $('.score-info-item.hitrate-max .score').innerText = currentArticleTypeScore.hitRateMax.toFixed(1);
         $('.score-info-item.hitrate-ave .score').innerText = currentArticleTypeScore.hitRateAve.toFixed(1);

         $('.score-info-item.code-length-min .score').innerText = currentArticleTypeScore.codeLengthMin.toFixed(1);
         $('.score-info-item.code-length-max .score').innerText = currentArticleTypeScore.codeLengthMax.toFixed(1);
         $('.score-info-item.code-length-ave .score').innerText = currentArticleTypeScore.codeLengthAve.toFixed(1);

         // SCORE HIT RATE 图表展示
         let hitRateScoreArray = []
         for (let i=1;i<=12;i++){
            hitRateScoreArray.push(currentArticleTypeScore[`hitRate${i}`])
         }
         let hitRateMax = Math.max(...hitRateScoreArray)

         hitRateScoreArray.forEach((hitRateScore, index) => {
            let suffix = index + 1
            let hitRate = currentArticleTypeScore[`hitRate${suffix}`]
            $(`.score-statistics-item.hitrate.level-${suffix} .process`).style.backgroundColor = generateColorForChart(hitRate, 0, hitRateMax)
            if (hitRateMax === 0){
               $(`.score-statistics-item.hitrate.level-${suffix} .process`).style.height = 0
            } else {
               $(`.score-statistics-item.hitrate.level-${suffix} .process`).style.height = `${hitRate * HEIGHT_BAR / hitRateMax}px`
            }
         })

         // CODE LENGTH 图表展示
         let codeLengthScoreArray = []
         for (let i=1;i<=10;i++){
            codeLengthScoreArray.push(currentArticleTypeScore[`hitRate${i}`])
         }
         let codeLengthMax = Math.max(...codeLengthScoreArray)

         codeLengthScoreArray.forEach((hitRateScore, index) => {
            let suffix = index + 1
            let codeLength = currentArticleTypeScore[`codeLength${suffix}`]
            $(`.score-statistics-item.codelength.level-${suffix} .process`).style.backgroundColor = generateColorForChart(codeLength, 0, codeLength)
            if(codeLengthMax === 0){
               $(`.score-statistics-item.codelength.level-${suffix} .process`).style.height = 0
            } else {
               $(`.score-statistics-item.codelength.level-${suffix} .process`).style.height = `${codeLength * HEIGHT_BAR / codeLengthMax}px`
            }
         })

         // SCORE SPEED 图表展示
         let speedScoreArray = []
         for (let i=1;i<=14;i++){
            speedScoreArray.push(currentArticleTypeScore[`speed${i*30}`])
         }
         let speedMax = Math.max(...speedScoreArray)

         speedScoreArray.forEach((speedScore, index) => {
            let suffix = (index + 1) * 3
            let speed = currentArticleTypeScore[`speed${suffix * 10}`]
            $(`.score-statistics-item.speed.level-${suffix} .process`).style.backgroundColor = generateColorForChart(speed, 0, speedMax)
            if (speedMax === 0){
               $(`.score-statistics-item.speed.level-${suffix} .process`).style.height = 0
            } else {
               $(`.score-statistics-item.speed.level-${suffix} .process`).style.height = `${speed * HEIGHT_BAR / speedMax}px`
            }
         })
      }

      // 清除某种类似文章的 某项数据
      clearScoreOf(typeOfScore){
         this.score.clearScoreFor(this.config.articleType, typeOfScore)
         this.updateInfo()
      }
   }


   // 根据数值产出对应的颜色数值
   function generateColorForChart(value, min, max){
      let redValue = 255 / (max - min) * value
      return `rgba(${redValue}, 100, 100, 1)`
   }

   function enterBigCharacterMode(){
      $('.text').classList.add('big')
      $('.template-container').classList.add('big')
      $('#pad').classList.add('big')
   }

   function leaveBigCharacterMode(){
      $('.text').classList.remove('big')
      $('.template-container').classList.remove('big')
      $('#pad').classList.remove('big')
   }

   return Engine
})
