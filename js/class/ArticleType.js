const ArticleType = {
   character: 'character',
   article: 'article',
   english: 'english',
   word: 'word',
   getTypeNameWith(type){
      switch (type) {
         case this.article    : return '文章';
         case this.english    : return '英文';
         case this.character  : return '单字';
         case this.word       : return '单词';
         default:break;
      }
   }
}

define(function () {
   return ArticleType
})