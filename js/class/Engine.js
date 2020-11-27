define(['Article', 'Config', 'Record', 'Database'], function (
   Article, Config, Record, Database) {
   const untypedStringClassName = 'untyped-part';
   const HEIGHT_TEMPLATE = 150; // 对照区高度

   let keyCount = new KeyCount();
   let config = new Config();
   let record = new Record();
   let database = new Database()

   // 跟打器内核
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

         this.correctWordsCount    = 0;
         this.currentWords         = '';       // 当前显示的文字
         this.currentOriginWords   = [];       // 字体拆分的全部数组
         this.arrayWordAll         = [];       // 全部单词
         this.arrayWordDisplaying  = [];       // 展示的单词

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
            engine.reset();
            config.save();
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
            engine.reset();
            config.save();
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
               this.currentOriginWords = config.isShuffle ? shuffle(article.content.split('')) : article.content.split('');
               config.article = this.currentOriginWords.join('');
               engine.englishModeLeave();
               break;
            case ArticleType.article:
               config.article = article.content;
               this.currentOriginWords = config.article.split('');
               engine.englishModeLeave();
               break;
            case ArticleType.english:
               config.article = article.content;
               engine.englishModeEnter();
               this.currentOriginWords = config.article.split('');
               break;
            case ArticleType.word:
               config.article = article.content;
               engine.englishModeEnter();
               this.arrayWordAll = Article.CET4.getWordsArray();
               this.currentOriginWords = config.article.split('');
               break;
            default:
               break;
         }
         config.save();
         this.changePerCount();
      }

      // 改变数字时
      changePerCount() {
         let originTol = 0;
         config.count = $('input[type=radio]:checked').value;
         if (config.articleType === ArticleType.word) { // CET 单词时，count 为单词数
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

      enterDarkMode(sender) {
         let body = $('body');
         if (config.darkMode) {
            body.classList.remove('black');
            config.darkMode = false;
            sender.innerText = "暗黑"
            config.save();
         } else {
            body.classList.add('black');
            config.darkMode = true;
            sender.innerText = "白色"
            config.save();
         }
      }

      // 切换乱序模式
      shuffleCurrentArticle() {
         config.isShuffle = $('#mode').checked;
         if (config.articleType === ArticleType.word) {
            if (config.isShuffle) {
               this.arrayWordAll = shuffle(this.arrayWordAll);
            } else {
               this.arrayWordAll = gettWordsArrayWith(Article[config.articleIdentifier].content);
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
         } else {
            this.currentOriginWords = config.isShuffle ? shuffle(Article[config.articleIdentifier].content.split('')) : Article[config.articleIdentifier].content.split('');
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
      wordsShuffle() {
         if (config.articleType !== ArticleType.english && config.articleType !== ArticleType.word) {
            let array = this.currentWords.split('');
            this.currentWords = shuffle(array).join('');
            template.innerText = this.currentWords;
            engine.reset();
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
         this.updateInfo();
         database.insert(record);
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

         // SPEED
         if (!this.isStarted && !this.isFinished) {
            $('.speed').innerText = '--';
            $('.btn-speed').innerText = '--';
            $('.count-key-rate').innerText = '--';
            $('.count-key-length').innerText = '--';
            $('.count-key-backspace').innerText = '--';

         } else {
            // speed
            record.speed = (this.correctWordsCount / engine.duration * 1000 * 60).toFixed(2);
            $('.speed').innerText = record.speed;
            $('.btn-speed').innerText = record.speed;

            // key count
            let allKeyCount = keyCount.all - keyCount.function;
            record.hitRate = (allKeyCount / engine.duration * 1000).toFixed(2);
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
   return Engine
})