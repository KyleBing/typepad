define(['Reg', 'ArticleType', 'Article', 'Utility'], function (Reg,ArticleType, Article, Utility){
   class Editor{
      constructor(title, content) {
         this.title = title || '';
         this.content = content || '';
         this.symbolEn =  0;
         this.symbolZh =  0;
      }
      show(config){
         $('.editor').classList.remove('hidden');
         this.title = config.customizedTitle;
         this.content = config.customizedContent;
         $('.editor-title').value = this.title;
         let content = $('.editor-content')
         content.value = this.content;
         content.style.height = (innerHeight - 60 - 70 - 32 - 30) + 'px'

         // 避免主页滚动
         let app = $('body');
         app.style.height = innerHeight + 'px';
         app.style.overflow = 'hidden';
         this.updateInfo();
      }
      done(engine){
         if (!this.content.trim()){
            let elContent = $('.editor-content');
            elContent.placeholder = '请输入内容';
            Utility.shakeDom(elContent);
            elContent.focus();
            return
         }
         if (!this.title.trim()){
            let elTitle = $('.editor-title');
            elTitle.placeholder = '请输入标题';
            Utility.shakeDom(elTitle);
            elTitle.focus();
            return
         }
         engine.config.customizedContent = this.content;
         engine.config.customizedTitle = this.title;
         engine.config.articleIdentifier = Article.customize.value;
         engine.config.articleName = this.title
         engine.config.articleType = ArticleType.customize
         engine.config.article = this.content;
         engine.config.save();
         engine.loadArticleOptions();
         engine.applyConfig();
         engine.changePerCount();
         this.hide();
      }
      hide(){
         $('.editor').classList.add('hidden');
         // 放开主页滚动
         let app = $('body');
         app.style.height = 'auto';
         app.style.overflow = 'auto';
      }

      // CONVERT SYMBOLS
      toZH(){
         Reg.TOZH.all.forEach(item => {
            this.content = this.content.replace(item.reg, item.replacement)
         })
         this.setContent();
      }
      toEN(){
         Reg.TOEN.all.forEach(item => {
            this.content = this.content.replace(item.reg, item.replacement)
         });
         this.setContent();
      }

      // REMOVE SYMBOLS
      trimSpace(){
         this.content = this.content.replace(Reg.REMOVE.space[0].reg, Reg.REMOVE.space[0].replacement);
         this.setContent();
      }
      trimReturn(){
         this.content = this.content.replace(Reg.REMOVE.return[0].reg, Reg.REMOVE.return[0].replacement);
         this.setContent();
      }

      setContent(){
         $('.editor-content').value = this.content;
         this.updateInfo();
      }

      // 更新展示数据
      updateInfo(){
         let stringSymbolChinese = this.content.match(Reg.MATCH.symbolCn);
         let stringSymbolEnglish = this.content.match(Reg.MATCH.symbolEn);
/*         let countCharacterEnglish = this.content.match(MATCH.characterEn)
         let countSpace = this.content.match(MATCH.space)
         let countTab = this.content.match(MATCH.tab)
         let countQuot = this.content.match(MATCH.quot)
         let countComma = this.content.match(MATCH.comma)*/
         this.symbolEn = stringSymbolEnglish ? stringSymbolEnglish.length: 0;
         this.symbolZh = stringSymbolChinese ? stringSymbolChinese.length: 0;
         $('#countSymbolEn').innerText = this.symbolEn;
         $('#countSymbolZh').innerText = this.symbolZh;
         $('#countCharacter').innerText = this.content ? this.content.length: 0;
      }

      changeTitle(sender){
         this.title = sender.value
      }
      changeContent(sender){
         this.content = sender.value;
         this.updateInfo();
      }
   }
   return Editor
})