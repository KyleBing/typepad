/**
 * 文章类别
 * @type {{character: string, english: string, word: string, getTypeNameWith(*): (string), article: string}}
 */

define(function () {
   return {
      // 这里的顺序，决定在界面中 select>option 中展示的顺序
      character : 'character',
      article   : 'article',
      phrase    : 'phrase',
      english   : 'english',
      word      : 'word',
      customize : 'customize',
      getTypeNameWith(type){
         switch (type) {
            case this.article    : return '文章';
            case this.character  : return '单字';
            case this.phrase     : return '词条';
            case this.word       : return '英文单词';
            case this.english    : return '英文文章';
            case this.customize  : return '自定义';
            default:break;
         }
      }
   }
})
