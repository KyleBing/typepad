define(['Reg'], function (Reg){


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
         $('.editor-content').value = this.content;
         this.updateInfo();
      }
      done(engine){
         engine.config.customizedContent = this.content;
         engine.config.customizedTitle = this.title;
         engine.config.save();
         engine.loadArticleOptions();
         engine.applyConfig();
         this.hide();
      }
      hide(){
         $('.editor').classList.add('hidden');
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